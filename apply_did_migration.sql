-- Run this in Supabase Dashboard > SQL Editor
-- Navigate to: https://supabase.com/dashboard/project/asxskeceekllmzxatlvn/sql/new

-- First, make user_id nullable (for institutional DIDs without user accounts)
ALTER TABLE public.user_dids 
ALTER COLUMN user_id DROP NOT NULL;

-- Add DID document storage columns to user_dids table
ALTER TABLE public.user_dids 
ADD COLUMN IF NOT EXISTS did_document JSONB,
ADD COLUMN IF NOT EXISTS did_document_hash TEXT,
ADD COLUMN IF NOT EXISTS hcs_topic_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_dids_did_document_hash 
ON public.user_dids(did_document_hash);

CREATE INDEX IF NOT EXISTS idx_user_dids_hcs_topic_id 
ON public.user_dids(hcs_topic_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_dids_account_network 
ON public.user_dids(account_id, network);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_dids_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_dids_updated_at ON public.user_dids;

CREATE TRIGGER trigger_user_dids_updated_at
  BEFORE UPDATE ON public.user_dids
  FOR EACH ROW
  EXECUTE FUNCTION update_user_dids_updated_at();

-- Update RLS policies
DROP POLICY IF EXISTS "Public can read DID documents" ON public.user_dids;
CREATE POLICY "Public can read DID documents" 
ON public.user_dids
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users manage own DIDs" ON public.user_dids;
CREATE POLICY "Users manage own DIDs" 
ON public.user_dids
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all DIDs" ON public.user_dids;
CREATE POLICY "Service role can manage all DIDs" 
ON public.user_dids
FOR ALL
USING (auth.jwt()->>'role' = 'service_role')
WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Verify changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_dids'
ORDER BY ordinal_position;
