-- Create api_keys table for programmatic access
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL, -- First 8 chars for display: "ck_live_1234..."
  scopes TEXT[] NOT NULL DEFAULT '{}', -- Array of permission scopes
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_institution_id ON public.api_keys(institution_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys(is_active);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own API keys
CREATE POLICY "Users can view own api keys"
  ON public.api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own API keys
CREATE POLICY "Users can create own api keys"
  ON public.api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own API keys
CREATE POLICY "Users can update own api keys"
  ON public.api_keys
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own API keys
CREATE POLICY "Users can delete own api keys"
  ON public.api_keys
  FOR DELETE
  USING (auth.uid() = user_id);

-- Institution admins can view all keys for their institution
CREATE POLICY "Institution admins can view institution api keys"
  ON public.api_keys
  FOR SELECT
  USING (
    institution_id IN (
      SELECT id FROM public.institutions
      WHERE id IN (
        SELECT institution_id FROM public.profiles
        WHERE id = auth.uid() AND role IN ('institution_admin', 'super_admin')
      )
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_api_keys_updated_at ON public.api_keys;
CREATE TRIGGER set_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_api_keys_updated_at();

-- Add comment
COMMENT ON TABLE public.api_keys IS 'API keys for programmatic access to CertChain services';
