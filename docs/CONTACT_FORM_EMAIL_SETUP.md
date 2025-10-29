# Contact Form Setup Guide

## Overview
The contact form stores submissions in Supabase database AND optionally sends email notifications via Cloudflare Email Routing API.

## Current Implementation

### Frontend (Contact.tsx)
- ✅ Form calls `supabase.functions.invoke('send-contact-email')`
- ✅ Loading state while submitting ("Sending..." button text)
- ✅ Success toast on successful send
- ✅ Error toast with fallback to direct email if failed
- ✅ Form clears after successful submission

### Backend (Edge Function)
- ✅ Function: `supabase/functions/send-contact-email/index.ts`
- ✅ **Stores submissions in `contact_submissions` table** (always)
- ✅ **Sends email via Cloudflare Email Routing API** (if configured)
- ✅ Validates email format and required fields
- ✅ Returns success even if email fails (database storage is primary)

### Database Table
- ✅ Table: `contact_submissions`
- ✅ Columns: id, name, email, subject, message, submitted_at, created_at
- ✅ RLS enabled: Super admins can view, service role can insert
- ✅ Indexed on submitted_at and email for performance

---

## Deployment Steps

### 1. Apply Database Migration

```bash
# Navigate to project directory
cd c:/Users/josep/Code/repo/certchain

# Apply migration to create contact_submissions table
# Copy contents of: supabase/migrations/20251029000000_create_contact_submissions.sql
# Paste into Supabase Dashboard > SQL Editor > Run
```

### 2. Get Cloudflare API Credentials (Optional - for email notifications)

#### Get API Token:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use template "Edit Email Routing" or create custom with:
   - Permissions: **Account > Email Routing > Edit**
4. Copy the token (starts with something like `abc123...`)

#### Get Account ID:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select any domain
3. Account ID is shown in the right sidebar
4. Copy it (looks like `a1b2c3d4e5f6...`)

### 3. Set Supabase Secrets (Optional - skip if you don't want email notifications)

```bash
# Set Cloudflare API token
npx supabase secrets set CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here

# Set Cloudflare Account ID
npx supabase secrets set CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# Set notification email (where you want to receive notifications)
npx supabase secrets set NOTIFICATION_EMAIL=your-email@example.com
```

**OR** via Supabase Dashboard:
- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Select your CertChain project
- Navigate to **Settings** > **Edge Functions** > **Secrets**
- Add secrets:
  - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
  - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
  - `NOTIFICATION_EMAIL`: Your email address

### 4. Deploy the Edge Function

```bash
# Deploy the send-contact-email function
npx supabase functions deploy send-contact-email
```

**Expected output**:
```
Deploying Function (project: your-project-id)
        send-contact-email (index.ts)
✅ Function deployed successfully
```

### 5. Configure Cloudflare Email Routing (Optional)

#### Set up Email Routing (if not already done):
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select `certchain.app` domain
3. Navigate to **Email** > **Email Routing**
4. Enable Email Routing
5. Add destination address (your email)
6. Verify your email address

#### Add Routing Rule:
1. In Email Routing, go to **Routes**
2. Add route:
   - **Custom address**: `support@certchain.app`
   - **Action**: Send to → Your verified email address

### 6. Test the Contact Form

1. Go to your deployed site: `https://certchain.app/contact`
2. Fill out the form:
   - Name: Test User
   - Email: test@example.com
   - Subject: Test Contact Form
   - Message: Testing the contact form
3. Click "Send Message"
4. Verify:
   - ✅ Button shows "Sending..." during submission
   - ✅ Success toast appears
   - ✅ Form fields clear
   - ✅ Submission appears in Supabase dashboard (contact_submissions table)
   - ✅ **Email arrives at your notification email** (if Cloudflare configured)

---

## How It Works

### Submission Flow:

1. **User submits form** → Contact.tsx calls edge function
2. **Edge function validates** → Checks required fields and email format
3. **Stores in database** → Inserts into `contact_submissions` table ✅ (Always happens)
4. **Sends email** → Uses Cloudflare Email Routing API ✅ (If configured)
5. **Returns success** → Even if email fails, database storage succeeds

### Email Notification Format:

```
From: noreply@certchain.app
To: your-email@example.com
Reply-To: user's email address
Subject: Contact Form: [User's Subject]

New Contact Form Submission

From: John Doe
Email: john@example.com
Subject: Question about certificates

Message:
I'm interested in learning more about your certificate management system...

---
Submitted at: 2025-10-29T10:30:00.000Z
View in dashboard: https://your-project.supabase.co
```

---

## Viewing Contact Form Submissions

### In Supabase Dashboard
- Navigate to Table Editor > `contact_submissions`
- View all fields: name, email, subject, message, submitted_at
- Sort by submitted_at (newest first)
- Export to CSV if needed

### Optional: Build Admin Dashboard View
Create a page in your app for super admins:
```typescript
const { data: submissions } = await supabase
  .from('contact_submissions')
  .select('*')
  .order('submitted_at', { ascending: false });
```

---

## Configuration Options

### Option A: Database Only (No Email Notifications)
- ✅ Don't set Cloudflare secrets
- ✅ Forms still work, just stored in database
- ✅ Check dashboard periodically for submissions
- ✅ **Simplest setup - good for starting**

### Option B: Database + Email Notifications (Recommended)
- ✅ Set all 3 Cloudflare secrets
- ✅ Get instant email notifications
- ✅ **Plus** database backup of all submissions
- ✅ **Best of both worlds!**

---

## Troubleshooting

### Function not deployed
```bash
# Check deployed functions
npx supabase functions list

# If not listed, deploy again
npx supabase functions deploy send-contact-email
```

### Table doesn't exist
- Apply migration: `20251029000000_create_contact_submissions.sql` in Supabase Dashboard SQL Editor

### Emails not being sent (but database works)
1. Check edge function logs:
   ```bash
   npx supabase functions logs send-contact-email --follow
   ```
2. Verify all 3 secrets are set:
   ```bash
   npx supabase secrets list
   ```
3. Verify Cloudflare API token has Email Routing permissions
4. Check Cloudflare Email Routing is enabled for certchain.app

### CORS errors
- Edge function already has CORS headers configured
- If issues persist, check Supabase Edge Function logs

### Submissions not appearing in database
```bash
# View real-time logs
npx supabase functions logs send-contact-email --follow
```

---

## Production Checklist

### Minimum (Database Only):
- [ ] Apply contact_submissions table migration in Supabase
- [ ] Edge function deployed successfully
- [ ] Test form submission end-to-end
- [ ] Verify submission appears in database

### Full Setup (Database + Email):
- [ ] Apply contact_submissions table migration in Supabase
- [ ] Get Cloudflare API token with Email Routing permissions
- [ ] Set all 3 Supabase secrets (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, NOTIFICATION_EMAIL)
- [ ] Edge function deployed successfully
- [ ] Cloudflare Email Routing enabled and configured
- [ ] Test form submission end-to-end
- [ ] Verify submission appears in database
- [ ] Verify email notification received

---

## Benefits

✅ **Reliable**: Database is single source of truth  
✅ **Zero cost**: Cloudflare Email Routing is free  
✅ **No external dependencies**: Uses Cloudflare you already have  
✅ **Flexible**: Works with or without email notifications  
✅ **Searchable**: Easy to query and filter submissions in Supabase  
✅ **Privacy compliant**: Data stays in your infrastructure  
✅ **Instant notifications**: Get emails immediately (if configured)  

---

**Status**: ✅ Ready to deploy  
**Last Updated**: October 29, 2025
