-- Quick fix for existing users who signed up via invitation but got wrong role

-- Step 1: Find users who signed up via invitation but have wrong role
-- Run this to see affected users:
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'invitation_token' as invitation_token,
  i.role as should_be_role,
  ur.role::text as current_role
FROM auth.users u
LEFT JOIN public.invitations i ON (u.raw_user_meta_data->>'invitation_token')::UUID = i.token
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.raw_user_meta_data->>'invitation_token' IS NOT NULL
AND i.role IS NOT NULL
AND (ur.role IS NULL OR ur.role::text != i.role);

-- Step 2: Fix the roles (uncomment and run after reviewing above results)
/*
UPDATE public.user_roles ur
SET role = i.role::app_role
FROM auth.users u
JOIN public.invitations i ON (u.raw_user_meta_data->>'invitation_token')::UUID = i.token
WHERE ur.user_id = u.id
AND u.raw_user_meta_data->>'invitation_token' IS NOT NULL
AND i.role IS NOT NULL
AND ur.role::text != i.role;
*/

-- Step 3: Also fix institution_id in profiles if missing
/*
UPDATE public.profiles p
SET institution_id = i.institution_id
FROM auth.users u
JOIN public.invitations i ON (u.raw_user_meta_data->>'invitation_token')::UUID = i.token
WHERE p.id = u.id
AND u.raw_user_meta_data->>'invitation_token' IS NOT NULL
AND i.institution_id IS NOT NULL
AND (p.institution_id IS NULL OR p.institution_id != i.institution_id);
*/
