-- =============================================
-- 011: Security Hotfix
-- - Helper function to read userId from JWT
-- - Fix RLS on quiz_attempts & notifications
-- - Add must_change_password + token_version to users
-- - Add used_reset_tokens table
-- =============================================

-- 1. Helper: read userId from JWT claims
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(
    current_setting('request.jwt.claims', true)::jsonb->>'userId', ''
  )::uuid;
$$;

-- 2. Drop ALL existing policies on quiz_attempts & notifications
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
    WHERE tablename = 'quiz_attempts' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname
      || '" ON public.quiz_attempts';
  END LOOP;
  FOR r IN SELECT policyname FROM pg_policies
    WHERE tablename = 'notifications' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname
      || '" ON public.notifications';
  END LOOP;
END $$;

-- 3. quiz_attempts: users can only access their own attempts
CREATE POLICY "qa_select" ON public.quiz_attempts
  FOR SELECT USING (user_id = public.current_app_user_id());
CREATE POLICY "qa_insert" ON public.quiz_attempts
  FOR INSERT WITH CHECK (user_id = public.current_app_user_id());
CREATE POLICY "qa_update" ON public.quiz_attempts
  FOR UPDATE USING (user_id = public.current_app_user_id());

-- 4. notifications: SELECT + UPDATE only (INSERT via service_role)
CREATE POLICY "notif_select" ON public.notifications
  FOR SELECT USING (user_id = public.current_app_user_id());
CREATE POLICY "notif_update" ON public.notifications
  FOR UPDATE USING (user_id = public.current_app_user_id());

-- 5. Add columns for password flow
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0;

-- 6. Table to track used reset tokens (JWT is self-contained)
CREATE TABLE IF NOT EXISTS public.used_reset_tokens (
  token_hash TEXT PRIMARY KEY,
  used_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_used_tokens_expires
  ON public.used_reset_tokens(expires_at);

ALTER TABLE public.used_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Only service_role can insert/select (anon/authenticated blocked)
CREATE POLICY "used_tokens_service_only" ON public.used_reset_tokens
  FOR ALL USING (false);
