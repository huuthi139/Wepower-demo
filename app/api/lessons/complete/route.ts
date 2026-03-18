import { NextRequest } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth/guards';
import { getUserByEmail } from '@/lib/supabase/users';
import { markLessonComplete } from '@/lib/progress/service';
import { getEffectiveAccessTier } from '@/lib/supabase/course-access';
import { meetsAccessTier } from '@/lib/types';
import { isAdminLevelRole, normalizeRole } from '@/lib/auth/permissions';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { apiSuccess, ERR } from '@/lib/api/response';
import { logger } from '@/lib/telemetry/logger';
import type { AccessTier } from '@/lib/types';

/**
 * POST /api/lessons/complete
 * Mark a lesson as completed. Only allowed if user has access to the lesson.
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth();
    const dbUser = await getUserByEmail(authUser.email);
    if (!dbUser?.id) return ERR.UNAUTHORIZED('Tài khoản không hợp lệ');

    const { courseId, lessonId } = await req.json();

    if (!courseId || !lessonId) {
      return ERR.VALIDATION('courseId và lessonId là bắt buộc');
    }

    // Check access before allowing completion
    const role = normalizeRole(authUser.role);
    const isStaff = isAdminLevelRole(role) || role === 'instructor';

    if (!isStaff) {
      const supabase = getSupabaseAdmin();
      const { data: lesson } = await supabase
        .from('lessons')
        .select('access_tier')
        .eq('id', lessonId)
        .eq('course_id', courseId)
        .limit(1)
        .single();

      if (lesson) {
        const lessonTier = (lesson.access_tier || 'free') as AccessTier;
        if (lessonTier !== 'free') {
          const userTier = await getEffectiveAccessTier(dbUser.id, courseId);
          if (!meetsAccessTier(userTier, lessonTier)) {
            return ERR.UNAUTHORIZED('Bạn không có quyền truy cập bài học này');
          }
        }
      }
    }

    const success = await markLessonComplete(dbUser.id, courseId, lessonId);

    if (!success) {
      return ERR.INTERNAL('Không thể đánh dấu hoàn thành');
    }

    logger.info('lessons.complete', 'Lesson completed', {
      userId: dbUser.id,
      courseId,
      lessonId,
    });

    return apiSuccess({ completed: true });
  } catch (error) {
    if (error instanceof AuthError) return ERR.UNAUTHORIZED();
    logger.error('lessons.complete', 'Error', { error: error instanceof Error ? error.message : String(error) });
    return ERR.INTERNAL();
  }
}
