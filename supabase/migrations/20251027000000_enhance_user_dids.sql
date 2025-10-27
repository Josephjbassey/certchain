-- Add DID document storage and verification columns to user_dids table
-- This migration enhances the user_dids table to store complete DID documents
-- and support verification of DID integrity

-- Add new columns to user_dids
ALTER TABLE public.user_dids 
ADD COLUMN IF NOT EXISTS did_document JSONB,
ADD COLUMN IF NOT EXISTS did_document_hash TEXT,
ADD COLUMN IF NOT EXISTS hcs_topic_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add index for faster DID document hash lookups
CREATE INDEX IF NOT EXISTS idx_user_dids_did_document_hash 
ON public.user_dids(did_document_hash);

-- Add index for HCS topic lookups
CREATE INDEX IF NOT EXISTS idx_user_dids_hcs_topic_id 
ON public.user_dids(hcs_topic_id);

-- Add unique constraint on account_id and network combination
-- This ensures one DID per account per network
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_dids_account_network 
ON public.user_dids(account_id, network);

-- Add comment to table
COMMENT ON TABLE public.user_dids IS 
'Stores Decentralized Identifiers (DIDs) for Hedera accounts with full W3C-compliant DID documents';

-- Add comments to columns
COMMENT ON COLUMN public.user_dids.did IS 
'The DID identifier in format: did:hedera:<network>:<accountId>';

COMMENT ON COLUMN public.user_dids.did_document IS 
'Full W3C-compliant DID document in JSON format';

COMMENT ON COLUMN public.user_dids.did_document_hash IS 
'SHA-256 hash of the DID document for verification';

COMMENT ON COLUMN public.user_dids.hcs_topic_id IS 
'HCS topic ID where the DID document is published for immutable storage';

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

-- Add RLS policy for reading DID documents (public read)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
    AND tablename='user_dids' 
    AND policyname='Public can read DID documents'
  ) THEN
    CREATE POLICY "Public can read DID documents" 
    ON public.user_dids
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Update existing policy to allow users to update their own DIDs
DROP POLICY IF EXISTS "Users manage own DIDs" ON public.user_dids;

CREATE POLICY "Users manage own DIDs" 
ON public.user_dids
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow service role to manage all DIDs (for edge functions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' 
    AND tablename='user_dids' 
    AND policyname='Service role can manage all DIDs'
  ) THEN
    CREATE POLICY "Service role can manage all DIDs" 
    ON public.user_dids
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');
  END IF;
END $$;
