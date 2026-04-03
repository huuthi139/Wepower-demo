import { NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth/guards';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      overviewResult,
      topCoursesResult,
      lessonProgressResult,
      recentEnrollmentsResult,
      userGrowthResult,
      tierDistributionResult,
      topActiveUsersResult,
    ] = await Promise.all([
      // 1. OVERVIEW STATS
      getOverviewStats(supabase, todayStart, weekAgo),
      // 2. TOP COURSES
      getTopCourses(supabase),
      // 3. LESSON PROGRESS STATS
      getLessonProgressStats(supabase),
      // 4. RECENT ACTIVITY
      getRecentEnrollments(supabase, todayStart),
      // 5. USER GROWTH (30 days)
      getUserGrowth(supabase, thirtyDaysAgo),
      // 6. COURSE ACCESS BY TIER
      getTierDistribution(supabase),
      // 7. TOP ACTIVE USERS
      getTopActiveUsers(supabase),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: overviewResult,
        top_courses: topCoursesResult,
        lesson_progress: lessonProgressResult,
        recent_enrollments: recentEnrollmentsResult.enrollments,
        active_learners_today: recentEnrollmentsResult.activeLearners,
        users_by_day: userGrowthResult,
        tier_distribution: tierDistributionResult,
        top_active_users: topActiveUsersResult,
      },
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return NextResponse.json(
      { success: false, error: 'Không thể tải dữ liệu dashboard' },
      { status: 500 },
    );
  }
}

import type { SupabaseClient } from '@supabase/supabase-js';

type Supabase = SupabaseClient;

async function getOverviewStats(supabase: Supabase, todayStart: string, weekAgo: string) {
  const [
    { count: totalUsers },
    { count: newUsersToday },
    { count: newUsersWeek },
    { count: totalCourses },
    { count: totalLessons },
    { count: totalVip },
    { count: totalPremium },
    { count: totalFree },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
    supabase.from('users').select('*', { count: 'exact', head: true }).neq('role', 'admin').gte('created_at', todayStart),
    supabase.from('users').select('*', { count: 'exact', head: true }).neq('role', 'admin').gte('created_at', weekAgo),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('member_level', 'VIP').neq('role', 'admin'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('member_level', 'Premium').neq('role', 'admin'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('member_level', 'Free').neq('role', 'admin'),
  ]);

  return {
    total_users: totalUsers || 0,
    new_users_today: newUsersToday || 0,
    new_users_week: newUsersWeek || 0,
    total_courses: totalCourses || 0,
    total_lessons: totalLessons || 0,
    total_vip: totalVip || 0,
    total_premium: totalPremium || 0,
    total_free: totalFree || 0,
  };
}

async function getTopCourses(supabase: Supabase) {
  // Get course access counts grouped by course
  const { data: accessData } = await supabase
    .from('course_access')
    .select('course_id')
    .eq('status', 'active');

  if (!accessData || accessData.length === 0) return [];

  // Count students per course
  const courseCounts: Record<string, number> = {};
  for (const row of accessData) {
    courseCounts[row.course_id] = (courseCounts[row.course_id] || 0) + 1;
  }

  // Get top 5 course IDs
  const topCourseIds = Object.entries(courseCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);

  // Get course details
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, lessons_count')
    .in('id', topCourseIds);

  if (!courses) return [];

  return topCourseIds.map(id => {
    const course = courses.find((c: { id: string }) => c.id === id);
    return {
      course_id: id,
      title: course?.title || 'Unknown',
      student_count: courseCounts[id],
      lessons_count: course?.lessons_count || 0,
    };
  });
}

async function getLessonProgressStats(supabase: Supabase) {
  // Get all lesson progress for stats
  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('lesson_id, user_id, duration_seconds, percent_complete, course_id');

  if (!progressData || progressData.length === 0) {
    return {
      most_watched_lessons: [],
      total_watch_time_hours: 0,
      avg_completion_rate: 0,
    };
  }

  // Most watched lessons: count distinct users per lesson
  const lessonUsers: Record<string, Set<string>> = {};
  let totalDuration = 0;
  const courseCompletions: Record<string, number[]> = {};

  for (const row of progressData) {
    if (!lessonUsers[row.lesson_id]) lessonUsers[row.lesson_id] = new Set();
    lessonUsers[row.lesson_id].add(row.user_id);
    totalDuration += row.duration_seconds || 0;

    if (!courseCompletions[row.course_id]) courseCompletions[row.course_id] = [];
    courseCompletions[row.course_id].push(row.percent_complete || 0);
  }

  // Top 10 lessons by unique viewers
  const topLessonIds = Object.entries(lessonUsers)
    .sort(([, a], [, b]) => b.size - a.size)
    .slice(0, 10)
    .map(([id]) => id);

  // Get lesson titles
  let lessonsMap: Record<string, string> = {};
  if (topLessonIds.length > 0) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title')
      .in('id', topLessonIds);
    if (lessons) {
      lessonsMap = Object.fromEntries(lessons.map((l: { id: string; title: string }) => [l.id, l.title]));
    }
  }

  const mostWatchedLessons = topLessonIds.map(id => ({
    lesson_id: id,
    title: lessonsMap[id] || 'Unknown',
    viewer_count: lessonUsers[id].size,
  }));

  // Avg completion per course, then overall avg
  const courseAvgs = Object.values(courseCompletions).map(
    rates => rates.reduce((a, b) => a + b, 0) / rates.length
  );
  const avgCompletionRate = courseAvgs.length > 0
    ? Math.round(courseAvgs.reduce((a, b) => a + b, 0) / courseAvgs.length)
    : 0;

  return {
    most_watched_lessons: mostWatchedLessons,
    total_watch_time_hours: Math.round((totalDuration / 3600) * 10) / 10,
    avg_completion_rate: avgCompletionRate,
  };
}

