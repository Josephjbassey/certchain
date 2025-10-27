-- QUICK FIX: Make user_id nullable in user_dids table
-- Run this immediately in Supabase Dashboard > SQL Editor

ALTER TABLE public.user_dids 
ALTER COLUMN user_id DROP NOT NULL;

-- Verify the change
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_dids'
  AND column_name = 'user_id';
