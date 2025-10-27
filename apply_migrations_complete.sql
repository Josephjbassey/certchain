-- Apply Critical Database Migrations
-- Run this in Supabase Dashboard > SQL Editor: https://supabase.com/dashboard/project/asxskeceekllmzxatlvn/sql/new

-- ============================================
-- STEP 1: Make user_id nullable (CRITICAL)
-- ============================================
ALTER TABLE public.user_dids 
ALTER COLUMN user_id DROP NOT NULL;

-- ============================================
-- STEP 2: Add DID Document Storage Columns
-- ============================================
-- Add columns if they don't exist
DO $$ 
BEGIN
    -- did_document column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_dids' 
        AND column_name = 'did_document'
    ) THEN
        ALTER TABLE public.user_dids 
        ADD COLUMN did_document JSONB;
    END IF;

    -- did_document_hash column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_dids' 
        AND column_name = 'did_document_hash'
    ) THEN
        ALTER TABLE public.user_dids 
        ADD COLUMN did_document_hash TEXT;
    END IF;

    -- hcs_topic_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_dids' 
        AND column_name = 'hcs_topic_id'
    ) THEN
        ALTER TABLE public.user_dids 
        ADD COLUMN hcs_topic_id TEXT;
    END IF;

    -- updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_dids' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.user_dids 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- ============================================
-- STEP 3: Create Indexes for Performance
-- ============================================
-- Index on did_document_hash for verification
CREATE INDEX IF NOT EXISTS idx_user_dids_hash 
ON public.user_dids(did_document_hash);

-- Index on hcs_topic_id for HCS queries
CREATE INDEX IF NOT EXISTS idx_user_dids_hcs_topic 
ON public.user_dids(hcs_topic_id);

-- Unique index on account_id + network combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_dids_account_network 
ON public.user_dids(account_id, network);

-- ============================================
-- STEP 4: Add Comments for Documentation
-- ============================================
COMMENT ON COLUMN public.user_dids.did_document IS 'W3C-compliant DID document in JSON format';
COMMENT ON COLUMN public.user_dids.did_document_hash IS 'SHA-256 hash of the DID document for integrity verification';
COMMENT ON COLUMN public.user_dids.hcs_topic_id IS 'Hedera Consensus Service topic ID where DID document is published';
COMMENT ON COLUMN public.user_dids.user_id IS 'User profile ID (nullable for institutional DIDs)';

-- ============================================
-- STEP 5: Verify Changes
-- ============================================
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_dids'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database migrations applied successfully!';
    RAISE NOTICE '✅ user_id is now nullable';
    RAISE NOTICE '✅ DID document storage columns added';
    RAISE NOTICE '✅ Performance indexes created';
    RAISE NOTICE '🚀 Ready for production DID creation!';
END $$;
