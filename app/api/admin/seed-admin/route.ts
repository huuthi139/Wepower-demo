/**
 * POST /api/admin/seed-admin - Create default admin account if not exists
 * This endpoint creates an admin user with default credentials.
 * Should be called once during initial setup.
 */
import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth/password';
import { getUserByEmail, createUserProfile } from '@/lib/supabase/users';

const DEFAULT_ADMIN_EMAIL = 'admin@wedu.vn';
const DEFAULT_ADMIN_PASSWORD = 'Admin@123';
const DEFAULT_ADMIN_NAME = 'Admin WEDU';

export async function POST() {
  try {
    // Check if admin already exists
    const existing = await getUserByEmail(DEFAULT_ADMIN_EMAIL);
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Tài khoản admin đã tồn tại',
        email: DEFAULT_ADMIN_EMAIL,
        alreadyExists: true,
      });
    }

    // Create admin account
    const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
    await createUserProfile({
      email: DEFAULT_ADMIN_EMAIL,
      name: DEFAULT_ADMIN_NAME,
      passwordHash,
      role: 'admin',
      memberLevel: 'VIP',
    });

    return NextResponse.json({
      success: true,
      message: 'Tạo tài khoản admin thành công!',
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      note: 'Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu.',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[seed-admin] Error:', msg);
    return NextResponse.json(
      {
        success: false,
        error: msg,
        hint: 'Kiểm tra bảng users đã tồn tại chưa. Gọi GET /api/admin/setup-db để kiểm tra.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Gọi POST /api/admin/seed-admin để tạo tài khoản admin mặc định.',
    credentials: {
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
    },
  });
}
