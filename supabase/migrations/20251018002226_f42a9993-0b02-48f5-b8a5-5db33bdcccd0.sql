-- Step 2: Create Tables, Functions, and Policies

-- 1.2 Create User Scopes Table
CREATE TABLE IF NOT EXISTS public.user_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  scope_type TEXT CHECK (scope_type IN ('institution', 'department', 'course')),
  can_manage_users BOOLEAN DEFAULT false,
  can_issue_certificates BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, institution_id, scope_type)
);

ALTER TABLE public.user_scopes ENABLE ROW LEVEL SECURITY;

-- 1.3 Update Institutions Table
ALTER TABLE public.institutions 
  ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'active', 'suspended')) DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT;

-- 1.4 Create Instructor-Candidate Relationship Table
CREATE TABLE IF NOT EXISTS public.instructor_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT CHECK (status IN ('active', 'graduated', 'withdrawn')) DEFAULT 'active',
  UNIQUE(instructor_id, candidate_id)
);

ALTER TABLE public.instructor_candidates ENABLE ROW LEVEL SECURITY;

-- 1.5 Update Certificate Cache for Isolation
ALTER TABLE public.certificate_cache 
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id),
  ADD COLUMN IF NOT EXISTS issued_by_user_id UUID REFERENCES public.profiles(id);

-- 1.6 Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  institution_id UUID REFERENCES public.institutions(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Phase 2: Security Definer Functions

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- Check if user is institution admin
CREATE OR REPLACE FUNCTION public.is_institution_admin(_user_id UUID, _institution_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _user_id 
      AND ur.role = 'institution_admin'
      AND p.institution_id = _institution_id
  )
$$;

-- Check if user is instructor in institution
CREATE OR REPLACE FUNCTION public.is_instructor(_user_id UUID, _institution_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _user_id 
      AND ur.role = 'instructor'
      AND p.institution_id = _institution_id
  )
$$;

-- Get user's institution
CREATE OR REPLACE FUNCTION public.get_user_institution(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT institution_id FROM public.profiles WHERE id = _user_id
$$;

-- Check if manager can manage target user
CREATE OR REPLACE FUNCTION public.can_manage_user(_manager_id UUID, _target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.is_super_admin(_manager_id) THEN true
    WHEN EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles mp ON mp.id = _manager_id
      JOIN public.profiles tp ON tp.id = _target_user_id
      WHERE ur.user_id = _manager_id 
        AND ur.role = 'institution_admin'
        AND mp.institution_id = tp.institution_id
    ) THEN true
    WHEN EXISTS (
      SELECT 1 FROM public.instructor_candidates
      WHERE instructor_id = _manager_id AND candidate_id = _target_user_id
    ) THEN true
    ELSE false
  END
$$;

-- Get instructor's candidates
CREATE OR REPLACE FUNCTION public.get_instructor_candidates(_instructor_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT candidate_id FROM public.instructor_candidates 
  WHERE instructor_id = _instructor_id AND status = 'active'
$$;

-- RLS Policies

-- User Scopes Policies
CREATE POLICY "Users can view their own scopes"
  ON public.user_scopes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all scopes"
  ON public.user_scopes FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Institution admins can manage scopes in their institution"
  ON public.user_scopes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
        AND institution_id = user_scopes.institution_id
        AND public.is_institution_admin(auth.uid(), institution_id)
    )
  );

-- Instructor Candidates Policies
CREATE POLICY "Instructors can view their candidates"
  ON public.instructor_candidates FOR SELECT
  USING (auth.uid() = instructor_id);

CREATE POLICY "Candidates can view their instructor relationship"
  ON public.instructor_candidates FOR SELECT
  USING (auth.uid() = candidate_id);

CREATE POLICY "Institution admins can view all relationships in their institution"
  ON public.instructor_candidates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
        AND institution_id = instructor_candidates.institution_id
        AND public.is_institution_admin(auth.uid(), institution_id)
    )
  );

CREATE POLICY "Instructors can enroll candidates"
  ON public.instructor_candidates FOR INSERT
  WITH CHECK (
    auth.uid() = instructor_id AND
    public.has_role(auth.uid(), 'instructor')
  );

CREATE POLICY "Super admins can manage all relationships"
  ON public.instructor_candidates FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- Updated Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view aggregated profiles (no PII)" ON public.profiles;
