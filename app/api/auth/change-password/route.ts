import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { getSupabaseAdmin } from '@/lib/supabase/client';

const SESSION_COOKIE = 'wedu-token';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return NextResponse.json(
      { success: false, error: 'Mật khẩu mới phải có ít nhất 8 ký tự' },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();

  // If NOT a forced change, require current password verification
  if (!session.mustChangePassword) {
    if (!currentPassword) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập mật khẩu hiện tại' },
        { status: 400 },
      );
    }

    const { data: userRow } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', session.userId)
      .single();

    if (!userRow) {
      return NextResponse.json({ success: false, error: 'Người dùng không tồn tại' }, { status: 404 });
    }

    const isValid = await verifyPassword(currentPassword, userRow.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu hiện tại không đúng' },
        { status: 400 },
      );
    }
  }

  const hashed = await hashPassword(newPassword);

  const { error } = await supabase
    .from('users')
    .update({
      password_hash: hashed,
      must_change_password: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', session.userId);

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật mật khẩu' },
      { status: 500 },
    );
  }

  // Re-sign JWT with mustChangePassword: false
  const token = await signToken({
    userId: session.userId,
    email: session.email,
    role: session.role,
    name: session.name,
    level: session.level,
    mustChangePassword: false,
  });

  const response = NextResponse.json({ success: true, message: 'Đổi mật khẩu thành công' });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return response;
}
