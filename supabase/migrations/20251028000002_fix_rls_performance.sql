-- ================================================
-- RLS PERFORMANCE FIXES
-- ================================================

BEGIN;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Institution admins can view profiles in their institution" ON public.profiles;
DROP POLICY IF EXISTS "Institution admins can update profiles in their institution" ON public.profiles;
DROP POLICY IF EXISTS "Instructors can view their candidates" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view aggregated profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Institutions are viewable by all authenticated users" ON public.institutions;
DROP POLICY IF EXISTS "Users can view their institution" ON public.institutions;
DROP POLICY IF EXISTS "Institution admins can view their institution" ON public.institutions;
DROP POLICY IF EXISTS "Institution admins can update their institution" ON public.institutions;
DROP POLICY IF EXISTS "Super admins can manage all institutions" ON public.institutions;
DROP POLICY IF EXISTS "Certificates are viewable by all" ON public.certificate_cache;
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.certificate_cache;
DROP POLICY IF EXISTS "Instructors can view certificates they issued" ON public.certificate_cache;
DROP POLICY IF EXISTS "Instructors can issue certificates" ON public.certificate_cache;
DROP POLICY IF EXISTS "Institution admins can view certificates in their institution" ON public.certificate_cache;
DROP POLICY IF EXISTS "Super admins can view aggregated certificate data" ON public.certificate_cache;
DROP POLICY IF EXISTS "Users can view their own claim tokens" ON public.claim_tokens;
DROP POLICY IF EXISTS "Instructors can view their candidates" ON public.instructor_candidates;
DROP POLICY IF EXISTS "Instructors can enroll candidates" ON public.instructor_candidates;
DROP POLICY IF EXISTS "Candidates can view their instructor relationship" ON public.instructor_candidates;
DROP POLICY IF EXISTS "Institution admins can view all relationships in their institution" ON public.instructor_candidates;
DROP POLICY IF EXISTS "Super admins can manage all relationships" ON public.instructor_candidates;
DROP POLICY IF EXISTS "Users can view their own scopes" ON public.user_scopes;
DROP POLICY IF EXISTS "Institution admins can manage scopes in their institution" ON public.user_scopes;
DROP POLICY IF EXISTS "Super admins can manage all scopes" ON public.user_scopes;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "All authenticated users can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Institution admins can view logs in their institution" ON public.audit_logs;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Super admins can manage HCS events" ON public.hcs_events;
DROP POLICY IF EXISTS "Users can manage own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Super admins can manage webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can view own DIDs" ON public.user_dids;
DROP POLICY IF EXISTS "Users can manage own DIDs" ON public.user_dids;
DROP POLICY IF EXISTS "Users can view own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can manage own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can view own wallets" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can manage own wallets" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can insert own logs" ON public.application_logs;
DROP POLICY IF EXISTS "Users can view own logs" ON public.application_logs;
DROP POLICY IF EXISTS "Super admins can view all logs" ON public.application_logs;

-- Recreate policies with performance improvements

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING ((SELECT auth.uid()) = id);

CREATE POLICY "Super admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_super_admin((SELECT auth.uid())));

CREATE POLICY "Super admins can update all profiles"
ON public.profiles FOR UPDATE
USING (is_super_admin((SELECT auth.uid())));

CREATE POLICY "Institution admins can view profiles in their institution"
ON public.profiles FOR SELECT
USING (is_institution_admin((SELECT auth.uid()), institution_id) OR is_super_admin((SELECT auth.uid())));

CREATE POLICY "Institution admins can update profiles in their institution"
ON public.profiles FOR UPDATE
USING (is_institution_admin((SELECT auth.uid()), institution_id) OR is_super_admin((SELECT auth.uid())));

CREATE POLICY "Instructors can view their candidates"
ON public.profiles FOR SELECT
USING (id IN (SELECT get_instructor_candidates((SELECT auth.uid()))));

CREATE POLICY "Super admins can view aggregated profiles"
ON public.profiles FOR SELECT
USING (is_super_admin((SELECT auth.uid())));

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Super admins can manage roles"
ON public.user_roles FOR ALL
USING (is_super_admin((SELECT auth.uid())));

CREATE POLICY "Institutions are viewable by all authenticated users"
ON public.institutions FOR SELECT
USING (true);

CREATE POLICY "Users can view their institution"
ON public.institutions FOR SELECT
USING (id = get_user_institution((SELECT auth.uid())));

CREATE POLICY "Institution admins can view their institution"
ON public.institutions FOR SELECT
USING (is_institution_admin((SELECT auth.uid()), id) OR is_super_admin((SELECT auth.uid())));

