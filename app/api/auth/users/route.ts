import { NextResponse } from 'next/server';

const SHEET_ID = '1KOuhPurnWcHOayeRn7r-hNgVl13Zf7Q0z0r4d1-K0JY';

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

export async function GET() {
  try {
    // Method 1: Google Apps Script
    if (process.env.GOOGLE_SCRIPT_URL) {
      try {
        const params = new URLSearchParams({ action: 'getUsers' });
        const res = await fetch(`${process.env.GOOGLE_SCRIPT_URL}?${params.toString()}`, {
          redirect: 'follow',
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.success && data.users) {
          return NextResponse.json({ success: true, users: data.users });
        }
      } catch (err) {
        console.error('Apps Script getUsers error:', err);
      }
    }

    // Method 2: CSV fallback
    try {
      const csvRes = await fetch(getSheetUrl('Users'), { cache: 'no-store' });
      const csv = await csvRes.text();
      const rows = parseCSV(csv);

      const users = rows.map(row => ({
        Email: row['Email'] || '',
        Role: row['Role'] || 'Student',
        'Tên': row['Tên'] || '',
        Level: row['Level'] || 'Free',
        Phone: row['Phone'] || '',
      }));

      return NextResponse.json({ success: true, users });
    } catch (err) {
      console.error('CSV getUsers error:', err);
    }

    return NextResponse.json({ success: true, users: [] });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
