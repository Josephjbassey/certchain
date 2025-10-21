-- ================================================
-- COMPLETE DATABASE SCHEMA EXPORT
-- ================================================
-- This schema can be used to recreate the entire database
-- in a new Supabase instance or other PostgreSQL database

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ================================================
-- 1. ENUMS
-- ================================================

CREATE TYPE public.app_role AS ENUM ('super_admin', 'institution_admin', 'instructor', 'candidate');

-- ================================================
-- 2. TABLES
-- ================================================

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    institution_id UUID,
    hedera_account_id TEXT,
    did TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Institutions Table
CREATE TABLE IF NOT EXISTS public.institutions (
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
CREATE TABLE IF NOT EXISTS public.certificate_cache (
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
CREATE TABLE IF NOT EXISTS public.claim_tokens (
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
CREATE TABLE IF NOT EXISTS public.instructor_candidates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    instructor_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    status TEXT DEFAULT 'active',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(instructor_id, candidate_id)
);

-- User Scopes Table
CREATE TABLE IF NOT EXISTS public.user_scopes (
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
CREATE TABLE IF NOT EXISTS public.audit_logs (
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
CREATE TABLE IF NOT EXISTS public.hcs_events (
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
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL,
  institution_id UUID,
  is_active BOOLEAN DEFAULT true,
  failure_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User DIDs Table (account <-> DID mapping)
CREATE TABLE IF NOT EXISTS public.user_dids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  did TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'testnet',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, network)
);

-- API Keys Table (hashed storage)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Connected Wallets Table
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  wallet_type TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, account_id)
);

-- Application Logs Table (structured logs)
CREATE TABLE IF NOT EXISTS public.application_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
  message TEXT NOT NULL,
  context JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
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
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON public.webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_is_active ON public.webhooks(is_active);
CREATE INDEX IF NOT EXISTS idx_user_dids_account_id ON public.user_dids(account_id);
CREATE INDEX IF NOT EXISTS idx_user_dids_user_id ON public.user_dids(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_account_id ON public.user_wallets(account_id);
CREATE INDEX IF NOT EXISTS idx_application_logs_level ON public.application_logs(level);
CREATE INDEX IF NOT EXISTS idx_application_logs_user_id ON public.application_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_application_logs_timestamp ON public.application_logs(timestamp DESC);

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
  VALUES (NEW.id, 'candidate');
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

  -- Certificates compatibility view (optional)
  CREATE OR REPLACE VIEW public.certificates AS
  SELECT
    cc.certificate_id AS id,
    cc.token_id,
    cc.serial_number,
    cc.issuer_did,
    cc.recipient_did,
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
  ALTER TABLE public.user_dids ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;

-- ================================================
-- PROFILES POLICIES
-- ================================================

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update all profiles"
ON public.profiles FOR UPDATE
USING (is_super_admin(auth.uid()));

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

CREATE POLICY "Super admins can manage roles"
ON public.user_roles FOR ALL
USING (is_super_admin(auth.uid()));

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

-- Note: No separate 'issuer' role; insert permission covered by instructor/institution_admin and super_admin policies

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

CREATE POLICY "Super admins can manage HCS events"
ON public.hcs_events FOR ALL
USING (is_super_admin(auth.uid()));

-- ================================================
-- WEBHOOKS POLICIES
-- ================================================

CREATE POLICY "Users can manage own webhooks"
ON public.webhooks FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage webhooks"
ON public.webhooks FOR ALL
USING (is_super_admin(auth.uid()));

-- ================================================
-- USER_DIDS POLICIES
-- ================================================

CREATE POLICY "Users can view own DIDs"
ON public.user_dids FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own DIDs"
ON public.user_dids FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================
-- API_KEYS POLICIES
-- ================================================

CREATE POLICY "Users can view own API keys"
ON public.api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own API keys"
ON public.api_keys FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================
-- USER_WALLETS POLICIES
-- ================================================

CREATE POLICY "Users can view own wallets"
ON public.user_wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wallets"
ON public.user_wallets FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================
-- APPLICATION_LOGS POLICIES
-- ================================================

CREATE POLICY "Users can insert own logs"
ON public.application_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own logs"
ON public.application_logs FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Super admins can view all logs"
ON public.application_logs FOR SELECT
USING (is_super_admin(auth.uid()));

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
-- After applying, regenerate client types locally:
-- supabase gen types typescript --local > src/integrations/supabase/types.ts
--
-- ================================================