CREATE POLICY "Institution admins can update their institution"
ON public.institutions FOR UPDATE
USING (is_institution_admin((SELECT auth.uid()), id));

CREATE POLICY "Super admins can manage all institutions"
ON public.institutions FOR ALL
USING (is_super_admin((SELECT auth.uid())));

CREATE POLICY "Certificates are viewable by all"
ON public.certificate_cache FOR SELECT
USING (true);

CREATE POLICY "Users can view their own certificates"
ON public.certificate_cache FOR SELECT
USING (recipient_account_id = (SELECT hedera_account_id FROM profiles WHERE id = (SELECT auth.uid())));

CREATE POLICY "Instructors can view certificates they issued"
ON public.certificate_cache FOR SELECT
USING (issued_by_user_id = (SELECT auth.uid()));

CREATE POLICY "Instructors can issue certificates"
ON public.certificate_cache FOR INSERT
WITH CHECK (
  issued_by_user_id = (SELECT auth.uid()) 
  AND (has_role((SELECT auth.uid()), 'instructor') OR has_role((SELECT auth.uid()), 'institution_admin'))
);

CREATE POLICY "Institution admins can view certificates in their institution"
ON public.certificate_cache FOR SELECT
USING (is_institution_admin((SELECT auth.uid()), institution_id) OR is_super_admin((SELECT auth.uid())));

CREATE POLICY "Super admins can view aggregated certificate data"
ON public.certificate_cache FOR SELECT
USING (is_super_admin((SELECT auth.uid())));

CREATE POLICY "Users can view their own claim tokens"
ON public.claim_tokens FOR SELECT
USING (
  certificate_id IN (
    SELECT certificate_id FROM certificate_cache 
    WHERE recipient_account_id = (SELECT hedera_account_id FROM profiles WHERE id = (SELECT auth.uid()))
  )
);

CREATE POLICY "Instructors can view their candidates"
ON public.instructor_candidates FOR SELECT
USING ((SELECT auth.uid()) = instructor_id);

CREATE POLICY "Instructors can enroll candidates"
ON public.instructor_candidates FOR INSERT
WITH CHECK ((SELECT auth.uid()) = instructor_id AND has_role((SELECT auth.uid()), 'instructor'));

CREATE POLICY "Candidates can view their instructor relationship"
ON public.instructor_candidates FOR SELECT
USING ((SELECT auth.uid()) = candidate_id);

CREATE POLICY "Institution admins can view all relationships in their institution"
ON public.instructor_candidates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (SELECT auth.uid()) 
      AND institution_id = instructor_candidates.institution_id 
      AND is_institution_admin((SELECT auth.uid()), institution_id)
  )
);

CREATE POLICY "Super admins can manage all relationships"
ON public.instructor_candidates FOR ALL
USING (is_super_admin((SELECT auth.uid())));

CREATE POLICY "Users can view their own scopes"
ON public.user_scopes FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Institution admins can manage scopes in their institution"
ON public.user_scopes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (SELECT auth.uid()) 
      AND institution_id = user_scopes.institution_id 
      AND is_institution_admin((SELECT auth.uid()), institution_id)
  )
);

CREATE POLICY "Super admins can manage all scopes"
ON public.user_scopes FOR ALL
USING (is_super_admin((SELECT auth.uid())));

CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "All authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Institution admins can view logs in their institution"
ON public.audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = (SELECT auth.uid()) 
      AND institution_id = audit_logs.institution_id 
      AND is_institution_admin((SELECT auth.uid()), institution_id)
  )
);

CREATE POLICY "Super admins can view all audit logs"
ON public.audit_logs FOR SELECT
USING (is_super_admin((SELECT auth.uid())));

CREATE POLICY "Super admins can manage HCS events"
ON public.hcs_events FOR ALL
USING (is_super_admin((SELECT auth.uid())));

CREATE POLICY "Users can manage own webhooks"
ON public.webhooks FOR ALL
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Super admins can manage webhooks"
ON public.webhooks FOR ALL
USING (is_super_admin((SELECT auth.uid())));

CREATE POLICY "Users can view own DIDs"
ON public.user_dids FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can manage own DIDs"
ON public.user_dids FOR ALL
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can view own API keys"
ON public.api_keys FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can manage own API keys"
ON public.api_keys FOR ALL
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can view own wallets"
ON public.user_wallets FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can manage own wallets"
ON public.user_wallets FOR ALL
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own logs"
ON public.application_logs FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can view own logs"
ON public.application_logs FOR SELECT
USING ((SELECT auth.uid()) = user_id OR user_id IS NULL);

CREATE POLICY "Super admins can view all logs"
ON public.application_logs FOR SELECT
USING (is_super_admin((SELECT auth.uid())));

COMMIT;
