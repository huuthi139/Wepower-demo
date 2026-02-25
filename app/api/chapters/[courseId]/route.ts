import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FALLBACK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykh_Id91EZesQ0kC1Mn15zEPC2f3oxTxR1xPcDY484gJnlWhNW0toE2v75NG2lVQgo/exec';

export async function GET(
  _request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    if (!courseId) {
      return NextResponse.json({ success: false, error: 'Missing courseId' }, { status: 400 });
    }

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL || FALLBACK_SCRIPT_URL;
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

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL || FALLBACK_SCRIPT_URL;
    const qs = new URLSearchParams({
      action: 'saveChapters',
      courseId,
      chaptersJson: JSON.stringify(chapters),
    });

    const res = await fetch(`${scriptUrl}?${qs.toString()}`, {
      redirect: 'follow',
    });
    const data = await res.json();

    if (data.success) {
      return NextResponse.json({ success: true });
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
