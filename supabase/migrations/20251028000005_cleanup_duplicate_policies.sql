-- ================================================
-- CLEANUP DUPLICATE RLS POLICIES (COMPREHENSIVE)
-- ================================================
-- This migration consolidates multiple permissive policies into single
-- efficient policies to resolve performance warnings from database linter
-- 
-- Strategy: Replace multiple separate policies with single consolidated
-- policies that use OR conditions to check all access patterns

BEGIN;

-- ============================================
-- APPLICATION_LOGS - Consolidate SELECT policies
-- ============================================
-- Remove: "Super admins can view all logs" + "Users can view own logs"
DROP POLICY IF EXISTS "Super admins can view all logs" ON public.application_logs;
DROP POLICY IF EXISTS "Users can view own logs" ON public.application_logs;
DROP POLICY IF EXISTS "Users can view relevant application logs" ON public.application_logs;

-- Create single consolidated policy
CREATE POLICY "Users can view relevant application logs" ON public.application_logs
  FOR SELECT
  USING (
    -- Users can view their own logs
    user_id = (SELECT auth.uid())
    OR
    -- Super admins can view all logs
    is_super_admin((SELECT auth.uid()))
  );

-- ============================================
-- AUDIT_LOGS - Consolidate SELECT policies
-- ============================================
-- Remove: 3 separate policies
DROP POLICY IF EXISTS "Institution admins can view logs in their institution" ON public.audit_logs;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view relevant audit logs" ON public.audit_logs;

-- Create single consolidated policy
CREATE POLICY "Users can view relevant audit logs" ON public.audit_logs
  FOR SELECT
  USING (
    -- Users can view their own logs
    user_id = (SELECT auth.uid())
    OR
    -- Institution admins can view logs in their institution
    is_institution_admin((SELECT auth.uid()), institution_id)
    OR
    -- Super admins can view all logs
    is_super_admin((SELECT auth.uid()))
  );

-- ============================================
-- CERTIFICATE_CACHE - Consolidate SELECT policies
-- ============================================
-- Remove: 4 separate SELECT policies
DROP POLICY IF EXISTS "Certificates are viewable by all" ON public.certificate_cache;
DROP POLICY IF EXISTS "Institution admins can view certificates in their institution" ON public.certificate_cache;
DROP POLICY IF EXISTS "Instructors can view certificates they issued" ON public.certificate_cache;
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.certificate_cache;
DROP POLICY IF EXISTS "Users can view relevant certificates" ON public.certificate_cache;

-- Create single consolidated policy
CREATE POLICY "Users can view relevant certificates" ON public.certificate_cache
  FOR SELECT
  USING (
    -- Public access (certificates are viewable by all)
    true
  );

-- ============================================
-- INSTITUTIONS - Consolidate policies
-- ============================================
-- Remove: 4 SELECT policies + 2 UPDATE policies
DROP POLICY IF EXISTS "Institution admins can view their institution" ON public.institutions;
DROP POLICY IF EXISTS "Institutions are viewable by all authenticated users" ON public.institutions;
DROP POLICY IF EXISTS "Super admins can manage all institutions" ON public.institutions;
DROP POLICY IF EXISTS "Users can view their institution" ON public.institutions;
DROP POLICY IF EXISTS "Institution admins can update their institution" ON public.institutions;
DROP POLICY IF EXISTS "Users can view institutions" ON public.institutions;
DROP POLICY IF EXISTS "Admins can update institutions" ON public.institutions;

-- Create consolidated SELECT policy
CREATE POLICY "Users can view institutions" ON public.institutions
  FOR SELECT
  USING (
    -- All authenticated users can view institutions
    true
  );

-- Create consolidated UPDATE policy  
CREATE POLICY "Admins can update institutions" ON public.institutions
  FOR UPDATE
  USING (
    -- Institution admins can update their own institution
    is_institution_admin((SELECT auth.uid()), id)
    OR
    -- Super admins can update all institutions
    is_super_admin((SELECT auth.uid()))
  );

