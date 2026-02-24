import { NextResponse } from 'next/server';

const SHEET_ID = '1KOuhPurnWcHOayeRn7r-hNgVl13Zf7Q0z0r4d1-K0JY';

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

export async function GET() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Courses`;
    const res = await fetch(url, { cache: 'no-store' });
    const csv = await res.text();
    const rows = parseCSV(csv);

    const courses = rows
      .filter(r => r['ID'] && r['Title'])
      .map(r => ({
        id: r['ID'] || '',
        thumbnail: r['Thumbnail'] || '',
        title: r['Title'] || '',
        instructor: r['Instructor'] || 'WePower Academy',
        price: Number(r['Price']) || 0,
        originalPrice: r['OriginalPrice'] ? Number(r['OriginalPrice']) : undefined,
        rating: Number(r['Rating']) || 0,
        reviewsCount: Number(r['ReviewsCount']) || 0,
        enrollmentsCount: Number(r['EnrollmentsCount']) || 0,
        duration: Number(r['Duration']) || 0,
        lessonsCount: Number(r['LessonsCount']) || 0,
        isFree: (r['Price'] || '0') === '0',
        badge: r['Badge'] || undefined,
        category: r['Category'] || '',
        memberLevel: r['MemberLevel'] || 'Free',
      }));

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json({ success: true, courses: [] });
  }
}
