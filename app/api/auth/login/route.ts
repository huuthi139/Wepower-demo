import { NextResponse } from 'next/server';

const SHEET_ID = '1gfLd8IwgattNDYrluU4GmitZk_IuXcn6OQqRn0hLpjM';

function getSheetUrl(sheetName: string): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
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
        const res = await fetch(process.env.GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email, password }),
        });

        const data = await res.json();

        if (data.success) {
          return NextResponse.json({ success: true, user: data.user });
        }

        return NextResponse.json(
          { success: false, error: data.error || 'Đăng nhập thất bại' },
          { status: 401 }
        );
      } catch (err) {
        console.error('Apps Script login error:', err);
        // Fall through to CSV method
      }
    }

    // Method 2: Đọc CSV trực tiếp từ Google Sheets (fallback)
    try {
      const res = await fetch(getSheetUrl('Users'), { cache: 'no-store' });
      const csv = await res.text();
      const users = parseCSV(csv);

      const user = users.find(
        u => u['Email']?.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Email không tồn tại trong hệ thống' },
          { status: 401 }
        );
      }

      if (user['Password'] !== password) {
        return NextResponse.json(
          { success: false, error: 'Mật khẩu không đúng' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          name: user['Name'] || user['Họ tên'] || '',
          email: user['Email'] || '',
          phone: user['Phone'] || user['Số điện thoại'] || '',
          role: (user['Role'] || user['Vai trò'] || 'user').toLowerCase() === 'admin' ? 'admin' : 'user',
          memberLevel: (['Free', 'Premium', 'VIP'].includes(user['MemberLevel'] || user['Hạng'] || '')
            ? (user['MemberLevel'] || user['Hạng'])
            : 'Free'),
        },
      });
    } catch {
      // Method 3: Demo mode
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