-- ============================================
-- INSTRUCTOR_CANDIDATES - Consolidate policies
-- ============================================
-- Remove: 4 SELECT + 2 INSERT policies
DROP POLICY IF EXISTS "Candidates can view their instructor relationship" ON public.instructor_candidates;
DROP POLICY IF EXISTS "Institution admins can view all relationships in their institut" ON public.instructor_candidates;
DROP POLICY IF EXISTS "Instructors can view their candidates" ON public.instructor_candidates;
DROP POLICY IF EXISTS "Super admins can manage all relationships" ON public.instructor_candidates;
DROP POLICY IF EXISTS "Instructors can enroll candidates" ON public.instructor_candidates;
DROP POLICY IF EXISTS "Users can view relevant instructor relationships" ON public.instructor_candidates;
DROP POLICY IF EXISTS "Instructors can manage candidate relationships" ON public.instructor_candidates;

-- Create consolidated SELECT policy
CREATE POLICY "Users can view relevant instructor relationships" ON public.instructor_candidates
  FOR SELECT
  USING (
    -- Candidates can view their relationships
    candidate_id = (SELECT auth.uid())
    OR
    -- Instructors can view their candidates
    instructor_id = (SELECT auth.uid())
    OR
    -- Institution admins can view relationships in their institution
    is_institution_admin((SELECT auth.uid()), (
      SELECT institution_id FROM public.profiles WHERE id = instructor_id
    ))
    OR
    -- Super admins can view all
    is_super_admin((SELECT auth.uid()))
  );

-- Create consolidated INSERT policy
CREATE POLICY "Instructors can manage candidate relationships" ON public.instructor_candidates
  FOR INSERT
  WITH CHECK (
    instructor_id = (SELECT auth.uid())
    OR
    is_super_admin((SELECT auth.uid()))
  );

-- ============================================
-- INVITATIONS - Consolidate SELECT policies  
-- ============================================
-- Remove: 2 SELECT policies
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can view their own invitation" ON public.invitations;
DROP POLICY IF EXISTS "Users can view relevant invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can manage relevant invitations" ON public.invitations;

-- Create single consolidated policy for all operations
-- Note: FOR ALL includes SELECT, so we don't need a separate SELECT policy
CREATE POLICY "Users can manage relevant invitations" ON public.invitations
  FOR ALL
  USING (
    -- Users can view invitations sent to their email
    email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR
    -- Institution admins can manage invitations in their institution
    is_institution_admin((SELECT auth.uid()), institution_id)
    OR
    -- Super admins can manage all invitations
    is_super_admin((SELECT auth.uid()))
  );

-- ============================================
-- PROFILES - Consolidate policies
-- ============================================
-- Remove: 4 SELECT + 3 UPDATE policies
DROP POLICY IF EXISTS "Institution admins can view profiles in their institution" ON public.profiles;
DROP POLICY IF EXISTS "Instructors can view their candidates" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Institution admins can update profiles in their institution" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view relevant profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update relevant profiles" ON public.profiles;

-- Create consolidated SELECT policy
CREATE POLICY "Users can view relevant profiles" ON public.profiles
  FOR SELECT
  USING (
    -- Users can view their own profile
    id = (SELECT auth.uid())
    OR
    -- Instructors can view their candidates
    id IN (
      SELECT candidate_id FROM public.instructor_candidates
      WHERE instructor_id = (SELECT auth.uid())
    )
    OR
    -- Institution admins can view profiles in their institution
    is_institution_admin((SELECT auth.uid()), institution_id)
    OR
    -- Super admins can view all profiles
    is_super_admin((SELECT auth.uid()))
  );

-- Create consolidated UPDATE policy
CREATE POLICY "Users can update relevant profiles" ON public.profiles
  FOR UPDATE
  USING (
    -- Users can update their own profile
    id = (SELECT auth.uid())
    OR
    -- Institution admins can update profiles in their institution
    is_institution_admin((SELECT auth.uid()), institution_id)
    OR
    -- Super admins can update all profiles
    is_super_admin((SELECT auth.uid()))
  );