async function getRecentEnrollments(supabase: Supabase, todayStart: string) {
  const [enrollmentsRes, activeLearnersRes] = await Promise.all([
    supabase
      .from('course_access')
      .select('id, user_id, course_id, access_tier, created_at, users(name, email), courses(title)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('lesson_progress')
      .select('user_id')
      .gte('updated_at', todayStart),
  ]);

  const enrollments = (enrollmentsRes.data || []).map((row: Record<string, unknown>) => ({
    id: row.id,
    user_name: (row.users as Record<string, string>)?.name || 'N/A',
    user_email: (row.users as Record<string, string>)?.email || 'N/A',
    course_title: (row.courses as Record<string, string>)?.title || 'N/A',
    access_tier: row.access_tier,
    created_at: row.created_at,
  }));

  // Count distinct active learners today
  const uniqueUsers = new Set(
    (activeLearnersRes.data || []).map((r: { user_id: string }) => r.user_id)
  );

  return {
    enrollments,
    activeLearners: uniqueUsers.size,
  };
}

async function getUserGrowth(supabase: Supabase, thirtyDaysAgo: string) {
  const { data: users } = await supabase
    .from('users')
    .select('created_at')
    .neq('role', 'admin')
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: true });

  if (!users || users.length === 0) return [];

  // Group by date
  const dayCounts: Record<string, number> = {};
  for (const u of users) {
    const date = new Date(u.created_at).toISOString().split('T')[0];
    dayCounts[date] = (dayCounts[date] || 0) + 1;
  }

  // Fill in missing days with 0
  const result: { date: string; count: number }[] = [];
  const start = new Date(thirtyDaysAgo);
  const now = new Date();
  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    result.push({ date: dateStr, count: dayCounts[dateStr] || 0 });
  }

  return result;
}

async function getTierDistribution(supabase: Supabase) {
  const { data } = await supabase
    .from('course_access')
    .select('access_tier')
    .eq('status', 'active');

  const dist: Record<string, number> = { free: 0, premium: 0, vip: 0 };
  if (data) {
    for (const row of data) {
      const tier = (row.access_tier || '').toLowerCase();
      if (tier in dist) dist[tier]++;
    }
  }

  return dist;
}

async function getTopActiveUsers(supabase: Supabase) {
  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('user_id, lesson_id, duration_seconds, is_completed');

  if (!progressData || progressData.length === 0) return [];

  // Aggregate per user
  const userStats: Record<string, { lessons: Set<string>; completed: number; watchSeconds: number }> = {};
  for (const row of progressData) {
    if (!userStats[row.user_id]) {
      userStats[row.user_id] = { lessons: new Set(), completed: 0, watchSeconds: 0 };
    }
    userStats[row.user_id].lessons.add(row.lesson_id);
    if (row.is_completed) userStats[row.user_id].completed++;
    userStats[row.user_id].watchSeconds += row.duration_seconds || 0;
  }

  // Top 10 by lessons count
  const topUserIds = Object.entries(userStats)
    .sort(([, a], [, b]) => b.lessons.size - a.lessons.size)
    .slice(0, 10)
    .map(([id]) => id);

  // Get user details
  const { data: users } = await supabase
    .from('users')
    .select('id, name, email')
    .in('id', topUserIds);

  const usersMap: Record<string, { name: string; email: string }> = {};
  if (users) {
    for (const u of users) {
      usersMap[u.id] = { name: u.name, email: u.email };
    }
  }

  return topUserIds.map(id => ({
    user_id: id,
    name: usersMap[id]?.name || 'N/A',
    email: usersMap[id]?.email || 'N/A',
    lessons_completed: userStats[id].completed,
    total_watch_seconds: userStats[id].watchSeconds,
  }));
}
