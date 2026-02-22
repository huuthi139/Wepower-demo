import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

const SHEET_ID = '1gfLd8IwgattNDYrluU4GmitZk_IuXcn6OQqRn0hLpjM';
const SHEET_NAME = 'Đăng ký';

function getSheetUrl(sheetName: string): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

// Dùng curl thay vì fetch (Node.js DNS không resolve được Google)
function curlFetch(url: string): string {
  return execSync(`curl -sL "${url}"`, { timeout: 15000, encoding: 'utf-8' });
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseRow(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

function getCol(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== '') return row[key];
  }
  return '';
}

function isAdminRole(roleValue: string): boolean {
  const normalized = roleValue.toLowerCase().trim();
  const adminValues = ['admin', 'administrator', 'quản trị', 'quản trị viên', 'qtv'];
  return adminValues.some(v => normalized.includes(v));
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email và mật khẩu không được để trống' },
        { status: 400 }
      );
    }

    // Method 1: Google Apps Script (ưu tiên)
    if (process.env.GOOGLE_SCRIPT_URL) {
      try {
        const resText = execSync(`curl -sL -X POST -H "Content-Type: application/json" -d '${JSON.stringify({ action: 'login', email, password })}' "${process.env.GOOGLE_SCRIPT_URL}"`, { timeout: 15000, encoding: 'utf-8' });
        const data = JSON.parse(resText);

        if (data.success) {
          const user = data.user;
          if (user && user.role) {
            user.role = isAdminRole(user.role) ? 'admin' : 'user';
          }
          return NextResponse.json({ success: true, user });
        }

        return NextResponse.json(
          { success: false, error: data.error || 'Đăng nhập thất bại' },
          { status: 401 }
        );
      } catch (err) {
        console.error('Apps Script login error:', err);
      }
    }

    // Method 2: Đọc CSV từ Google Sheets (dùng curl)
    try {
      const csv = curlFetch(getSheetUrl(SHEET_NAME));
      const users = parseCSV(csv);
      console.log('[Login CSV] Parsed', users.length, 'users. Headers:', users.length > 0 ? Object.keys(users[0]) : 'none');

      const user = users.find(
        u => getCol(u, 'Email', 'email').toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Email không tồn tại trong hệ thống' },
          { status: 401 }
        );
      }

      const userPassword = getCol(user, 'Password', 'Mật khẩu');
      if (userPassword !== password) {
        return NextResponse.json(
          { success: false, error: 'Mật khẩu không đúng' },
          { status: 401 }
        );
      }

      const roleValue = getCol(user, 'Role', 'Vai trò');
      const memberLevel = getCol(user, 'Level', 'Hạng thành viên', 'MemberLevel');

      console.log('[Login CSV] User found:', { email, roleValue, memberLevel });

      return NextResponse.json({
        success: true,
        user: {
          name: getCol(user, 'Tên', 'Họ và tên', 'Họ tên', 'Name'),
          email: getCol(user, 'Email'),
          phone: getCol(user, 'Phone', 'Số điện thoại', 'SĐT'),
          role: isAdminRole(roleValue) ? 'admin' : 'user',
          memberLevel: (['Free', 'Premium', 'VIP'].includes(memberLevel) ? memberLevel : 'Free'),
        },
      });
    } catch (csvError) {
      console.log('[Login] CSV failed, using demo mode. Error:', csvError);

      // Method 3: Demo mode
      const demoAccounts = [
        { email: 'admin@wepower.vn', password: '123456', name: 'Admin WePower', role: 'admin' as const, memberLevel: 'VIP' as const, phone: '' },
        { email: 'user@wepower.vn', password: 'user123', name: 'Học viên Demo', role: 'user' as const, memberLevel: 'Free' as const, phone: '' },
        { email: 'premium@wepower.vn', password: 'premium123', name: 'Học viên Premium', role: 'user' as const, memberLevel: 'Premium' as const, phone: '' },
        { email: 'vip@wepower.vn', password: 'vip123', name: 'Học viên VIP', role: 'user' as const, memberLevel: 'VIP' as const, phone: '' },
      ];

      const demoUser = demoAccounts.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (demoUser) {
        return NextResponse.json({
          success: true,
          user: {
            name: demoUser.name,
            email: demoUser.email,
            phone: demoUser.phone,
            role: demoUser.role,
            memberLevel: demoUser.memberLevel,
          },
          mode: 'demo',
        });
      }

      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi hệ thống. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
