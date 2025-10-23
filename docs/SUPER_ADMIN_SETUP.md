# Super Admin Setup Guide

## How to Create a Super Admin

Since super admins are the top-level platform administrators who enroll institutions, you need to manually promote a user to super_admin role using the database.

### Option 1: Promote an Existing User (Recommended)

1. **First, sign up a regular user account** at `/auth/signup`
2. **Open your Lovable Cloud backend**
3. **Go to the SQL Editor**
4. **Run this SQL command** (replace the email with your actual email):

```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Update the user's role to super_admin (replace the UUID with your user ID)
UPDATE user_roles 
SET role = 'super_admin' 
WHERE user_id = 'YOUR-USER-ID-HERE';

-- If no role exists, insert one
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR-USER-ID-HERE', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

5. **Log out and log back in** - The system will detect your new role

### Option 2: Create Super Admin During Signup

If you want the first user to automatically become a super admin, modify the signup trigger:

```sql
-- Update the handle_new_user_role function to make first user super admin
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Check if this is the first user
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- If first user, make them super_admin, otherwise candidate
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'candidate');
  END IF;
  
  RETURN NEW;
END;
$$;
```

## What Super Admins Can Do

Super admins have access to:

- **Platform Dashboard** (`/admin`) - Overview of all institutions
- **Institution Management** - Enroll new institutions and assign institution admins
- **Platform-wide Analytics** - View aggregated statistics (without PII)
- **System Settings** - Configure platform-wide settings
- **Audit Logs** - View all platform activity

## Hierarchy Overview

```
Super Admin (Your Team)
    ↓
Institution Admin (per institution)
    ↓
Instructor/Issuer (per institution)
    ↓
Candidate/Student (per institution)
```

## Data Isolation

- **Super Admins**: Can see institutions and aggregated data, but NOT candidate personal information
- **Institution Admins**: Can see all data within their institution only
- **Instructors**: Can see only candidates they enrolled
- **Candidates**: Can see only their own certificates

## Next Steps

After creating your super admin account:

1. Create institution management pages at `/admin/institutions`
2. Build institution enrollment workflow
3. Set up institution admin assignment
4. Create analytics dashboards with PII masking for super admins
