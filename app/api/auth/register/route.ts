import { NextResponse } from 'next/server';

const SHEET_ID = '1KOuhPurnWcHOayeRn7r-hNgVl13Zf7Q0z0r4d1-K0JY';
// Tab "Users" trong Google Sheets
const SHEET_NAME = 'Users';

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
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    // Method 1: Google Apps Script (ưu tiên)
    if (process.env.GOOGLE_SCRIPT_URL) {
      try {
        const res = await fetch(process.env.GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            name,
            email,
            password,
            phone: phone || '',
          }),
        });

        const data = await res.json();

        if (data.success) {
          return NextResponse.json({ success: true, user: data.user });
        }

        return NextResponse.json(
          { success: false, error: data.error || 'Đăng ký thất bại' },
          { status: data.error?.includes('đã được sử dụng') ? 409 : 400 }
        );
      } catch (err) {
        console.error('Apps Script register error:', err);
      }
    }

    // Method 2: Check email via CSV + write via Sheets API
    try {
      const csvRes = await fetch(getSheetUrl(SHEET_NAME), { cache: 'no-store' });
      const csv = await csvRes.text();
      const users = parseCSV(csv);

      const existingUser = users.find(
        u => (u['Email'] || '').toLowerCase() === email.toLowerCase()
      );

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email đã được sử dụng. Vui lòng dùng email khác.' },
          { status: 409 }
        );
      }
    } catch {
      // Can't check, continue
    }

    // Row data thứ tự khớp headers thực tế: Email | Password | Role | Tên | Level | Enrolled | Completed | Phone
    const rowData = [email, password, 'Student', name, 'Free', '', '', phone || ''];

    let written = false;
    if (process.env.GOOGLE_SHEETS_API_KEY) {
      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}!A:H:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS&key=${process.env.GOOGLE_SHEETS_API_KEY}`;
      const res = await fetch(appendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [rowData] }),
      });
      if (res.ok) written = true;
    }

    if (!written) {
      console.log(`[Demo Mode] New user registered:`, rowData);
    }

    return NextResponse.json({
      success: true,
      user: { name, email, phone: phone || '', role: 'user', memberLevel: 'Free' },
      mode: written ? 'live' : 'demo',
    });
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi hệ thống. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
