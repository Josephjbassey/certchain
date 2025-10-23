# Quick Start: Super Admin Setup & Institution Onboarding

## 🚀 Step-by-Step Setup

### 1. Create Your Super Admin Account

1. **Sign up** at your app's `/auth/signup` page
2. **Note your email** - you'll need it for the next step

### 2. Promote Your Account to Super Admin

Open your **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Step 1: Find your user ID (copy the 'user_id' from results)
SELECT id as user_id, email FROM auth.users
WHERE email = 'your-email@example.com';

-- Step 2: Promote to super_admin (paste your UUID from step 1)
INSERT INTO user_roles (user_id, role)
VALUES ('PASTE-YOUR-USER-ID-HERE', 'super_admin')
ON CONFLICT (user_id, role) DO UPDATE SET updated_at = now();

-- Step 3: Verify it worked (should show role = 'super_admin')
SELECT ur.role, u.email, is_super_admin(ur.user_id) as is_super_admin
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'your-email@example.com';
```

### 3. Log In as Super Admin

1. **Log out** from your app
2. **Log back in** with your account
3. You'll be redirected to `/admin/dashboard`

### 4. Onboard Your First Institution

1. Navigate to **Admin → Institutions** (`/admin/institutions`)
2. Click **"Add Institution"** button
3. Fill in the form:
   - **Name**: Institution's full name (required)
   - **Domain**: Email domain for validation (e.g., `harvard.edu`)
   - **Description**: Brief description
   - **Hedera Account ID**: Institution's Hedera account (e.g., `0.0.123456`)
   - **Admin Email**: (Optional) Email of the person who will manage this institution
4. Click **"Create Institution"**

### 5. Verify the Institution

After creation:

1. Click **"View"** on the institution row
2. Review the details
3. Click **"Verify Institution"** to enable it

### 6. What Happens Next?

- ✅ Institution is now active on the platform
- ✅ If you provided an admin email and that user exists, they're assigned as `institution_admin`
- ✅ Institution admin can now:
  - Log in and access `/dashboard/institution`
  - Create Hedera DID for the institution
  - Mint NFT collection tokens
  - Onboard instructors
  - Issue certificates

---

## 📋 Role Hierarchy

```
Super Admin (you)
    ↓ manages institutions
Institution Admin
    ↓ onboards instructors
Instructor
    ↓ issues certificates to
Candidate/Student
```

## 🔒 Permissions

| Action                | Super Admin | Institution Admin | Instructor | Candidate |
| --------------------- | ----------- | ----------------- | ---------- | --------- |
| Onboard institutions  | ✅          | ❌                | ❌         | ❌        |
| Verify institutions   | ✅          | ❌                | ❌         | ❌        |
| Manage institution    | ❌          | ✅ (own only)     | ❌         | ❌        |
| Issue certificates    | ❌          | ✅                | ✅         | ❌        |
| View own certificates | ❌          | ❌                | ❌         | ✅        |

## 🛠️ Troubleshooting

**Q: I promoted myself but still see the candidate dashboard**

- A: Log out completely and log back in. Clear browser cache if needed.

**Q: Can't see the "Add Institution" button**

- A: Verify your role with the SQL query in step 2.3 above

**Q: Institution admin email says "user not found"**

- A: The user must sign up first at `/auth/signup` before you can assign them as admin

**Q: How do I remove super admin access?**

```sql
DELETE FROM user_roles
WHERE user_id = 'USER-ID-HERE' AND role = 'super_admin';
```

---

## 📚 Related Docs

- Full setup guide: `docs/SUPER_ADMIN_SETUP.md`
- Database schema: `COMPLETE_DATABASE_SCHEMA.sql`
- Promotion script: `scripts/promote-super-admin.sql`
