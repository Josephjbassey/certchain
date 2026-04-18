-- ================================================
-- CertChain Merge Migration
-- Date: 2025-10-21
-- Purpose: Merge legacy schema with new app expectations
-- Adds new tables, alters existing structures, and creates a compatibility view
-- Idempotent: safe to run multiple times
-- ================================================

-- Extensions (safe if already installed)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ================================================
-- 1) New Tables required by frontend
-- ================================================

-- user_dids: store DID <-> Hedera account mapping
CREATE TABLE IF NOT EXISTS public.user_dids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  did TEXT UNIQUE NOT NULL,
  account_id TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'testnet',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_dids_account_id ON public.user_dids(account_id);
CREATE INDEX IF NOT EXISTS idx_user_dids_user_id ON public.user_dids(user_id);

-- api_keys: hashed secrets + scopes
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  hashed_key TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  UNIQUE (user_id, key_prefix)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys(is_active);

-- user_wallets: connected wallets with primary flag
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  wallet_type TEXT NOT NULL, -- e.g., hashpack|blade|kabila|walletconnect
  network TEXT NOT NULL DEFAULT 'testnet',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  UNIQUE (user_id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_is_primary ON public.user_wallets(is_primary);

-- application_logs: structured app logs
CREATE TABLE IF NOT EXISTS public.application_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  level TEXT NOT NULL, -- debug|info|warn|error|critical
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_application_logs_level ON public.application_logs(level);
CREATE INDEX IF NOT_EXISTS idx_application_logs_created_at ON public.application_logs(created_at DESC);

-- ================================================
-- 2) Alter existing tables for compatibility
-- ================================================

-- webhooks: add columns expected by UI
ALTER TABLE public.webhooks
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN;

-- Copy existing 'active' into 'is_active' if present and is_active is null
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'webhooks' AND column_name = 'active'
  ) THEN
    UPDATE public.webhooks SET is_active = COALESCE(is_active, active);
  END IF;
END $$;

ALTER TABLE public.webhooks
  ALTER COLUMN is_active SET DEFAULT TRUE;

ALTER TABLE public.webhooks
  ADD COLUMN IF NOT EXISTS failure_count INTEGER NOT NULL DEFAULT 0;

-- ================================================
-- 3) Compatibility view for 'certificates'
-- The frontend expects a 'certificates' relation; map from certificate_cache
-- ================================================

CREATE OR REPLACE VIEW public.certificates AS
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

-- Helpful indexes on the underlying table already exist; ensure presence
CREATE INDEX IF NOT EXISTS idx_certificates_recipient_account_id ON public.certificate_cache(recipient_account_id);
CREATE INDEX IF NOT EXISTS idx_certificates_token_serial ON public.certificate_cache(token_id, serial_number);

-- ================================================
-- 4) Row-Level Security for new tables
-- ================================================

-- Enable RLS
ALTER TABLE public.user_dids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;

-- user_dids policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_dids' AND policyname='Users manage own DIDs'
  ) THEN
    CREATE POLICY "Users manage own DIDs" ON public.user_dids
      FOR ALL USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- api_keys policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='api_keys' AND policyname='Users manage own API keys'
  ) THEN
    CREATE POLICY "Users manage own API keys" ON public.api_keys
      FOR ALL USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- user_wallets policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_wallets' AND policyname='Users manage own wallets'
  ) THEN
    CREATE POLICY "Users manage own wallets" ON public.user_wallets
      FOR ALL USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- application_logs policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='application_logs' AND policyname='Users can insert own logs'
  ) THEN
    CREATE POLICY "Users can insert own logs" ON public.application_logs
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='application_logs' AND policyname='Users can view own logs'
  ) THEN
    CREATE POLICY "Users can view own logs" ON public.application_logs
      FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='application_logs' AND policyname='Super admins can view all logs'
  ) THEN
    CREATE POLICY "Super admins can view all logs" ON public.application_logs
      FOR SELECT USING (public.is_super_admin(auth.uid()));
  END IF;
END $$;

-- ================================================
-- 5) Notes
-- - The 'certificates' view exposes certificate_cache for frontend compatibility.
-- - Both webhooks.active and webhooks.is_active are maintained for backward compatibility.
-- - After running this migration, regenerate types:
--   supabase gen types typescript --local > src/integrations/supabase/types.ts
-- ================================================
