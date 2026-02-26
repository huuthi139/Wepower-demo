import { NextResponse } from 'next/server';

// Force dynamic - không cache static lúc build
export const dynamic = 'force-dynamic';

const SHEET_ID = '1KOuhPurnWcHOayeRn7r-hNgVl13Zf7Q0z0r4d1-K0JY';
const FALLBACK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykh_Id91EZesQ0kC1Mn15zEPC2f3oxTxR1xPcDY484gJnlWhNW0toE2v75NG2lVQgo/exec';

// Column positions in Google Sheet (0-indexed)
// Data order: ID, Title, Description, Thumbnail, Instructor, Price, OriginalPrice, Rating, ReviewsCount, EnrollmentsCount, Duration, LessonsCount, Badge, Category
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
  return lines.slice(1).map(line => parseCSVRow(line));
}

// Parse "MM:SS" duration to seconds
function parseDurationToSeconds(duration: string): number {
  if (!duration) return 0;
  const parts = duration.split(':');
  if (parts.length === 2) {
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  }
  return parseInt(duration, 10) || 0;
}

// Fetch chapter stats from Apps Script with timeout
// Handles chunked data: courseId → {_chunks: [...]} → resolve chunks
async function fetchChapterStats(timeoutMs = 8000): Promise<Record<string, { lessonsCount: number; duration: number }>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL || FALLBACK_SCRIPT_URL;
    const res = await fetch(`${scriptUrl}?action=getAllChapters`, {
      signal: controller.signal,
      redirect: 'follow',
      cache: 'no-store',
    });
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('json') && !ct.includes('javascript')) {
      return {};
    }
    let data: any;
    try { data = await res.json(); } catch { return {}; }
    if (data.success && data.data) {
      const stats: Record<string, { lessonsCount: number; duration: number }> = {};
      const allData = data.data as Record<string, any>;

      for (const [courseId, chapters] of Object.entries(allData)) {
        // Skip chunk/part entries (they have __ in the ID)
        if (courseId.includes('__')) continue;

        let chapterArr: any[];

        // New format: { _n: count } – resolve chapter keys from allData
        if (chapters && (chapters as any)._n !== undefined) {
          chapterArr = [];
          const count = (chapters as any)._n as number;
          for (let i = 0; i < count; i++) {
            const chData = allData[`${courseId}__${i}`];
            if (!chData) continue;
            // Check for lesson parts
            if (chData._p !== undefined) {
              const lessons: any[] = [];
              let meta: any = null;
              for (let p = 0; p < chData._p; p++) {
                const partData = allData[`${courseId}__${i}__${p}`];
                if (Array.isArray(partData) && partData[0]) {
                  if (!meta) meta = { id: partData[0].id, title: partData[0].title };
                  lessons.push(...(partData[0].lessons || []));
                }
              }
              if (meta) chapterArr.push({ ...meta, lessons });
            } else if (Array.isArray(chData)) {
              chapterArr.push(...chData);
            }
          }
        // Old format: { _chunks: [...] }
        } else if (chapters && (chapters as any)._chunks) {
          chapterArr = [];
          for (const chunkId of (chapters as any)._chunks) {
            const chunkData = allData[chunkId];
            if (Array.isArray(chunkData)) {
              chapterArr.push(...chunkData);
            }
          }
        } else if (Array.isArray(chapters)) {
          chapterArr = chapters;
        } else {
          continue;
        }

        let totalLessons = 0;
        let totalDuration = 0;
        for (const ch of chapterArr) {
          const lessons = ch.lessons || [];
          totalLessons += lessons.length;
          for (const ls of lessons) {
            totalDuration += parseDurationToSeconds(ls.duration || '');
          }
        }
        if (totalLessons > 0) {
          stats[courseId] = { lessonsCount: totalLessons, duration: totalDuration };
        }
      }
      return stats;
    }
  } catch {
    // Timeout or network error - fall back to sheet values
  } finally {
    clearTimeout(timeout);
  }
  return {};
}

export async function GET() {
  try {
    // Fetch courses sheet and chapter stats in parallel
    const [coursesRes, chapterStats] = await Promise.all([
      fetch(
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Courses`,
        { cache: 'no-store' }
      ),
      fetchChapterStats(),
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

        // Real stats from chapters (auto-computed), fallback to sheet values
        const real = chapterStats[id];
        const sheetLessons = Number(cols[COL.LESSONS_COUNT]) || 0;
        const sheetDuration = Number(cols[COL.DURATION]) || 0;
        const sheetEnrollments = Number(cols[COL.ENROLLMENTS_COUNT]?.replace(/,/g, '')) || 0;

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
          enrollmentsCount: sheetEnrollments,
          duration: real ? real.duration : sheetDuration,
          lessonsCount: real ? real.lessonsCount : sheetLessons,
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
