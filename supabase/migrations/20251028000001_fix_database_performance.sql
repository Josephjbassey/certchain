-- ============================================
-- CertChain Database - Index Optimization
-- ============================================

BEGIN;

-- STEP 1: Add missing foreign key index (HIGH PRIORITY)
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by
  ON public.invitations(invited_by);

-- STEP 2: Drop confirmed duplicate indexes (MEDIUM PRIORITY)
DROP INDEX IF EXISTS idx_user_dids_hash;
DROP INDEX IF EXISTS idx_user_dids_hcs_topic;

-- STEP 3: Drop duplicate indexes identified by linter
DROP INDEX IF EXISTS idx_certificate_cache_issuer_did;  -- Keep idx_certificate_cache_issuer

-- STEP 4: Handle duplicate unique constraint on user_dids
-- Both user_dids_account_id_network_key (auto-generated constraint) and 
-- idx_user_dids_account_network (manually created index) enforce uniqueness on (account_id, network)
-- Drop the auto-generated constraint and keep the manually named one
ALTER TABLE public.user_dids DROP CONSTRAINT IF EXISTS user_dids_account_id_network_key;

COMMIT;
