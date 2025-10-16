-- CertChain: Minimal database for caching/indexing only
-- Source of truth: Hedera HTS (NFTs) + HCS (events) + IPFS (metadata)

-- User profiles table (authentication extension)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hedera_account_id TEXT,
  did TEXT UNIQUE,
  display_name TEXT,
  email TEXT,
  institution_id UUID,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'issuer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Institution profiles (issuers)
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  domain TEXT,
  hedera_account_id TEXT NOT NULL,
  treasury_account_id TEXT,
  collection_token_id TEXT,
  hcs_topic_id TEXT,
  logo_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificate cache (indexed from Hedera HTS + IPFS)
-- This is NOT the source of truth, just for faster queries
CREATE TABLE IF NOT EXISTS public.certificate_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id TEXT UNIQUE NOT NULL,
  token_id TEXT NOT NULL,
  serial_number BIGINT NOT NULL,
  issuer_did TEXT NOT NULL,
  recipient_did TEXT,
  recipient_account_id TEXT,
  recipient_email TEXT,
  course_name TEXT NOT NULL,
  ipfs_cid TEXT NOT NULL,
  metadata JSONB,
  issued_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  hedera_tx_id TEXT,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Claim tokens for certificate claiming
CREATE TABLE IF NOT EXISTS public.claim_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id TEXT NOT NULL REFERENCES public.certificate_cache(certificate_id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  nonce UUID UNIQUE DEFAULT gen_random_uuid(),
  issued_by TEXT NOT NULL,
  claimed_by TEXT,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HCS message cache (for event streaming)
CREATE TABLE IF NOT EXISTS public.hcs_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT NOT NULL,
  sequence_number BIGINT NOT NULL,
  consensus_timestamp TEXT NOT NULL,
  message_type TEXT NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (topic_id, sequence_number)
);

-- Webhook configurations
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hcs_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for institutions
CREATE POLICY "Institutions are viewable by all authenticated users"
  ON public.institutions FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Institution admins can update their institution"
  ON public.institutions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.institution_id = institutions.id
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for certificate cache
CREATE POLICY "Certificates are viewable by all"
  ON public.certificate_cache FOR SELECT
  USING (TRUE);

CREATE POLICY "Issuers can insert certificates"
  ON public.certificate_cache FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('issuer', 'admin')
    )
  );

-- RLS Policies for claim tokens
CREATE POLICY "Users can view their own claim tokens"
  ON public.claim_tokens FOR SELECT
  USING (
    certificate_id IN (
      SELECT certificate_id FROM public.certificate_cache
      WHERE recipient_account_id = (SELECT hedera_account_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER institutions_updated_at
  BEFORE UPDATE ON public.institutions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Indexes for performance
CREATE INDEX idx_certificate_cache_issuer ON public.certificate_cache(issuer_did);
CREATE INDEX idx_certificate_cache_recipient ON public.certificate_cache(recipient_did);
CREATE INDEX idx_certificate_cache_token ON public.certificate_cache(token_id, serial_number);
CREATE INDEX idx_hcs_events_topic ON public.hcs_events(topic_id, sequence_number);
CREATE INDEX idx_hcs_events_unprocessed ON public.hcs_events(processed) WHERE NOT processed;