-- ================================================
-- COMPLETE DATABASE SCHEMA EXPORT
-- ================================================
-- This schema can be used to recreate the entire database
-- in a new Supabase instance or other PostgreSQL database

-- ================================================
-- 1. ENUMS
-- ================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'super_admin', 'institution_admin', 'instructor', 'issuer', 'candidate');

-- ================================================
-- 2. TABLES
-- ================================================

-- Profiles Table
CREATE TABLE public.profiles (
    id UUID NOT NULL PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    institution_id UUID,
    hedera_account_id TEXT,
    did TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles Table
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Institutions Table
CREATE TABLE public.institutions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    hedera_account_id TEXT NOT NULL,
    treasury_account_id TEXT,
    collection_token_id TEXT,
    did TEXT NOT NULL,
    logo_url TEXT,
    admin_user_id UUID,
    verified BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    subscription_tier TEXT,
    hcs_topic_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificate Cache Table
CREATE TABLE public.certificate_cache (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    certificate_id TEXT NOT NULL,
    token_id TEXT NOT NULL,
    serial_number BIGINT NOT NULL,
    issuer_did TEXT NOT NULL,
    recipient_did TEXT,
    recipient_account_id TEXT,
    recipient_email TEXT,
    course_name TEXT NOT NULL,
    institution_id UUID,
    issued_by_user_id UUID,
    ipfs_cid TEXT NOT NULL,
    metadata JSONB,
    hedera_tx_id TEXT,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claim Tokens Table
CREATE TABLE public.claim_tokens (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL,
    nonce UUID DEFAULT gen_random_uuid(),
    certificate_id TEXT NOT NULL,
    issued_by TEXT NOT NULL,
    claimed_by TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(token)
);

-- Instructor Candidates Table
CREATE TABLE public.instructor_candidates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    instructor_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    status TEXT DEFAULT 'active',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(instructor_id, candidate_id)
);

-- User Scopes Table
CREATE TABLE public.user_scopes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    institution_id UUID,
    scope_type TEXT,
    can_issue_certificates BOOLEAN DEFAULT false,
    can_manage_users BOOLEAN DEFAULT false,
    can_view_analytics BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    institution_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HCS Events Table
CREATE TABLE public.hcs_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id TEXT NOT NULL,
    sequence_number BIGINT NOT NULL,
    consensus_timestamp TEXT NOT NULL,
    message_type TEXT NOT NULL,
    payload JSONB,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(topic_id, sequence_number)
);

-- Webhooks Table
CREATE TABLE public.webhooks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    secret TEXT NOT NULL,
    events TEXT[] NOT NULL,
    institution_id UUID,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 3. INDEXES
