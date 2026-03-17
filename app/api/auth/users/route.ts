import { requireAdmin, AuthError } from '@/lib/auth/guards';
import { getAllUsers } from '@/lib/supabase/users';
import { apiSuccess, ERR } from '@/lib/api/response';
import { NextResponse } from 'next/server';

async function handleFetchUsers() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      return error.status === 401 ? ERR.UNAUTHORIZED() : ERR.FORBIDDEN();
    }
    return ERR.UNAUTHORIZED();
  }

  try {
    const allUsers = await getAllUsers();

    const users = allUsers.map(u => ({
      Email: u.email || '',
      Role: u.role || 'user',
      'Tên': u.name || '',
      Level: u.member_level || 'Free',
      Phone: u.phone || '',
    }));

    return apiSuccess({ users, source: 'supabase' });
  } catch (err) {
    // Supabase failed - return error with fallback URLs so client can try directly
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Database unavailable',
      users: [],
      fallback: {
        gasUrl: process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '',
        sheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '',
      },
    });
  }
}

export async function GET() {
  return handleFetchUsers();
}

export async function POST() {
  return handleFetchUsers();
}
