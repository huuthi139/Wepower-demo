import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getCourseAccessByUser } from '@/lib/supabase/course-access';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { courseAccessRowToFrontend } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/course-access
 * Returns all course access records for the authenticated user.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Get user ID from session
  const supabase = getSupabaseAdmin();
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.email.toLowerCase())
    .limit(1)
    .single();

  if (!user) {
    return NextResponse.json({ success: true, accessList: [] });
  }

  const rows = await getCourseAccessByUser(user.id);
  const accessList = rows.map(courseAccessRowToFrontend);

  return NextResponse.json({ success: true, accessList });
}