DROP POLICY IF EXISTS "Institution admins can view profiles in their institution" ON public.profiles;
DROP POLICY IF EXISTS "Institution admins can update profiles in their institution" ON public.profiles;
DROP POLICY IF EXISTS "Instructors can view their candidates" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Super admins can view aggregated profiles"
  ON public.profiles FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Institution admins can view profiles in their institution"
  ON public.profiles FOR SELECT
  USING (
    public.is_institution_admin(auth.uid(), institution_id) OR
    public.is_super_admin(auth.uid())
  );

CREATE POLICY "Institution admins can update profiles in their institution"
  ON public.profiles FOR UPDATE
  USING (
    public.is_institution_admin(auth.uid(), institution_id) OR
    public.is_super_admin(auth.uid())
  );

CREATE POLICY "Instructors can view their candidates"
  ON public.profiles FOR SELECT
  USING (
    id IN (SELECT public.get_instructor_candidates(auth.uid()))
  );

-- Updated Institutions Policies
DROP POLICY IF EXISTS "Super admins can manage all institutions" ON public.institutions;
DROP POLICY IF EXISTS "Institution admins can view their institution" ON public.institutions;
DROP POLICY IF EXISTS "Institution admins can update their institution" ON public.institutions;
DROP POLICY IF EXISTS "Users can view their institution" ON public.institutions;

CREATE POLICY "Super admins can manage all institutions"
  ON public.institutions FOR ALL
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Institution admins can view their institution"
  ON public.institutions FOR SELECT
  USING (
    public.is_institution_admin(auth.uid(), id) OR
    public.is_super_admin(auth.uid())
  );

CREATE POLICY "Institution admins can update their institution"
  ON public.institutions FOR UPDATE
  USING (public.is_institution_admin(auth.uid(), id));

CREATE POLICY "Users can view their institution"
  ON public.institutions FOR SELECT
  USING (
    id = public.get_user_institution(auth.uid())
  );

-- Updated Certificate Cache Policies
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.certificate_cache;
DROP POLICY IF EXISTS "Institution admins can view certificates in their institution" ON public.certificate_cache;
DROP POLICY IF EXISTS "Instructors can view certificates they issued" ON public.certificate_cache;
DROP POLICY IF EXISTS "Instructors can issue certificates" ON public.certificate_cache;
DROP POLICY IF EXISTS "Super admins can view aggregated certificate data" ON public.certificate_cache;

CREATE POLICY "Users can view their own certificates"
  ON public.certificate_cache FOR SELECT
  USING (recipient_account_id = (SELECT hedera_account_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Institution admins can view certificates in their institution"
  ON public.certificate_cache FOR SELECT
  USING (
    public.is_institution_admin(auth.uid(), institution_id) OR
    public.is_super_admin(auth.uid())
  );

CREATE POLICY "Instructors can view certificates they issued"
  ON public.certificate_cache FOR SELECT
  USING (issued_by_user_id = auth.uid());

CREATE POLICY "Instructors can issue certificates"
  ON public.certificate_cache FOR INSERT
  WITH CHECK (
    issued_by_user_id = auth.uid() AND
    (public.has_role(auth.uid(), 'instructor') OR public.has_role(auth.uid(), 'institution_admin'))
  );

CREATE POLICY "Super admins can view aggregated certificate data"
  ON public.certificate_cache FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- Audit Logs Policies
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Institution admins can view logs in their institution"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
        AND institution_id = audit_logs.institution_id
        AND public.is_institution_admin(auth.uid(), institution_id)
    )
  );

CREATE POLICY "All authenticated users can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_scopes_user_id ON public.user_scopes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scopes_institution_id ON public.user_scopes(institution_id);
CREATE INDEX IF NOT EXISTS idx_instructor_candidates_instructor ON public.instructor_candidates(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_candidates_candidate ON public.instructor_candidates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_instructor_candidates_institution ON public.instructor_candidates(institution_id);
CREATE INDEX IF NOT EXISTS idx_certificate_cache_institution ON public.certificate_cache(institution_id);
CREATE INDEX IF NOT EXISTS idx_certificate_cache_issued_by ON public.certificate_cache(issued_by_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_institution ON public.audit_logs(institution_id);
CREATE INDEX IF NOT EXISTS idx_institutions_admin ON public.institutions(admin_user_id);