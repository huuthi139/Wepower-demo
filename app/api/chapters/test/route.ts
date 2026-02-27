import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { getScriptUrl } from '@/lib/config';

// Test endpoint: GET /api/chapters/test?courseId=6
// BLOCKED in production via middleware - only available in development
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId') || '6';
  const scriptUrl = getScriptUrl();

  const results: string[] = [];

  // Step 1: Save test chapter
  const testChapters = [{
    id: 'test-ch-1',
    title: 'Test Chapter (auto-test)',
    lessons: [{
      id: 'test-ls-1',
      title: 'Test Lesson',
      duration: '05:00',
      requiredLevel: 'Free',
      directPlayUrl: 'https://test.example.com/video.mp4',
    }],
  }];

  const qs = new URLSearchParams({
    action: 'saveChapters',
    courseId: `test-${courseId}`,
    chaptersJson: JSON.stringify(testChapters),
  });

  try {
    const saveUrl = `${scriptUrl}?${qs.toString()}`;
    results.push(`Save URL length: ${saveUrl.length} chars`);

    const saveRes = await fetch(saveUrl, { redirect: 'follow' });
    const saveData = await saveRes.json();
    results.push(`Save result: ${JSON.stringify(saveData)}`);

    // Step 2: Read back
    const readQs = new URLSearchParams({ action: 'getChapters', courseId: `test-${courseId}` });
    const readRes = await fetch(`${scriptUrl}?${readQs.toString()}`, { redirect: 'follow', cache: 'no-store' });
    const readData = await readRes.json();
    results.push(`Read back: ${JSON.stringify(readData)}`);

    // Step 3: Check current chapters for the real courseId
    const realQs = new URLSearchParams({ action: 'getChapters', courseId });
    const realRes = await fetch(`${scriptUrl}?${realQs.toString()}`, { redirect: 'follow', cache: 'no-store' });
    const realData = await realRes.json();
    const chapterCount = (realData.chapters || []).length;
    const lessonCount = (realData.chapters || []).reduce((s: number, c: any) => s + (c.lessons?.length || 0), 0);
    results.push(`Course ${courseId} on server: ${chapterCount} chapters, ${lessonCount} lessons`);

    // Cleanup test
    await fetch(`${scriptUrl}?action=saveChapters&courseId=test-${courseId}&chaptersJson=%5B%5D`, { redirect: 'follow' });
    results.push('Test cleanup: done');

    const allPassed = saveData.success && readData.chapters?.length > 0;
    return NextResponse.json({
      success: allPassed,
      message: allPassed ? 'Save + read hoạt động OK! Hệ thống sẵn sàng.' : 'Có lỗi - xem chi tiết bên dưới',
      details: results,
      courseId,
      serverChapters: { chapters: chapterCount, lessons: lessonCount },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: `Lỗi: ${error.message}`,
      details: results,
    });
  }
}
