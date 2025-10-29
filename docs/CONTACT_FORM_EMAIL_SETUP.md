# Contact Form Email Setup Guide

## Overview

The contact form now sends real emails using Supabase Edge Functions + Resend API.

## Current Implementation

### Frontend (Contact.tsx)

- ✅ Form calls `supabase.functions.invoke('send-contact-email')`
- ✅ Loading state while submitting ("Sending..." button text)
- ✅ Success toast on successful send
- ✅ Error toast with fallback to direct email if failed
- ✅ Form clears after successful submission

### Backend (Edge Function)

- ✅ Function: `supabase/functions/send-contact-email/index.ts`
- ✅ Uses Resend API to send emails
- ✅ Sends to: `support@certchain.app`
- ✅ Reply-to: User's email address
- ✅ Beautiful HTML email template with CertChain branding
- ✅ Includes all form fields: name, email, subject, message

## Deployment Steps

### 1. Set up Resend API Key in Supabase

1. **Get Resend API Key**:

   - Go to [Resend Dashboard](https://resend.com/api-keys)
   - Create new API key (if not already created)
   - Copy the API key (starts with `re_`)

2. **Add to Supabase Secrets**:

   ```bash
   # Navigate to project directory
   cd c:/Users/josep/Code/repo/certchain

   # Set the secret (replace YOUR_RESEND_API_KEY)
   npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
   ```

   **OR** via Supabase Dashboard:

   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your CertChain project
   - Navigate to **Settings** > **Edge Functions** > **Secrets**
   - Add secret:
     - Key: `RESEND_API_KEY`
     - Value: `re_xxxxxxxxxxxxxxxxxxxxx`

### 2. Deploy the Edge Function

```bash
# Navigate to project directory
cd c:/Users/josep/Code/repo/certchain

# Deploy the send-contact-email function
npx supabase functions deploy send-contact-email
```

**Expected output**:

```
Deploying Function (project: your-project-id)
        send-contact-email (index.ts)
✅ Function deployed successfully
```

### 3. Configure Resend Domain (Important!)

For production emails to work reliably:

1. **Add your domain to Resend**:

   - Go to [Resend Dashboard](https://resend.com/domains)
   - Click "Add Domain"
   - Enter: `certchain.app`
   - Add the DNS records to your Cloudflare DNS:
     - SPF record (TXT)
     - DKIM record (TXT)
     - DMARC record (TXT)

2. **Update the edge function sender** (optional - after domain verified):
   ```typescript
   // In supabase/functions/send-contact-email/index.ts
   // Change from:
   from: "CertChain Contact Form <noreply@certchain.app>";
   // To verified domain:
   from: "CertChain Contact Form <noreply@certchain.app>";
   ```

### 4. Test the Contact Form

1. Go to your deployed site: `https://certchain.app/contact`
2. Fill out the form:
   - Name: Test User
   - Email: your-test-email@example.com
   - Subject: Test Contact Form
   - Message: Testing the new contact form functionality
3. Click "Send Message"
4. Verify:
   - ✅ Button shows "Sending..." during submission
   - ✅ Success toast appears after ~2-3 seconds
   - ✅ Form fields clear after success
   - ✅ Email arrives at `support@certchain.app`

## Email Template Preview

The sent email includes:

- **Header**: CertChain branding with gradient background
- **From**: Contact name and email
- **Email Address**: User's email (clickable)
- **Subject**: Form subject
- **Message**: Full message with formatting preserved
- **Reply Button**: Quick reply to sender
- **Footer**: Timestamp and CertChain branding

## Cloudflare Email Routing (Your Setup)

You mentioned setting up Cloudflare Email Routing. Here's how it integrates:

### Receiving Emails at support@certchain.app

1. **Cloudflare Email Routing** forwards emails TO your personal email
2. **Resend API** sends emails FROM your application
3. Together they create a complete email system:
   - Contact form → Resend → `support@certchain.app` → Cloudflare → Your inbox

### Configure Email Routing (if not done):

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select `certchain.app` domain
3. Navigate to **Email** > **Email Routing**
4. Add routing rule:
   - **From**: `support@certchain.app`
   - **To**: Your personal email (e.g., `joseph@example.com`)
5. Verify email routing by clicking confirmation link

## Troubleshooting

### Function not deployed

```bash
# Check deployed functions
npx supabase functions list

# If not listed, deploy again
npx supabase functions deploy send-contact-email
```

### RESEND_API_KEY not set

```bash
# Check secrets
npx supabase secrets list

# If not listed, set it
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

### Emails not arriving

1. Check Resend Dashboard > Logs for delivery status
2. Verify Cloudflare Email Routing is active
3. Check spam folder
4. Verify DNS records for Resend domain

### CORS errors

- Edge function already has CORS headers configured
- If issues persist, check Supabase Edge Function logs

## Monitoring

### Check Edge Function Logs

```bash
# View real-time logs
npx supabase functions logs send-contact-email --follow
```

### Check Resend Delivery

- Go to [Resend Dashboard](https://resend.com/emails)
- View all sent emails
- Check delivery status, opens, clicks

## Production Checklist

Before going live:

- [ ] RESEND_API_KEY secret set in Supabase
- [ ] Edge function deployed successfully
- [ ] Resend domain verified (optional but recommended)
- [ ] Cloudflare Email Routing configured for support@certchain.app
- [ ] Test form submission end-to-end
- [ ] Verify email arrives at destination
- [ ] Check email formatting and branding
- [ ] Test reply-to functionality

## Cost Considerations

**Resend Free Tier**:

- 100 emails/day
- 3,000 emails/month
- Perfect for contact forms

**Paid Plans** (if needed later):

- $20/month: 50,000 emails
- Scales as needed

## Next Steps

1. Deploy the edge function: `npx supabase functions deploy send-contact-email`
2. Set RESEND_API_KEY secret
3. Test the contact form
4. Monitor first few submissions
5. Consider adding Resend domain verification for production

---

**Status**: ✅ Code complete, ready to deploy  
**Last Updated**: October 29, 2025
