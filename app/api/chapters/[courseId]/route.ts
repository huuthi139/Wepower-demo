import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FALLBACK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykh_Id91EZesQ0kC1Mn15zEPC2f3oxTxR1xPcDY484gJnlWhNW0toE2v75NG2lVQgo/exec';

function getScriptUrl() {
  return process.env.GOOGLE_SCRIPT_URL || FALLBACK_SCRIPT_URL;
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
    const qs = new URLSearchParams({ action: 'getChapters', courseId });
    const res = await fetch(`${scriptUrl}?${qs.toString()}`, {
      redirect: 'follow',
      cache: 'no-store',
    });
    const data = await res.json();

    if (data.success) {
      return NextResponse.json({ success: true, chapters: data.chapters || [] });
    }

    return NextResponse.json({ success: true, chapters: [] });
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
    const chaptersJson = JSON.stringify(chapters);

    // Save chapters to Google Apps Script
    const qs = new URLSearchParams({
      action: 'saveChapters',
      courseId,
      chaptersJson,
    });

    const saveUrl = `${scriptUrl}?${qs.toString()}`;

    // Check URL length - Google Apps Script has ~8KB URL limit
    if (saveUrl.length > 7500) {
      console.warn(`Chapters save URL is very long (${saveUrl.length} chars) for course ${courseId}`);
    }

    const res = await fetch(saveUrl, { redirect: 'follow' });
    const contentType = res.headers.get('content-type') || '';

    // If response isn't JSON, the save likely failed (e.g., HTML error page)
    if (!contentType.includes('application/json') && !contentType.includes('text/javascript')) {
      const text = await res.text();
      console.error('Chapters save returned non-JSON:', text.substring(0, 200));
      return NextResponse.json(
        { success: false, error: 'Save failed - received non-JSON response from server' },
        { status: 500 }
      );
    }

    const data = await res.json();

    if (data.success) {
      // Verify save by reading back
      try {
        const verifyQs = new URLSearchParams({ action: 'getChapters', courseId });
        const verifyRes = await fetch(`${scriptUrl}?${verifyQs.toString()}`, {
          redirect: 'follow',
          cache: 'no-store',
        });
        const verifyData = await verifyRes.json();
        const savedCount = (verifyData.chapters || []).reduce(
          (sum: number, ch: any) => sum + (ch.lessons?.length || 0), 0
        );
        return NextResponse.json({
          success: true,
          message: data.message,
          verified: true,
          savedLessonsCount: savedCount,
        });
      } catch {
        // Verification failed but save claimed success
        return NextResponse.json({ success: true, message: data.message, verified: false });
      }
    }

    return NextResponse.json(
      { success: false, error: data.error || 'Failed to save chapters' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Chapters POST error:', error);
    return NextResponse.json(
      { success: false, error: 'System error' },
      { status: 500 }
    );
  }
}
