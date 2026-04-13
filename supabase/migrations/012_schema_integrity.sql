-- =============================================
-- 012: Schema Integrity
-- - Add granted_by_order_id column + FK on course_access
-- - quizzes.course_id already TEXT (fixed in 010)
-- =============================================

-- 1. Add granted_by_order_id column if it doesn't exist
ALTER TABLE public.course_access
  ADD COLUMN IF NOT EXISTS granted_by_order_id UUID;

-- 2. Clean up any orphan references (safety net)
UPDATE public.course_access
  SET granted_by_order_id = NULL
  WHERE granted_by_order_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = course_access.granted_by_order_id
    );

-- 3. Add FK constraint
DO $$ BEGIN
  ALTER TABLE public.course_access
    ADD CONSTRAINT fk_granted_order
    FOREIGN KEY (granted_by_order_id)
    REFERENCES public.orders(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
