-- Step 1: Add new role enum values
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'institution_admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'instructor';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'candidate';