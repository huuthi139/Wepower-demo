import { NextResponse } from 'next/server';

const SHEET_ID = '1KOuhPurnWcHOayeRn7r-hNgVl13Zf7Q0z0r4d1-K0JY';
const SHEET_NAME = 'Users';
const FALLBACK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykh_Id91EZesQ0kC1Mn15zEPC2f3oxTxR1xPcDY484gJnlWhNW0toE2v75NG2lVQgo/exec';

function getSheetUrl(sheetName: string): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
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

    // Method 1: Google Apps Script via GET
    const gsScriptUrl = process.env.GOOGLE_SCRIPT_URL || FALLBACK_SCRIPT_URL;
    try {
      const params = new URLSearchParams({ action: 'login', email, password });
      const scriptUrl = `${gsScriptUrl}?${params.toString()}`;
        const res = await fetch(scriptUrl, { redirect: 'follow' });
        const data = await res.json();

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

    // Method 2: Đọc CSV từ Google Sheets
    try {
      const csvRes = await fetch(getSheetUrl(SHEET_NAME), { cache: 'no-store' });
      const csv = await csvRes.text();
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
      console.error('[Login] CSV failed:', csvError);
      return NextResponse.json(
        { success: false, error: 'Không thể kết nối đến hệ thống. Vui lòng thử lại sau.' },
        { status: 503 }
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
