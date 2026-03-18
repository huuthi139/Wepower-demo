import { NextRequest } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth/guards';
import { getUserByEmail } from '@/lib/supabase/users';
import { getLessonProgress, upsertLessonProgress, getCourseLesonProgress } from '@/lib/progress/service';
import { getEffectiveAccessTier } from '@/lib/supabase/course-access';
import { meetsAccessTier } from '@/lib/types';
import { isAdminLevelRole, normalizeRole } from '@/lib/auth/permissions';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { apiSuccess, ERR } from '@/lib/api/response';
import { logger } from '@/lib/telemetry/logger';
import type { AccessTier } from '@/lib/types';

/**
 * Check if user can access a specific lesson (for progress writes).
 * Returns true if user's course access tier meets the lesson's required tier.
 */
async function canUserAccessLesson(
  userId: string,
  courseId: string,
  lessonId: string,
  userRole: string,
): Promise<boolean> {
  // Staff bypass
  const role = normalizeRole(userRole);
  if (isAdminLevelRole(role) || role === 'instructor') return true;

  // Get lesson's access_tier
  const supabase = getSupabaseAdmin();
  const { data: lesson } = await supabase
    .from('lessons')
    .select('access_tier')
    .eq('id', lessonId)
    .eq('course_id', courseId)
    .limit(1)
    .single();

  // If lesson not found, allow (might be legacy data)
  if (!lesson) return true;

  const lessonTier = (lesson.access_tier || 'free') as AccessTier;
  if (lessonTier === 'free') return true;

  // Check user's course access
  const userTier = await getEffectiveAccessTier(userId, courseId);
  return meetsAccessTier(userTier, lessonTier);
}

/**
 * GET /api/lessons/progress?courseId=xxx&lessonId=yyy
 * Get progress for a specific lesson or all lessons in a course
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth();
    const dbUser = await getUserByEmail(authUser.email);
    if (!dbUser?.id) return ERR.UNAUTHORIZED('Tài khoản không hợp lệ');

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');

    if (!courseId) return ERR.VALIDATION('courseId là bắt buộc');

    if (lessonId) {
      const progress = await getLessonProgress(dbUser.id, courseId, lessonId);
      return apiSuccess({ progress });
    }

    const allProgress = await getCourseLesonProgress(dbUser.id, courseId);
    return apiSuccess({ progress: allProgress });
  } catch (error) {
    if (error instanceof AuthError) return ERR.UNAUTHORIZED();
    logger.error('lessons.progress.get', 'Error', { error: error instanceof Error ? error.message : String(error) });
    return ERR.INTERNAL();
  }
}

/**
 * POST /api/lessons/progress
 * Autosave lesson progress (called every 15-30s, on blur, on lesson change).
 * Only allows progress writes for lessons the user has access to.
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth();
    const dbUser = await getUserByEmail(authUser.email);
    if (!dbUser?.id) return ERR.UNAUTHORIZED('Tài khoản không hợp lệ');

    const body = await req.json();
    const { courseId, lessonId, positionSeconds, durationSeconds, deviceId } = body;

    if (!courseId || !lessonId) return ERR.VALIDATION('courseId và lessonId là bắt buộc');

    // Check access before allowing progress write
    const hasAccess = await canUserAccessLesson(dbUser.id, courseId, lessonId, authUser.role);
    if (!hasAccess) {
      return ERR.UNAUTHORIZED('Bạn không có quyền truy cập bài học này');
    }

    const result = await upsertLessonProgress({
      userId: dbUser.id,
      courseId,
      lessonId,
      positionSeconds: Number(positionSeconds) || 0,
      durationSeconds: Number(durationSeconds) || 0,
      deviceId,
    });

    if (!result) return ERR.INTERNAL('Không thể lưu tiến độ');

    return apiSuccess({ progress: result });
  } catch (error) {
    if (error instanceof AuthError) return ERR.UNAUTHORIZED();
    logger.error('lessons.progress.save', 'Error', { error: error instanceof Error ? error.message : String(error) });
    return ERR.INTERNAL();
  }
}
