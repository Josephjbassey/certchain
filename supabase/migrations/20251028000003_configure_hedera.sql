-- ================================================
-- HEDERA CONFIGURATION
-- ================================================

BEGIN;

-- Update all existing institutions with the correct Hedera resource IDs
UPDATE public.institutions
SET
  collection_token_id = '0.0.7115182',
  hcs_topic_id = '0.0.7115183';

COMMIT;
