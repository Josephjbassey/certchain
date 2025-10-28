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

COMMIT;