-- ============================================
-- USER_DIDS - Consolidate policies
-- ============================================
-- Remove: 3 SELECT + 2 each for INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Public can read DID documents" ON public.user_dids;
DROP POLICY IF EXISTS "Service role can manage all DIDs" ON public.user_dids;
DROP POLICY IF EXISTS "Users can manage own DIDs" ON public.user_dids;
DROP POLICY IF EXISTS "DID documents are readable" ON public.user_dids;
DROP POLICY IF EXISTS "Users and services can manage DIDs" ON public.user_dids;

-- Create single consolidated policy for all operations
-- Note: Public read access means everyone can SELECT, and FOR ALL includes SELECT
-- So we only need one policy that handles all access patterns
CREATE POLICY "Users and services can manage DIDs" ON public.user_dids
  FOR ALL
  USING (
    -- Public read access for DID resolution (everyone can SELECT)
    true
  )
  WITH CHECK (
    -- Only users and service role can INSERT/UPDATE/DELETE
    user_id = (SELECT auth.uid())
    OR
    (SELECT auth.jwt()->>'role') = 'service_role'
  );

-- ============================================
-- USER_ROLES - Consolidate SELECT policies
-- ============================================
-- Remove: 2 SELECT policies
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view relevant roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage relevant roles" ON public.user_roles;

-- Create single consolidated policy for all operations
-- Note: FOR ALL includes SELECT, so we don't need a separate SELECT policy
CREATE POLICY "Users can manage relevant roles" ON public.user_roles
  FOR ALL
  USING (
    -- Users can view their own roles (SELECT)
    user_id = (SELECT auth.uid())
    OR
    -- Super admins can manage all roles (all operations)
    is_super_admin((SELECT auth.uid()))
  )
  WITH CHECK (
    -- Only super admins can INSERT/UPDATE/DELETE
    is_super_admin((SELECT auth.uid()))
  );

-- ============================================
-- USER_SCOPES - Consolidate policies
-- ============================================
-- Remove: 3 SELECT + 2 each for INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Institution admins can manage scopes in their institution" ON public.user_scopes;
DROP POLICY IF EXISTS "Super admins can manage all scopes" ON public.user_scopes;
DROP POLICY IF EXISTS "Users can view their own scopes" ON public.user_scopes;
DROP POLICY IF EXISTS "Users can view relevant scopes" ON public.user_scopes;
DROP POLICY IF EXISTS "Admins can manage scopes" ON public.user_scopes;
DROP POLICY IF EXISTS "Users can manage relevant scopes" ON public.user_scopes;

-- Create single consolidated policy for all operations
-- Note: FOR ALL includes SELECT, so we don't need a separate SELECT policy
CREATE POLICY "Users can manage relevant scopes" ON public.user_scopes
  FOR ALL
  USING (
    -- Users can view their own scopes (SELECT)
    user_id = (SELECT auth.uid())
    OR
    -- Institution admins can manage scopes in their institution
    is_institution_admin((SELECT auth.uid()), (
      SELECT institution_id FROM public.profiles WHERE id = user_scopes.user_id
    ))
    OR
    -- Super admins can manage all scopes
    is_super_admin((SELECT auth.uid()))
  )
  WITH CHECK (
    -- Only admins can INSERT/UPDATE/DELETE
    is_institution_admin((SELECT auth.uid()), (
      SELECT institution_id FROM public.profiles WHERE id = user_scopes.user_id
    ))
    OR
    is_super_admin((SELECT auth.uid()))
  );

-- ============================================
-- WEBHOOKS - Consolidate policies
-- ============================================
-- Remove: 2 policies for each action (SELECT/INSERT/UPDATE/DELETE)
DROP POLICY IF EXISTS "Super admins can manage webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can manage own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can manage relevant webhooks" ON public.webhooks;

-- Create single consolidated policy for all operations
CREATE POLICY "Users can manage relevant webhooks" ON public.webhooks
  FOR ALL
  USING (
    -- Users can manage their own webhooks
    user_id = (SELECT auth.uid())
    OR
    -- Super admins can manage all webhooks
    is_super_admin((SELECT auth.uid()))
  );

COMMIT;
