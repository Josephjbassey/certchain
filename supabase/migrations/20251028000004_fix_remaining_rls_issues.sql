-- ================================================
-- FIX REMAINING RLS PERFORMANCE ISSUES
-- ================================================

BEGIN;

-- Drop old policies that weren't caught in previous migration
DROP POLICY IF EXISTS "Issuers can insert certificates" ON public.certificate_cache;
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can view their own invitation" ON public.invitations;
DROP POLICY IF EXISTS "Service role can manage all DIDs" ON public.user_dids;
DROP POLICY IF EXISTS "Public can read DID documents" ON public.user_dids;
DROP POLICY IF EXISTS "Users can view own api keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can create own api keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can update own api keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can delete own api keys" ON public.api_keys;
DROP POLICY IF EXISTS "Institution admins can view institution api keys" ON public.api_keys;

-- Recreate Invitations policies with optimization
CREATE POLICY "Admins can manage invitations"
ON public.invitations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (SELECT auth.uid()) 
      AND institution_id = invitations.institution_id 
      AND is_institution_admin((SELECT auth.uid()), institution_id)
  )
);

CREATE POLICY "Users can view their own invitation"
ON public.invitations FOR SELECT
USING (email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid())));

-- Recreate Service role policy for user_dids (this is for backend operations)
CREATE POLICY "Service role can manage all DIDs"
ON public.user_dids FOR ALL
USING ((SELECT auth.role()) = 'service_role');

-- Recreate Public DID document read policy
CREATE POLICY "Public can read DID documents"
ON public.user_dids FOR SELECT
USING (did_document IS NOT NULL);

-- Note: API keys policies were already recreated in previous migration as "Users can manage own API keys"
-- The separate insert/update/delete/select policies are now redundant and consolidated

-- Note: Institution admins api_keys policy was already recreated in previous migration

COMMIT;
