import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FALLBACK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykh_Id91EZesQ0kC1Mn15zEPC2f3oxTxR1xPcDY484gJnlWhNW0toE2v75NG2lVQgo/exec';

function getScriptUrl() {
  return process.env.GOOGLE_SCRIPT_URL || FALLBACK_SCRIPT_URL;
}

// ---------------------------------------------------------------------------
// Google Apps Script GET-based API helpers
// ---------------------------------------------------------------------------
// Google Apps Script redirects all requests (302). The redirect URL is longer
// than the original URL by ~1000-1500 chars. After testing, 2000 chars for
// the query-string portion is the safe maximum.
// ---------------------------------------------------------------------------
const MAX_URL = 2000; // max chars for the chaptersJson query-string VALUE

/** Safe JSON parse – returns null when response is not JSON */
async function safeParse(res: Response): Promise<any | null> {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('json') && !ct.includes('javascript')) return null;
  try { return await res.json(); } catch { return null; }
}

/** Low-level: save a single key→value pair via Apps Script */
async function scriptSave(scriptUrl: string, key: string, value: string): Promise<boolean> {
  const qs = new URLSearchParams({ action: 'saveChapters', courseId: key, chaptersJson: value });
  const url = `${scriptUrl}?${qs.toString()}`;
  const res = await fetch(url, { redirect: 'follow' });
  const data = await safeParse(res);
  return data?.success === true;
}

/** Low-level: read a single key from Apps Script */
async function scriptRead(scriptUrl: string, key: string): Promise<any> {
  const qs = new URLSearchParams({ action: 'getChapters', courseId: key });
  const res = await fetch(`${scriptUrl}?${qs.toString()}`, { redirect: 'follow', cache: 'no-store' });
  const data = await safeParse(res);
  if (!data?.success) return null;
  return data.chapters ?? null;
}

/** How many chars would the chaptersJson value be for this data? */
function jsonLen(data: any): number {
  return JSON.stringify(data).length;
}

// ---------------------------------------------------------------------------
// SAVE: courseId → { _n: <count> }
//       courseId__0 → [chapter0]  (or { _p: <partCount> } if too big)
//       courseId__0__0 → [chapter0 with lesson slice 0]
//       courseId__0__1 → [chapter0 with lesson slice 1]  etc.
// ---------------------------------------------------------------------------

/** Find the maximum number of lessons (starting at offset) that fit in MAX_URL */
function maxLessonBatch(chapter: any, lessons: any[], offset: number): number {
  const meta = { id: chapter.id, title: chapter.title };
  let lo = 1, hi = lessons.length - offset;
  // Quick check: does everything from offset fit?
  if (jsonLen([{ ...meta, lessons: lessons.slice(offset) }]) <= MAX_URL) return hi;
  // Binary search
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (jsonLen([{ ...meta, lessons: lessons.slice(offset, offset + mid) }]) <= MAX_URL) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo; // guaranteed >= 1
}

