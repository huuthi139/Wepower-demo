-- =============================================
-- 013: Performance Indexes
-- Applied manually via SQL Editor (CONCURRENTLY
-- cannot run inside supabase db push pipeline).
-- =============================================

CREATE INDEX IF NOT EXISTS idx_course_access_user_status
  ON public.course_access(user_id, status);

CREATE INDEX IF NOT EXISTS idx_course_access_expires
  ON public.course_access(expires_at)
  WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_course
  ON public.lesson_progress(user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_composite
  ON public.quiz_attempts(quiz_id, user_id);

CREATE INDEX IF NOT EXISTS idx_courses_slug
  ON public.courses(slug);