-- ================================================

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_profiles_institution_id ON public.profiles(institution_id);
CREATE INDEX idx_profiles_hedera_account_id ON public.profiles(hedera_account_id);
CREATE INDEX idx_certificate_cache_token_id ON public.certificate_cache(token_id);
CREATE INDEX idx_certificate_cache_recipient_account_id ON public.certificate_cache(recipient_account_id);
CREATE INDEX idx_certificate_cache_issuer_did ON public.certificate_cache(issuer_did);
CREATE INDEX idx_certificate_cache_institution_id ON public.certificate_cache(institution_id);
CREATE INDEX idx_certificate_cache_certificate_id ON public.certificate_cache(certificate_id);
CREATE INDEX idx_claim_tokens_token ON public.claim_tokens(token);
CREATE INDEX idx_claim_tokens_certificate_id ON public.claim_tokens(certificate_id);
CREATE INDEX idx_instructor_candidates_instructor_id ON public.instructor_candidates(instructor_id);
CREATE INDEX idx_instructor_candidates_candidate_id ON public.instructor_candidates(candidate_id);
CREATE INDEX idx_instructor_candidates_institution_id ON public.instructor_candidates(institution_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_institution_id ON public.audit_logs(institution_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_hcs_events_topic_id ON public.hcs_events(topic_id);
CREATE INDEX idx_hcs_events_processed ON public.hcs_events(processed);

-- ================================================
-- 4. FUNCTIONS
-- ================================================

-- Has Role Function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Is Super Admin Function
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- Is Institution Admin Function
CREATE OR REPLACE FUNCTION public.is_institution_admin(_user_id UUID, _institution_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _user_id 
      AND ur.role = 'institution_admin'
      AND p.institution_id = _institution_id
  )
$$;

-- Is Instructor Function
CREATE OR REPLACE FUNCTION public.is_instructor(_user_id UUID, _institution_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _user_id 
      AND ur.role = 'instructor'
      AND p.institution_id = _institution_id
  )
$$;

-- Get User Institution Function
CREATE OR REPLACE FUNCTION public.get_user_institution(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT institution_id FROM public.profiles WHERE id = _user_id
$$;

-- Can Manage User Function
CREATE OR REPLACE FUNCTION public.can_manage_user(_manager_id UUID, _target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
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

-- Get Instructor Candidates Function
CREATE OR REPLACE FUNCTION public.get_instructor_candidates(_instructor_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT candidate_id FROM public.instructor_candidates 
  WHERE instructor_id = _instructor_id AND status = 'active'
$$;

-- Handle New User Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Handle New User Role Function
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Update Updated At Function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ================================================
-- 5. TRIGGERS
-- ================================================

-- Trigger for new auth users to create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for new auth users to assign default role
CREATE TRIGGER on_auth_user_role_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Trigger for updating profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Trigger for updating institutions updated_at
CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON public.institutions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hcs_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- ================================================
-- PROFILES POLICIES
-- ================================================

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Institution admins can view profiles in their institution"
ON public.profiles FOR SELECT
USING (is_institution_admin(auth.uid(), institution_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Institution admins can update profiles in their institution"
ON public.profiles FOR UPDATE
USING (is_institution_admin(auth.uid(), institution_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Instructors can view their candidates"
ON public.profiles FOR SELECT
USING (id IN (SELECT get_instructor_candidates(auth.uid())));

CREATE POLICY "Super admins can view aggregated profiles"
ON public.profiles FOR SELECT
USING (is_super_admin(auth.uid()));

-- ================================================
-- USER_ROLES POLICIES
-- ================================================

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- ================================================
-- INSTITUTIONS POLICIES
-- ================================================

CREATE POLICY "Institutions are viewable by all authenticated users"
ON public.institutions FOR SELECT
USING (true);

CREATE POLICY "Users can view their institution"
ON public.institutions FOR SELECT
USING (id = get_user_institution(auth.uid()));

CREATE POLICY "Institution admins can view their institution"
ON public.institutions FOR SELECT
USING (is_institution_admin(auth.uid(), id) OR is_super_admin(auth.uid()));

CREATE POLICY "Institution admins can update their institution"
ON public.institutions FOR UPDATE
USING (is_institution_admin(auth.uid(), id));

CREATE POLICY "Super admins can manage all institutions"
ON public.institutions FOR ALL
USING (is_super_admin(auth.uid()));

-- ================================================
-- CERTIFICATE_CACHE POLICIES
-- ================================================

CREATE POLICY "Certificates are viewable by all"
ON public.certificate_cache FOR SELECT
USING (true);

CREATE POLICY "Users can view their own certificates"
ON public.certificate_cache FOR SELECT
USING (recipient_account_id = (SELECT hedera_account_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Instructors can view certificates they issued"
ON public.certificate_cache FOR SELECT
USING (issued_by_user_id = auth.uid());

CREATE POLICY "Instructors can issue certificates"
ON public.certificate_cache FOR INSERT
WITH CHECK (
  issued_by_user_id = auth.uid() 
  AND (has_role(auth.uid(), 'instructor') OR has_role(auth.uid(), 'institution_admin'))
);

CREATE POLICY "Issuers can insert certificates"
ON public.certificate_cache FOR INSERT
WITH CHECK (has_role(auth.uid(), 'issuer') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Institution admins can view certificates in their institution"
ON public.certificate_cache FOR SELECT
USING (is_institution_admin(auth.uid(), institution_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Super admins can view aggregated certificate data"
ON public.certificate_cache FOR SELECT
USING (is_super_admin(auth.uid()));

-- ================================================
-- CLAIM_TOKENS POLICIES
-- ================================================

CREATE POLICY "Users can view their own claim tokens"
ON public.claim_tokens FOR SELECT
USING (
  certificate_id IN (
    SELECT certificate_id FROM certificate_cache 
    WHERE recipient_account_id = (SELECT hedera_account_id FROM profiles WHERE id = auth.uid())
  )
);

-- ================================================
-- INSTRUCTOR_CANDIDATES POLICIES
-- ================================================

CREATE POLICY "Instructors can view their candidates"
ON public.instructor_candidates FOR SELECT
USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can enroll candidates"
ON public.instructor_candidates FOR INSERT
WITH CHECK (auth.uid() = instructor_id AND has_role(auth.uid(), 'instructor'));

CREATE POLICY "Candidates can view their instructor relationship"
ON public.instructor_candidates FOR SELECT
USING (auth.uid() = candidate_id);

CREATE POLICY "Institution admins can view all relationships in their institution"
ON public.instructor_candidates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
      AND institution_id = instructor_candidates.institution_id 
      AND is_institution_admin(auth.uid(), institution_id)
  )
);

CREATE POLICY "Super admins can manage all relationships"
ON public.instructor_candidates FOR ALL
USING (is_super_admin(auth.uid()));

-- ================================================
-- USER_SCOPES POLICIES
-- ================================================

CREATE POLICY "Users can view their own scopes"
ON public.user_scopes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Institution admins can manage scopes in their institution"
ON public.user_scopes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
      AND institution_id = user_scopes.institution_id 
      AND is_institution_admin(auth.uid(), institution_id)
  )
);

CREATE POLICY "Super admins can manage all scopes"
ON public.user_scopes FOR ALL
USING (is_super_admin(auth.uid()));

-- ================================================
-- AUDIT_LOGS POLICIES
-- ================================================

CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "All authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Institution admins can view logs in their institution"
ON public.audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
      AND institution_id = audit_logs.institution_id 
      AND is_institution_admin(auth.uid(), institution_id)
  )
);

CREATE POLICY "Super admins can view all audit logs"
ON public.audit_logs FOR SELECT
USING (is_super_admin(auth.uid()));

-- ================================================
-- HCS_EVENTS POLICIES
-- ================================================

CREATE POLICY "Admins can manage HCS events"
ON public.hcs_events FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- ================================================
-- WEBHOOKS POLICIES
-- ================================================

CREATE POLICY "Admins can manage webhooks"
ON public.webhooks FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- ================================================
-- NOTES
-- ================================================
-- 
-- To use this schema in a new Supabase project:
-- 1. Create a new Supabase project
-- 2. Copy this entire SQL file
-- 3. Run it in the SQL Editor of your new Supabase project
-- 4. Update environment variables in your application
-- 5. Configure edge functions and secrets as needed
--
-- Required secrets for edge functions:
-- - HEDERA_OPERATOR_ID
-- - HEDERA_OPERATOR_KEY
-- - PINATA_JWT
-- - SUPABASE_URL
-- - SUPABASE_ANON_KEY
-- - SUPABASE_SERVICE_ROLE_KEY
--
-- ================================================
