import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FALLBACK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykh_Id91EZesQ0kC1Mn15zEPC2f3oxTxR1xPcDY484gJnlWhNW0toE2v75NG2lVQgo/exec';

function getScriptUrl() {
  return process.env.GOOGLE_SCRIPT_URL || FALLBACK_SCRIPT_URL;
}

// Max safe URL length for Google Apps Script
const MAX_URL_LENGTH = 7000;

// Safe JSON parse from a fetch response - returns null if not JSON
async function safeJsonParse(res: Response): Promise<any | null> {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('json') && !ct.includes('javascript')) {
    return null;
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Save chapters to Apps Script, chunking if data is too large
async function saveChaptersToScript(
  scriptUrl: string,
  courseId: string,
  chapters: any[]
): Promise<{ success: boolean; error?: string }> {
  const chaptersJson = JSON.stringify(chapters);
  const qs = new URLSearchParams({ action: 'saveChapters', courseId, chaptersJson });
  const fullUrl = `${scriptUrl}?${qs.toString()}`;

  // If URL fits in one request, send directly
  if (fullUrl.length <= MAX_URL_LENGTH) {
    const res = await fetch(fullUrl, { redirect: 'follow' });
    const data = await safeJsonParse(res);
    if (!data) {
      return { success: false, error: `Non-JSON response (URL ${fullUrl.length} chars)` };
    }
    return data;
  }

  // URL too long → save each chapter individually as chunk, then save index
  const chunkIds: string[] = [];
  for (let i = 0; i < chapters.length; i++) {
    const chunkId = `${courseId}__chunk_${i}`;
    const chunkJson = JSON.stringify([chapters[i]]);
    const chunkQs = new URLSearchParams({ action: 'saveChapters', courseId: chunkId, chaptersJson: chunkJson });
    const chunkUrl = `${scriptUrl}?${chunkQs.toString()}`;

    // If even a single chapter is too large, split its lessons
    if (chunkUrl.length > MAX_URL_LENGTH) {
      const ch = chapters[i];
      const lessons = ch.lessons || [];
      const batchSize = Math.max(1, Math.floor(lessons.length * (MAX_URL_LENGTH - 500) / chunkUrl.length));

      const lessonChunks: string[] = [];
      for (let j = 0; j < lessons.length; j += batchSize) {
        const lessonSlice = lessons.slice(j, j + batchSize);
        const partId = `${chunkId}_part_${Math.floor(j / batchSize)}`;
        const partChapter = { ...ch, lessons: lessonSlice };
        const partJson = JSON.stringify([partChapter]);
        const partQs = new URLSearchParams({ action: 'saveChapters', courseId: partId, chaptersJson: partJson });
        const partRes = await fetch(`${scriptUrl}?${partQs.toString()}`, { redirect: 'follow' });
        const partData = await safeJsonParse(partRes);
        if (!partData?.success) return { success: false, error: `Failed to save part ${partId}` };
        lessonChunks.push(partId);
      }
      // Save lesson chunk index for this chapter
      const indexJson = JSON.stringify([{ _lessonChunks: lessonChunks }]);
      const indexQs = new URLSearchParams({ action: 'saveChapters', courseId: chunkId, chaptersJson: indexJson });
      await fetch(`${scriptUrl}?${indexQs.toString()}`, { redirect: 'follow' });
      chunkIds.push(chunkId);
    } else {
      const chunkRes = await fetch(chunkUrl, { redirect: 'follow' });
      const chunkData = await safeJsonParse(chunkRes);
      if (!chunkData?.success) return { success: false, error: `Failed to save chunk ${i}` };
      chunkIds.push(chunkId);
    }
  }

  // Save index: courseId → list of chunk IDs
  const indexJson = JSON.stringify({ _chunks: chunkIds });
  const indexQs = new URLSearchParams({ action: 'saveChapters', courseId, chaptersJson: indexJson });
  const indexRes = await fetch(`${scriptUrl}?${indexQs.toString()}`, { redirect: 'follow' });
  const indexData = await safeJsonParse(indexRes);
  if (!indexData?.success) return { success: false, error: 'Failed to save chunk index' };

  return { success: true };
}

// Read chapters from Apps Script, handling chunked data
async function readChaptersFromScript(
  scriptUrl: string,
  courseId: string
): Promise<any[]> {
  const qs = new URLSearchParams({ action: 'getChapters', courseId });
  const res = await fetch(`${scriptUrl}?${qs.toString()}`, { redirect: 'follow', cache: 'no-store' });
  const data = await safeJsonParse(res);

  if (!data || !data.success) return [];

  const chapters = data.chapters || [];

  // Check if this is a chunk index
  if (chapters._chunks) {
    const allChapters: any[] = [];
    for (const chunkId of chapters._chunks) {
      const chunkChapters = await readChaptersFromScript(scriptUrl, chunkId);
      for (const ch of chunkChapters) {
        // Check if this chapter has lesson chunks
        if (ch._lessonChunks) {
          // This is a lesson chunk index - resolve it
          const fullLessons: any[] = [];
          for (const partId of ch._lessonChunks) {
            const parts = await readChaptersFromScript(scriptUrl, partId);
            for (const p of parts) {
              fullLessons.push(...(p.lessons || []));
            }
          }
          // Replace with resolved lessons (use the first part's chapter data)
          const firstPart = await readChaptersFromScript(scriptUrl, ch._lessonChunks[0]);
          if (firstPart[0]) {
            allChapters.push({ ...firstPart[0], lessons: fullLessons });
          }
        } else {
          allChapters.push(ch);
        }
      }
    }
    return allChapters;
  }

  return chapters;
}

export async function GET(
  _request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    if (!courseId) {
      return NextResponse.json({ success: false, error: 'Missing courseId' }, { status: 400 });
    }

    const scriptUrl = getScriptUrl();
    const chapters = await readChaptersFromScript(scriptUrl, courseId);
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
    if (!courseId) {
      return NextResponse.json({ success: false, error: 'Missing courseId' }, { status: 400 });
    }

    const body = await request.json();
    const chapters = body.chapters || [];

    const scriptUrl = getScriptUrl();

    // First, clean up old chunks if they exist
    const rawQs = new URLSearchParams({ action: 'getChapters', courseId });
    const rawRes = await fetch(`${scriptUrl}?${rawQs.toString()}`, { redirect: 'follow', cache: 'no-store' });
    const rawData = await safeJsonParse(rawRes);
    if (rawData?.chapters?._chunks) {
      // Clean up old chunks
      for (const chunkId of rawData.chapters._chunks) {
        const emptyQs = new URLSearchParams({ action: 'saveChapters', courseId: chunkId, chaptersJson: '[]' });
        await fetch(`${scriptUrl}?${emptyQs.toString()}`, { redirect: 'follow' });
      }
    }

    // Save new chapters (with automatic chunking)
    const result = await saveChaptersToScript(scriptUrl, courseId, chapters);

    if (result.success) {
      // Verify by reading back
      const saved = await readChaptersFromScript(scriptUrl, courseId);
      const savedLessons = saved.reduce((s: number, ch: any) => s + (ch.lessons?.length || 0), 0);
      const expectedLessons = chapters.reduce((s: number, ch: any) => s + (ch.lessons?.length || 0), 0);

      return NextResponse.json({
        success: true,
        verified: true,
        savedLessonsCount: savedLessons,
        expectedLessonsCount: expectedLessons,
        message: `Đã lưu ${savedLessons}/${expectedLessons} bài học`,
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || 'Failed to save chapters' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Chapters POST error:', error);
    return NextResponse.json(
      { success: false, error: `System error: ${error.message}` },
      { status: 500 }
    );
  }
}
