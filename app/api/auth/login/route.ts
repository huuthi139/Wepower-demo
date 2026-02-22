import { NextResponse } from 'next/server';

const SHEET_ID = '1gfLd8IwgattNDYrluU4GmitZk_IuXcn6OQqRn0hLpjM';
// Tab "Đăng ký" trong Google Sheets
const SHEET_NAME = 'Đăng ký';

function getSheetUrl(sheetName: string): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header line properly (same as data rows - handle quoted values)
  const headerValues: string[] = [];
  let hCurrent = '';
  let hInQuotes = false;
  for (let j = 0; j < lines[0].length; j++) {
    const char = lines[0][j];
    if (char === '"') {
      hInQuotes = !hInQuotes;
    } else if (char === ',' && !hInQuotes) {
      headerValues.push(hCurrent.trim());
      hCurrent = '';
    } else {
      hCurrent += char;
    }
  }
  headerValues.push(hCurrent.trim());
  const headers = headerValues;
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
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

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

// Tìm giá trị cột - hỗ trợ cả tên tiếng Việt
function getCol(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== '') return row[key];
  }
  return '';
}

// Kiểm tra giá trị có phải admin không - hỗ trợ cả tiếng Việt và tiếng Anh
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
      console.log('[Login] Using Apps Script method');
      try {
        const res = await fetch(process.env.GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email, password }),
        });

        const data = await res.json();
        console.log('[Login Apps Script] Response:', JSON.stringify(data));

        if (data.success) {
          // Chuẩn hóa role từ Apps Script - hỗ trợ tiếng Việt
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
        // Fall through to CSV method
      }
    } else {
      console.log('[Login] No GOOGLE_SCRIPT_URL configured, skipping Apps Script');
    }

    // Method 2: Đọc CSV trực tiếp từ Google Sheets (fallback)
    console.log('[Login] Trying CSV method from Google Sheets');
    try {
      const res = await fetch(getSheetUrl(SHEET_NAME), { cache: 'no-store' });
      const csv = await res.text();
      console.log('[Login CSV] Response status:', res.status, 'CSV length:', csv.length);
      const users = parseCSV(csv);
      console.log('[Login CSV] Parsed', users.length, 'users. Headers:', users.length > 0 ? Object.keys(users[0]) : 'none');

      // Tìm user theo email
      const user = users.find(
        u => getCol(u, 'Email', 'email').toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Email không tồn tại trong hệ thống' },
          { status: 401 }
        );
      }

      // Kiểm tra mật khẩu
      const userPassword = getCol(user, 'Password', 'Mật khẩu');
      if (userPassword !== password) {
        return NextResponse.json(
          { success: false, error: 'Mật khẩu không đúng' },
          { status: 401 }
        );
      }

      // Trả về user data
      const roleValue = getCol(user, 'Role', 'Vai trò');
      const memberLevel = getCol(user, 'Level', 'Hạng thành viên', 'MemberLevel');

      console.log('[Login CSV] User found:', {
        email: getCol(user, 'Email'),
        roleValue,
        memberLevel,
        allKeys: Object.keys(user),
      });

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
      // Method 3: Demo mode
      console.log('[Login] CSV method failed, falling back to demo mode. Error:', csvError);
      const demoAccounts = [
        { email: 'admin@wepower.vn', password: 'admin123', name: 'Admin WePower', role: 'admin' as const, memberLevel: 'VIP' as const, phone: '' },
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
