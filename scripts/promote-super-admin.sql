-- ====================================
-- Promote User to Super Admin Script
-- ====================================
-- 
-- Run this in your Supabase SQL Editor to make a user a super admin.
-- Replace 'your-email@example.com' with the actual user's email.
--
-- IMPORTANT: Super admins have platform-wide access. Only promote trusted users!
-- ====================================

-- Step 1: Find the user by email
-- Copy the user ID from the result
SELECT 
  id as user_id, 
  email, 
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Step 2: Check if user already has any roles
SELECT 
  ur.user_id,
  ur.role,
  ur.created_at,
  u.email
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'your-email@example.com';

-- Step 3: Promote to super_admin (replace USER_ID_HERE with the UUID from step 1)
-- This will either insert or update the role
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'super_admin')
ON CONFLICT (user_id, role) 
DO UPDATE SET updated_at = now();

-- Alternative: If you want to replace ALL roles for this user with super_admin
-- (use with caution - this removes other roles)
/*
DELETE FROM user_roles WHERE user_id = 'USER_ID_HERE';
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'super_admin');
*/

-- Step 4: Verify the promotion worked
SELECT 
  ur.user_id,
  ur.role,
  ur.created_at,
  u.email,
  is_super_admin(ur.user_id) as is_super_admin_check
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'your-email@example.com';

-- Expected result: role should be 'super_admin' and is_super_admin_check should be TRUE

-- ====================================
-- After running this script:
-- 1. The user should log out and log back in
-- 2. They will be redirected to /admin/dashboard
-- 3. They can access /admin/institutions to onboard institutions
-- ====================================
