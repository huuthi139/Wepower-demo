import { NextRequest, NextResponse } from 'next/server';
import { hasAdminAccess } from '@/lib/utils/auth';

const GAS_TIMEOUT = 20000;

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('wedu-token')?.value;
    if (!token) return false;
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) return false;
    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const role = (payload as { role?: string }).role || '';
    return hasAdminAccess(role);
  } catch {
    return false;
  }
}

/**
 * POST /api/admin/sync-users
 * One-way sync: Google Sheets → Supabase (upsert only, never delete)
 * Admin only. Reads all users from Google Sheets and upserts into Supabase.
 */
export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Không có quyền truy cập' },
      { status: 403 }
    );
  }

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    return NextResponse.json(
      { success: false, error: 'GOOGLE_SCRIPT_URL chưa được cấu hình' },
      { status: 500 }
    );
  }

  // Step 1: Fetch all users from Google Sheets
  let sheetUsers: Array<Record<string, string>> = [];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GAS_TIMEOUT);
    const res = await fetch(`${scriptUrl}?action=getUsers`, {
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('json') && !ct.includes('javascript')) {
      return NextResponse.json(
        { success: false, error: 'Google Sheets trả về dữ liệu không hợp lệ' },
        { status: 502 }
      );
    }

    const data = await res.json();
    if (!data?.success || !Array.isArray(data.users)) {
      return NextResponse.json(
        { success: false, error: 'Không thể đọc danh sách từ Google Sheets' },
        { status: 502 }
      );
    }

    sheetUsers = data.users;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Lỗi kết nối Google Sheets: ${msg}` },
      { status: 502 }
    );
  }

  if (sheetUsers.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'Google Sheets không có học viên nào',
      stats: { total: 0, added: 0, updated: 0, skipped: 0 },
    });
  }

  // Step 2: One-way sync to Supabase (upsert only, never delete)
  try {
    const { syncSheetUsersToSupabase } = await import('@/lib/supabase/users');
    const mapped = sheetUsers.map((u) => ({
      email: u.Email || u.email || '',
      name: u['Tên'] || u.name || '',
      phone: u.Phone || u.phone || '',
      role: u.Role || u.role || 'user',
      memberLevel: u.Level || u.memberLevel || 'Free',
      passwordHash: u.Password || u.passwordHash || '',
    }));

    const stats = await syncSheetUsersToSupabase(mapped);

    return NextResponse.json({
      success: true,
      message: `Đồng bộ hoàn tất: ${stats.added} thêm mới, ${stats.updated} cập nhật, ${stats.skipped} bỏ qua`,
      stats: {
        total: sheetUsers.length,
        ...stats,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Lỗi đồng bộ Supabase: ${msg}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync-users
 * Check current user count in both systems (no mutation)
 */
export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Không có quyền truy cập' },
      { status: 403 }
    );
  }

  let supabaseCount = 0;
  let sheetCount = 0;

  // Count Supabase users
  try {
    const { getAllUsers } = await import('@/lib/supabase/users');
    const users = await getAllUsers();
    supabaseCount = users.length;
  } catch {}

  // Count Google Sheet users
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (scriptUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${scriptUrl}?action=getUsers`, {
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (data?.success && Array.isArray(data.users)) {
        sheetCount = data.users.length;
      }
    } catch {}
  }

  return NextResponse.json({
    success: true,
    supabaseCount,
    sheetCount,
    synced: supabaseCount >= sheetCount,
    supabaseDashboard: `https://supabase.com/dashboard/project/${(process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace('https://', '').replace('.supabase.co', '')}/editor/table/users`,
  });
}
