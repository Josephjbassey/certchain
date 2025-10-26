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

-- Fix: certificates view should use SECURITY INVOKER instead of SECURITY DEFINER
-- This makes the view use the querying user's permissions, not the creator's
DROP VIEW IF EXISTS public.certificates;

CREATE OR REPLACE VIEW public.certificates
WITH (security_invoker=true)  -- Use querying user's permissions
AS
SELECT
  cc.certificate_id AS id,
  cc.token_id,
  cc.serial_number,
  cc.issuer_did,
  cc.recipient_account_id,
  cc.recipient_email,
  cc.course_name,
  cc.institution_id,
  cc.issued_by_user_id,
  cc.ipfs_cid,
  cc.metadata,
  cc.hedera_tx_id,
  cc.issued_at,
  cc.expires_at,
  cc.revoked_at,
  cc.created_at
FROM public.certificate_cache cc;

-- Note: Most other functions already have SET search_path = public
-- Check: is_super_admin, is_institution_admin, is_instructor, etc. all have it

-- Auth Leaked Password Protection
-- This must be enabled in Supabase Dashboard, not via SQL:
-- Go to: Authentication → Providers → Email → Enable "Leaked Password Protection"
-- This checks passwords against HaveIBeenPwned.org database