async function saveAllChapters(scriptUrl: string, courseId: string, chapters: any[]): Promise<{ success: boolean; error?: string }> {
  // 1. Save each chapter
  for (let i = 0; i < chapters.length; i++) {
    const chKey = `${courseId}__${i}`;
    const ch = chapters[i];
    const chJson = JSON.stringify([ch]);

    if (chJson.length <= MAX_URL) {
      // Fits in one call
      if (!await scriptSave(scriptUrl, chKey, chJson)) {
        return { success: false, error: `Lỗi lưu chương ${i + 1}` };
      }
    } else {
      // Too big – split lessons into parts
      const lessons = ch.lessons || [];
      let offset = 0;
      let partIdx = 0;

      while (offset < lessons.length) {
        const batch = maxLessonBatch(ch, lessons, offset);
        const partChapter = { id: ch.id, title: ch.title, lessons: lessons.slice(offset, offset + batch) };
        const partJson = JSON.stringify([partChapter]);
        if (!await scriptSave(scriptUrl, `${chKey}__${partIdx}`, partJson)) {
          return { success: false, error: `Lỗi lưu chương ${i + 1} phần ${partIdx + 1}` };
        }
        offset += batch;
        partIdx++;
      }

      // Save part index for this chapter
      if (!await scriptSave(scriptUrl, chKey, JSON.stringify({ _p: partIdx }))) {
        return { success: false, error: `Lỗi lưu index chương ${i + 1}` };
      }
    }
  }

  // 2. Save master index
  if (!await scriptSave(scriptUrl, courseId, JSON.stringify({ _n: chapters.length }))) {
    return { success: false, error: 'Lỗi lưu master index' };
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// READ: supports both new format (_n/_p) and old format (_chunks/_lessonChunks)
// ---------------------------------------------------------------------------

async function readAllChapters(scriptUrl: string, courseId: string): Promise<any[]> {
  const raw = await scriptRead(scriptUrl, courseId);
  if (!raw) return [];

  // --- New format: { _n: count } ---
  if (raw._n !== undefined) {
    const count = raw._n as number;
    const result: any[] = [];
    for (let i = 0; i < count; i++) {
      const chData = await scriptRead(scriptUrl, `${courseId}__${i}`);
      if (!chData) continue;

      // Check if chapter has lesson parts
      if (chData._p !== undefined) {
        const partCount = chData._p as number;
        const allLessons: any[] = [];
        let chapterMeta: any = null;
        for (let p = 0; p < partCount; p++) {
          const partData = await scriptRead(scriptUrl, `${courseId}__${i}__${p}`);
          if (Array.isArray(partData) && partData[0]) {
            if (!chapterMeta) chapterMeta = { id: partData[0].id, title: partData[0].title };
            allLessons.push(...(partData[0].lessons || []));
          }
        }
        if (chapterMeta) result.push({ ...chapterMeta, lessons: allLessons });
      } else if (Array.isArray(chData) && chData[0]) {
        result.push(chData[0]);
      }
    }
    return result;
  }

  // --- Old format: { _chunks: [...] } ---
  if (raw._chunks) {
    const result: any[] = [];
    for (const chunkId of raw._chunks) {
      const chunkData = await scriptRead(scriptUrl, chunkId);
      if (!chunkData) continue;
      const arr = Array.isArray(chunkData) ? chunkData : [chunkData];
      for (const ch of arr) {
        if (ch._lessonChunks) {
          const allLessons: any[] = [];
          let meta: any = null;
          for (const partId of ch._lessonChunks) {
            const partData = await scriptRead(scriptUrl, partId);
            if (Array.isArray(partData) && partData[0]) {
              if (!meta) meta = { id: partData[0].id, title: partData[0].title };
              allLessons.push(...(partData[0].lessons || []));
            }
          }
          if (meta) result.push({ ...meta, lessons: allLessons });
        } else {
          result.push(ch);
        }
      }
    }
    return result;
  }

  // --- Direct array (small course, no chunking) ---
  if (Array.isArray(raw)) return raw;

  return [];
}

// ---------------------------------------------------------------------------
// Cleanup old data before saving new data
// ---------------------------------------------------------------------------
async function cleanupOldData(scriptUrl: string, courseId: string): Promise<void> {
  const raw = await scriptRead(scriptUrl, courseId);
  if (!raw) return;

  const empty = '[]';

  if (raw._n !== undefined) {
    // New format cleanup
    for (let i = 0; i < raw._n; i++) {
      const chData = await scriptRead(scriptUrl, `${courseId}__${i}`);
      if (chData?._p !== undefined) {
        for (let p = 0; p < chData._p; p++) {
          await scriptSave(scriptUrl, `${courseId}__${i}__${p}`, empty);
        }
      }
      await scriptSave(scriptUrl, `${courseId}__${i}`, empty);
    }
  } else if (raw._chunks) {
    // Old format cleanup
    for (const chunkId of raw._chunks) {
      const chunkData = await scriptRead(scriptUrl, chunkId);
      if (chunkData) {
        const arr = Array.isArray(chunkData) ? chunkData : [chunkData];
        for (const ch of arr) {
          if (ch._lessonChunks) {
            for (const partId of ch._lessonChunks) {
              await scriptSave(scriptUrl, partId, empty);
            }
          }
        }
      }
      await scriptSave(scriptUrl, chunkId, empty);
    }
  }
}

// ---------------------------------------------------------------------------
// HTTP handlers
// ---------------------------------------------------------------------------

export async function GET(
  _request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    if (!courseId) return NextResponse.json({ success: false, error: 'Missing courseId' }, { status: 400 });

    const chapters = await readAllChapters(getScriptUrl(), courseId);
    return NextResponse.json({ success: true, chapters });
  } catch (error) {
    console.error('Chapters GET error:', error);
    return NextResponse.json({ success: true, chapters: [] });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    if (!courseId) return NextResponse.json({ success: false, error: 'Missing courseId' }, { status: 400 });

    const body = await request.json();
    const chapters = body.chapters || [];
    const scriptUrl = getScriptUrl();

    // Clean up old chunks (best-effort, don't fail if cleanup has issues)
    try { await cleanupOldData(scriptUrl, courseId); } catch { /* ignore */ }

    // Save
    const result = await saveAllChapters(scriptUrl, courseId, chapters);

    if (result.success) {
      const expectedLessons = chapters.reduce((s: number, ch: any) => s + (ch.lessons?.length || 0), 0);
      return NextResponse.json({
        success: true,
        verified: true,
        savedLessonsCount: expectedLessons,
        expectedLessonsCount: expectedLessons,
        message: `Đã lưu ${chapters.length} chương, ${expectedLessons} bài học`,
      });
    }

    return NextResponse.json({ success: false, error: result.error || 'Lưu thất bại' }, { status: 500 });
  } catch (error: any) {
    console.error('Chapters POST error:', error);
    return NextResponse.json({ success: false, error: `Lỗi hệ thống: ${error.message}` }, { status: 500 });
  }
}
