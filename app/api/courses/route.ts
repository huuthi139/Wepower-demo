import { NextResponse } from 'next/server';

const SHEET_ID = '1KOuhPurnWcHOayeRn7r-hNgVl13Zf7Q0z0r4d1-K0JY';

// Column positions in Google Sheet (0-indexed)
// Actual data order: ID, Title, Description, Thumbnail, Instructor, Price, OriginalPrice, Rating, ReviewsCount, EnrollmentsCount, Duration, LessonsCount, Badge, Category, MemberLevel
const COL = {
  ID: 0,
  TITLE: 1,
  DESCRIPTION: 2,
  THUMBNAIL: 3,
  INSTRUCTOR: 4,
  PRICE: 5,
  ORIGINAL_PRICE: 6,
  RATING: 7,
  REVIEWS_COUNT: 8,
  ENROLLMENTS_COUNT: 9,
  DURATION: 10,
  LESSONS_COUNT: 11,
  BADGE: 12,
  CATEGORY: 13,
  MEMBER_LEVEL: 14,
};

function parseCSVRow(line: string): string[] {
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
}

function parseCSVRows(csv: string): string[][] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  // Skip header row (index 0), parse data rows
  return lines.slice(1).map(line => parseCSVRow(line));
}

export async function GET() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Courses`;
    const res = await fetch(url, { cache: 'no-store' });
    const csv = await res.text();
    const rows = parseCSVRows(csv);

    const courses = rows
      .filter(cols => cols[COL.ID] && cols[COL.TITLE])
      .map(cols => {
        const price = Number(cols[COL.PRICE]?.replace(/,/g, '')) || 0;
        const originalPrice = cols[COL.ORIGINAL_PRICE] ? Number(cols[COL.ORIGINAL_PRICE]?.replace(/,/g, '')) : undefined;
        const rating = Number(cols[COL.RATING]?.replace(',', '.')) || 0;

        return {
          id: cols[COL.ID] || '',
          thumbnail: cols[COL.THUMBNAIL] || '',
          title: cols[COL.TITLE] || '',
          description: cols[COL.DESCRIPTION] || '',
          instructor: cols[COL.INSTRUCTOR] || 'WePower Academy',
          price,
          originalPrice,
          rating,
          reviewsCount: Number(cols[COL.REVIEWS_COUNT]) || 0,
          enrollmentsCount: Number(cols[COL.ENROLLMENTS_COUNT]) || 0,
          duration: Number(cols[COL.DURATION]) || 0,
          lessonsCount: Number(cols[COL.LESSONS_COUNT]) || 0,
          isFree: price === 0,
          badge: cols[COL.BADGE] || undefined,
          category: cols[COL.CATEGORY] || '',
          memberLevel: cols[COL.MEMBER_LEVEL] || 'Free',
        };
      });

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json({ success: true, courses: [] });
  }
}
