-- Fix security issues identified by Supabase linter
-- Issue: Functions with mutable search_path are vulnerable to search path attacks
-- Solution: Add explicit "SET search_path = public" to all SECURITY DEFINER functions

-- Note: clean_expired_invitations already fixed in its original migration (20251025025908)
-- This migration ensures all functions follow security best practices

-- Fix: handle_new_user function (creates profile for new users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Explicit search_path prevents attacks
AS $$
BEGIN
  INSERT INTO public.profiles (id, institution_id)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'institution_id')::UUID, NULL)
  );
  RETURN NEW;
END;
$$;

-- Note: Most other functions already have SET search_path = public
-- Check: is_super_admin, is_institution_admin, is_instructor, etc. all have it

-- Auth Leaked Password Protection
-- This must be enabled in Supabase Dashboard, not via SQL:
-- Go to: Authentication → Providers → Email → Enable "Leaked Password Protection"
-- This checks passwords against HaveIBeenPwned.org database

