# Deployment Steps for Invitation System

This document outlines the steps needed to complete the invitation system deployment.

## ✅ Completed
- Created invitations table migration (`supabase/migrations/20251025025908_create_invitations_table.sql`)
- Created send-invitation-email Edge Function (`supabase/functions/send-invitation-email/index.ts`)
- Updated Signup.tsx with invitation validation and consumption logic
- Fixed InstitutionManagement.tsx TypeScript errors
- Fixed import issues (AlertDialog from correct module)

## 🚀 Manual Deployment Steps

### Step 1: Apply Database Migration

You need to apply the invitations table migration to your database. You have two options:

#### Option A: Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/asxskeceekllmzxatlvn/editor
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy the contents of `supabase/migrations/20251025025908_create_invitations_table.sql`
5. Paste into the SQL editor
6. Click "Run" to execute the migration

#### Option B: Via Supabase CLI
```bash
# Login to Supabase CLI
npx supabase login

# Push the migration
npx supabase db push

# When prompted, enter "Y" to confirm
```

### Step 2: Deploy Edge Function

Deploy the send-invitation-email Edge Function:

```bash
# Deploy the function
npx supabase functions deploy send-invitation-email --no-verify-jwt

# Set the RESEND_API_KEY secret (get your API key from https://resend.com/api-keys)
npx supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### Step 3: Regenerate TypeScript Types

After the migration is applied, regenerate TypeScript types to remove type assertions:

```bash
# Generate types from your remote database
npx supabase gen types typescript --project-id asxskeceekllmzxatlvn > src/integrations/supabase/types.ts
```

### Step 4: Remove Type Assertions (Optional)

Once types are regenerated, you can remove the `(supabase as any)` type assertions from:
- `src/pages/auth/Signup.tsx` (lines with invitations table queries)
- `src/pages/admin/InstitutionManagement.tsx` (invitations and institutions table queries)

## 📋 What Changed

### Database Schema
- **New Table**: `invitations`
  - `id` (uuid, primary key)
  - `institution_id` (uuid, foreign key to institutions)
  - `email` (text)
  - `role` (text, CHECK constraint: 'institution_admin' or 'instructor')
  - `token` (uuid, unique)
  - `expires_at` (timestamptz)
  - `invited_by` (uuid, foreign key to auth.users)
  - `used_at` (timestamptz, nullable)
  - `created_at` (timestamptz)

- **Modified Table**: `institutions`
  - `did` and `hedera_account_id` now accept temporary placeholder values ('pending')
  - These must be updated after admin completes wallet connection and DID setup

### Edge Function
- **New Function**: `send-invitation-email`
  - Sends invitation emails via Resend API
  - Requires RESEND_API_KEY environment variable
  - Includes branded HTML template
  - Has graceful fallback (shows link in dialog if email fails)

### Frontend Changes
- **Signup.tsx**: 
  - Validates invitation tokens (expiration, single-use, existence)
  - Marks tokens as used after successful signup
  - Pre-fills email from invitation

- **InstitutionManagement.tsx**:
  - Creates institution with placeholder did/hedera_account_id
  - Generates invitation token (7-day expiration)
  - Sends invitation email via Edge Function
  - Shows fallback dialog with manual link if email fails

## ⚠️ Important Notes

### Placeholder Values
Institutions are now created with placeholder values for:
- `did`: 'pending'
- `hedera_account_id`: 'pending'

These must be updated through one of these methods:

1. **Admin completes wallet setup** (Preferred):
   - Admin signs up via invitation
   - Goes to Settings → Wallets
   - Connects HashPack or Blade wallet
   - Goes to /identity/did-setup
   - Creates DID
   - Super admin can then update the institution record

2. **Manual super admin update**:
   - Super admin manually updates institution with admin's wallet/DID

### Certificate Issuance
⚠️ **Institutions cannot issue certificates until did and hedera_account_id are set to real values** (not 'pending').

The certificate issuance code should validate this:
```typescript
if (institution.did === 'pending' || institution.hedera_account_id === 'pending') {
  throw new Error('Institution must complete wallet connection and DID setup before issuing certificates');
}
```

### Email Service
The invitation system requires:
- Resend API account (https://resend.com)
- RESEND_API_KEY secret configured in Supabase
- If email fails, users can still copy the invitation link manually from the dialog

## 🧪 Testing Checklist

After deployment, test the complete flow:

1. [ ] Super admin can create institution (InstitutionManagement page)
2. [ ] Invitation token is generated and stored in database
3. [ ] Invitation email is sent (check inbox)
4. [ ] Email contains correct invitation link
5. [ ] Clicking link pre-fills email in signup form
6. [ ] Expired tokens are rejected (wait 7 days or manually set expires_at to past)
7. [ ] Used tokens are rejected (sign up once, try link again)
8. [ ] After signup, invitation is marked as used (check invitations.used_at)
9. [ ] Admin is assigned correct role (institution_admin)
10. [ ] Admin can log in and access institution dashboard
11. [ ] Admin can connect wallet (Settings → Wallets)
12. [ ] Admin can create DID (/identity/did-setup)
13. [ ] Certificate issuance validates institution setup

## 🔧 Troubleshooting

### Migration Fails with "already exists" Errors
- This is expected if some tables/policies already exist
- The migration uses `IF NOT EXISTS` so it's safe to rerun
- You can also apply just the new parts via SQL Editor

### Type Errors After Deployment
- Run the TypeScript regeneration command (Step 3)
- Restart your development server
- Check that `src/integrations/supabase/types.ts` includes the `invitations` table

### Emails Not Sending
- Check RESEND_API_KEY is set correctly
- Verify Resend account is active and verified
- Check Edge Function logs in Supabase dashboard
- Use the fallback dialog link if email fails

### Invitation Link Not Working
- Check token format in URL (should be UUID)
- Verify token exists in database
- Check expires_at timestamp
- Check used_at is null
- Look at browser console for error messages
