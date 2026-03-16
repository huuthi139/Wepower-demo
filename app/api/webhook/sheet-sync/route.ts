import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/webhook/sheet-sync
 * Webhook endpoint for Google Apps Script to call when Sheet data changes.
 * Syncs users from Google Sheets → Supabase automatically.
 *
 * Auth: Uses SYNC_SECRET header instead of JWT (Apps Script can't hold JWT sessions)
 *
 * Body format:
 * { action: "syncAll" }                    → Full sync all users from Sheet
 * { action: "syncOne", user: {...} }       → Sync single user
 * { action: "syncBatch", users: [...] }    → Sync batch of users
 * { action: "deleteOne", email: "..." }    → Delete user from Supabase
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Sync-Secret',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function verifySyncSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-sync-secret');
  const expected = process.env.SYNC_SECRET;
  if (!expected || expected.length < 16) {
    console.error('[Webhook] SYNC_SECRET not configured or too short');
    return false;
  }
  return secret === expected;
}

export async function POST(request: NextRequest) {
  // Verify sync secret
  if (!verifySyncSecret(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const body = await request.json();
    const action = body.action || 'syncAll';

    switch (action) {
      case 'syncAll':
        return await handleSyncAll();

      case 'syncOne':
        return await handleSyncOne(body.user);

      case 'syncBatch':
        return await handleSyncBatch(body.users);

      case 'deleteOne':
        return await handleDeleteOne(body.email);

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400, headers: CORS_HEADERS }
        );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Webhook] Error:', msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * Full sync: fetch all users from Google Sheet via Apps Script, then upsert to Supabase
 */
async function handleSyncAll() {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    return NextResponse.json(
      { success: false, error: 'GOOGLE_SCRIPT_URL not configured' },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  // Fetch all users from Sheet (including password for sync)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(`${scriptUrl}?action=getUsersForSync`, {
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json();
    if (!data?.success || !Array.isArray(data.users)) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users from Sheet' },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    const { syncSheetUsersToSupabase } = await import('@/lib/supabase/users');
    const mapped = data.users.map((u: Record<string, string>) => ({
      email: u.Email || u.email || '',
      name: u['Tên'] || u.name || '',
      phone: u.Phone || u.phone || '',
      role: mapRole(u.Role || u.role || ''),
      memberLevel: u.Level || u.memberLevel || 'Free',
      passwordHash: u.Password || u.passwordHash || '',
    }));

    const stats = await syncSheetUsersToSupabase(mapped);

    console.log(`[Webhook] Full sync complete: added=${stats.added}, updated=${stats.updated}, skipped=${stats.skipped}`);
    return NextResponse.json({
      success: true,
      message: `Synced: ${stats.added} added, ${stats.updated} updated, ${stats.skipped} skipped`,
      stats,
    }, { headers: CORS_HEADERS });
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

/**
 * Sync single user from Sheet edit
 */
async function handleSyncOne(user: Record<string, string> | undefined) {
  if (!user || !user.email) {
    return NextResponse.json(
      { success: false, error: 'Missing user data' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { syncSheetUsersToSupabase } = await import('@/lib/supabase/users');
  const mapped = [{
    email: user.email || '',
    name: user.name || '',
    phone: user.phone || '',
    role: mapRole(user.role || ''),
    memberLevel: user.memberLevel || 'Free',
    passwordHash: user.passwordHash || '',
  }];

  const stats = await syncSheetUsersToSupabase(mapped);

  console.log(`[Webhook] Single user sync: ${user.email} → added=${stats.added}, updated=${stats.updated}`);
  return NextResponse.json({
    success: true,
    message: `User ${user.email} synced`,
    stats,
  }, { headers: CORS_HEADERS });
}

/**
 * Sync batch of users
 */
async function handleSyncBatch(users: Array<Record<string, string>> | undefined) {
  if (!users || !Array.isArray(users) || users.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Missing or empty users array' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { syncSheetUsersToSupabase } = await import('@/lib/supabase/users');
  const mapped = users.map((u) => ({
    email: u.email || '',
    name: u.name || '',
    phone: u.phone || '',
    role: mapRole(u.role || ''),
    memberLevel: u.memberLevel || 'Free',
    passwordHash: u.passwordHash || '',
  }));

  const stats = await syncSheetUsersToSupabase(mapped);

  console.log(`[Webhook] Batch sync: ${users.length} users → added=${stats.added}, updated=${stats.updated}`);
  return NextResponse.json({
    success: true,
    message: `Batch synced: ${stats.added} added, ${stats.updated} updated, ${stats.skipped} skipped`,
    stats,
  }, { headers: CORS_HEADERS });
}

/**
 * Delete a user from Supabase (when deleted from Sheet)
 */
async function handleDeleteOne(email: string | undefined) {
  if (!email) {
    return NextResponse.json(
      { success: false, error: 'Missing email' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { getSupabaseAdmin } = await import('@/lib/supabase/client');
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('email', email.toLowerCase().trim());

  if (error) {
    return NextResponse.json(
      { success: false, error: `Failed to delete: ${error.message}` },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  console.log(`[Webhook] Deleted user from Supabase: ${email}`);
  return NextResponse.json({
    success: true,
    message: `User ${email} deleted from Supabase`,
  }, { headers: CORS_HEADERS });
}

/**
 * Map Google Sheet role to Supabase role
 */
function mapRole(role: string): string {
  const r = role.toLowerCase().trim();
  if (r === 'admin' || r === 'administrator' || r.includes('quản trị') || r === 'qtv') return 'admin';
  if (r === 'sub_admin' || r === 'sub admin') return 'sub_admin';
  if (r === 'instructor' || r === 'giảng viên') return 'instructor';
  return 'user';
}
