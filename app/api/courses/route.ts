import { NextResponse } from 'next/server';

// Force dynamic - không cache static lúc build
export const dynamic = 'force-dynamic';

const SHEET_ID = '1KOuhPurnWcHOayeRn7r-hNgVl13Zf7Q0z0r4d1-K0JY';
const FALLBACK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykh_Id91EZesQ0kC1Mn15zEPC2f3oxTxR1xPcDY484gJnlWhNW0toE2v75NG2lVQgo/exec';

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

// Parse duration string "MM:SS" to seconds
function parseDurationToSeconds(duration: string): number {
  if (!duration) return 0;
  const parts = duration.split(':');
  if (parts.length === 2) {
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  }
  return parseInt(duration, 10) || 0;
}

// Fetch real chapter stats from Google Apps Script
async function fetchChapterStats(): Promise<Record<string, { lessonsCount: number; duration: number }>> {
  try {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL || FALLBACK_SCRIPT_URL;
    const qs = new URLSearchParams({ action: 'getAllChapters' });
    const res = await fetch(`${scriptUrl}?${qs.toString()}`, {
      redirect: 'follow',
      cache: 'no-store',
    });
    const data = await res.json();
    if (data.success && data.data) {
      const stats: Record<string, { lessonsCount: number; duration: number }> = {};
      for (const [courseId, chapters] of Object.entries(data.data)) {
        const chapterArr = chapters as any[];
        let totalLessons = 0;
        let totalDuration = 0;
        for (const ch of chapterArr) {
          const lessons = ch.lessons || [];
          totalLessons += lessons.length;
          for (const ls of lessons) {
            totalDuration += parseDurationToSeconds(ls.duration || '');
          }
        }
        stats[courseId] = { lessonsCount: totalLessons, duration: totalDuration };
      }
      return stats;
    }
  } catch (err) {
    console.error('Failed to fetch chapter stats:', err);
  }
  return {};
}

// Fetch real enrollment count from Orders tab
async function fetchEnrollmentCounts(): Promise<Record<string, number>> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Orders`;
    const res = await fetch(url, { cache: 'no-store' });
    const csv = await res.text();
    const rows = parseCSVRows(csv);
    // Orders columns: Thời gian | Mã đơn hàng | Tên khách hàng | Email | SĐT | Khóa học | Mã khóa học (idx 6) | Tổng tiền | PTTT | Trạng thái (idx 9) | Mã GD
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const courseId = (row[6] || '').trim();
      const status = (row[9] || '').trim();
      // Count all orders (or only completed ones if status filter is needed)
      if (courseId) {
        if (!status || status.toLowerCase().includes('hoàn thành') || status.toLowerCase().includes('hoan thanh') || status === 'completed') {
          counts[courseId] = (counts[courseId] || 0) + 1;
        }
      }
    }
    return counts;
  } catch (err) {
    console.error('Failed to fetch enrollment counts:', err);
  }
  return {};
}

export async function GET() {
  try {
    // Fetch courses, chapter stats, and enrollment counts in parallel
    const [coursesRes, chapterStats, enrollmentCounts] = await Promise.all([
      fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Courses`, { cache: 'no-store' }),
      fetchChapterStats(),
      fetchEnrollmentCounts(),
    ]);

    const csv = await coursesRes.text();
    const rows = parseCSVRows(csv);

    const courses = rows
      .filter(cols => cols[COL.ID] && cols[COL.TITLE])
      .map(cols => {
        const id = cols[COL.ID] || '';
        const price = Number(cols[COL.PRICE]?.replace(/,/g, '')) || 0;
        const originalPrice = cols[COL.ORIGINAL_PRICE] ? Number(cols[COL.ORIGINAL_PRICE]?.replace(/,/g, '')) : undefined;
        const rating = Number(cols[COL.RATING]?.replace(',', '.')) || 0;

        // Use real stats from chapters if available, otherwise 0
        const realStats = chapterStats[id];
        const lessonsCount = realStats ? realStats.lessonsCount : 0;
        const duration = realStats ? realStats.duration : 0;

        // Use real enrollment count from orders
        const enrollmentsCount = enrollmentCounts[id] || 0;

        return {
          id,
          thumbnail: cols[COL.THUMBNAIL] || '',
          title: cols[COL.TITLE] || '',
          description: cols[COL.DESCRIPTION] || '',
          instructor: cols[COL.INSTRUCTOR] || 'WePower Academy',
          price,
          originalPrice,
          rating,
          reviewsCount: Number(cols[COL.REVIEWS_COUNT]) || 0,
          enrollmentsCount,
          duration,
          lessonsCount,
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
