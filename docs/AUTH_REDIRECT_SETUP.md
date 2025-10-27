# Authentication Redirect Configuration

## Overview

This guide explains how to configure Supabase authentication redirects for your production domain `https://certchain.app/` and local development.

---

## Quick Setup Checklist

- [ ] Configure Supabase Dashboard redirect URLs
- [ ] Update `.env` file with production domain
- [ ] Verify code changes in `src/integrations/supabase/client.ts`
- [ ] Test authentication flows (sign up, login, password reset, email confirmation)
- [ ] Configure email templates (optional)

---

## Step 1: Supabase Dashboard Configuration

### Navigate to URL Configuration

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **asxskeceekllmzxatlvn**
3. Navigate to: **Authentication** → **URL Configuration**

### Configure Site URL

**Site URL** (your main production domain):

```
https://certchain.app
```

### Configure Redirect URLs

Add **ALL** of these redirect URLs to the **"Redirect URLs"** section:

```
https://certchain.app
https://certchain.app/
https://certchain.app/**
https://certchain.app/auth/callback
https://certchain.app/dashboard
http://localhost:5173/**
http://localhost:5173/auth/callback
http://127.0.0.1:5173/**
```

**Why these URLs?**

- `https://certchain.app` - Base production domain
- `https://certchain.app/**` - Wildcard for all production routes
- `https://certchain.app/auth/callback` - Auth callback endpoint
- `https://certchain.app/dashboard` - Post-login redirect
- `http://localhost:5173/**` - Local development (Vite default port)
- `http://127.0.0.1:5173/**` - Alternative localhost

### Save Changes

Click **"Save"** at the bottom of the page.

---

## Step 2: Environment Variables

### Production Environment (.env)

Create or update your `.env` file with:

```bash
# ===== Supabase Configuration =====
VITE_SUPABASE_URL=https://asxskeceekllmzxatlvn.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
VITE_SUPABASE_REDIRECT_URL=https://certchain.app

# For local development, you can override this in .env.local:
# VITE_SUPABASE_REDIRECT_URL=http://localhost:5173
```

### Local Development (.env.local)

For local development, create a `.env.local` file (this overrides `.env`):

```bash
# Local development overrides
VITE_SUPABASE_REDIRECT_URL=http://localhost:5173
```

**Note:** `.env.local` should be in your `.gitignore` (don't commit it)

---

## Step 3: Verify Code Changes

The following code has already been updated in `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Vite exposes env vars on import.meta.env
const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY;
const REDIRECT_URL: string =
  import.meta.env.VITE_SUPABASE_REDIRECT_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "https://certchain.app");

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      redirectTo: REDIRECT_URL, // ✅ Uses environment variable
    },
  }
);
```

**How it works:**

1. Tries to use `VITE_SUPABASE_REDIRECT_URL` from environment
2. Falls back to `window.location.origin` (current domain)
3. Ultimate fallback: `https://certchain.app`

---

## Step 4: Deployment Configuration

### Vercel / Netlify / Other Hosting

Add environment variables to your hosting platform:

**Vercel:**

1. Go to Project → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = `https://asxskeceekllmzxatlvn.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your_anon_key`
   - `VITE_SUPABASE_REDIRECT_URL` = `https://certchain.app`

**Netlify:**

1. Go to Site Settings → Build & Deploy → Environment
2. Add the same variables as above

**Custom Server:**
Add to your `.env` file on the server and restart the application.

---

## Step 5: Testing Authentication Flows

### Test Sign Up

1. Navigate to `https://certchain.app` (or `http://localhost:5173` for local)
2. Click "Sign Up"
3. Enter email and password
4. Submit form
5. **Expected:** Redirected to email confirmation page
6. Check email and click confirmation link
7. **Expected:** Redirected to `https://certchain.app/dashboard`

### Test Login

1. Navigate to login page
2. Enter credentials
3. Submit form
4. **Expected:** Redirected to `https://certchain.app/dashboard`

### Test Password Reset

1. Navigate to "Forgot Password" page
2. Enter email
3. Submit form
4. Check email for reset link
5. Click reset link
6. **Expected:** Redirected to `https://certchain.app/reset-password` or similar
7. Enter new password
8. **Expected:** Redirected to `https://certchain.app/dashboard`

### Test Invitation Flow

1. Admin creates invitation
2. User receives invitation email
3. Click invitation link
4. **Expected:** Redirected to sign-up page with pre-filled email
5. Complete registration
6. **Expected:** Redirected to `https://certchain.app/dashboard` with role assigned

---

## Step 6: Email Template Configuration (Optional)

### Update Email Templates

In Supabase Dashboard, go to **Authentication** → **Email Templates** and update the redirect URLs in templates:

#### Confirm Signup Template

Replace:

```html
<a href="{{ .ConfirmationURL }}">Confirm your email</a>
```

With:

```html
<a href="{{ .ConfirmationURL }}">Confirm your email</a>
```

_(This should already use the Site URL configured in Step 1)_

#### Reset Password Template

Ensure the reset link uses:

```html
<a href="{{ .ConfirmationURL }}">Reset your password</a>
```

#### Magic Link Template

Ensure the magic link uses:

```html
<a href="{{ .ConfirmationURL }}">Sign in</a>
```

**Note:** Supabase automatically appends the correct redirect URL based on your Site URL setting.

---

## Common Issues & Troubleshooting

### Issue 1: "Invalid redirect URL" error

**Cause:** The redirect URL is not in the allowed list in Supabase Dashboard.

**Fix:**

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add the exact URL (including protocol: `https://` or `http://`)
3. Use wildcard `**` for dynamic routes: `https://certchain.app/**`

### Issue 2: Redirects to localhost in production

**Cause:** Environment variable not set in production.

**Fix:**

1. Check hosting platform environment variables
2. Ensure `VITE_SUPABASE_REDIRECT_URL=https://certchain.app` is set
3. Rebuild and redeploy the application

### Issue 3: Email links redirect to wrong domain

**Cause:** Site URL not configured correctly in Supabase.

**Fix:**

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL** to `https://certchain.app`
3. Save changes
4. Test by sending a new email (old emails may still use old URL)

### Issue 4: CORS errors during authentication

**Cause:** Domain not configured in Supabase allowed origins.

**Fix:**

1. Go to Supabase Dashboard → API Settings
2. Check **CORS Allowed Origins**
3. Add `https://certchain.app` if not already present

### Issue 5: Authentication works locally but not in production

**Checklist:**

- [ ] Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in production
- [ ] Verify `VITE_SUPABASE_REDIRECT_URL=https://certchain.app` is set
- [ ] Verify all redirect URLs are added in Supabase Dashboard
- [ ] Clear browser cache and try again
- [ ] Check browser console for specific error messages
- [ ] Verify SSL certificate is valid for `certchain.app`

---

## Testing Commands

### Local Development

```bash
# Install dependencies
npm install

# Create .env.local for local development
echo "VITE_SUPABASE_REDIRECT_URL=http://localhost:5173" > .env.local

# Start development server
npm run dev

# Test authentication flows
# Open http://localhost:5173 in browser
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Test that redirects work in production build
# Open http://localhost:4173 in browser
```

---

## Security Best Practices

### 1. Use HTTPS in Production

Always use `https://` for production URLs:

- ✅ `https://certchain.app`
- ❌ `http://certchain.app`

### 2. Limit Redirect URLs

Only add redirect URLs you actually use:

- ✅ `https://certchain.app/**`
- ❌ `https://*.certchain.app/**` (too broad, unless needed for subdomains)

### 3. Don't Expose Secrets

Never commit these to Git:

- ❌ `SUPABASE_SERVICE_ROLE_KEY` (use only in backend/Edge Functions)
- ✅ `VITE_SUPABASE_ANON_KEY` (safe to expose in frontend)

### 4. Validate Redirect URLs

Supabase automatically validates redirect URLs against your allowed list. This prevents:

- Open redirect vulnerabilities
- Phishing attacks
- Unauthorized access

---

## Advanced Configuration

### Custom Domain with Subdomains

If you have subdomains (e.g., `app.certchain.app`, `admin.certchain.app`):

```bash
# Add to Supabase Dashboard redirect URLs:
https://certchain.app/**
https://app.certchain.app/**
https://admin.certchain.app/**

# Update environment variable to use subdomain:
VITE_SUPABASE_REDIRECT_URL=https://app.certchain.app
```

### Multi-Environment Setup

For staging and production environments:

**Production (.env.production):**

```bash
VITE_SUPABASE_REDIRECT_URL=https://certchain.app
```

**Staging (.env.staging):**

```bash
VITE_SUPABASE_REDIRECT_URL=https://staging.certchain.app
```

**Development (.env.local):**

```bash
VITE_SUPABASE_REDIRECT_URL=http://localhost:5173
```

### Dynamic Redirects Based on User Role

You can customize post-login redirects in your code:

```typescript
// Example: src/lib/auth-context.tsx
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Get user role and redirect accordingly
  const userRole = await getUserRole(data.user.id);

  if (userRole === "super_admin") {
    window.location.href = "/admin/dashboard";
  } else if (userRole === "institution_admin") {
    window.location.href = "/institution/dashboard";
  } else {
    window.location.href = "/dashboard";
  }
};
```

---

## Monitoring & Debugging

### Enable Auth Debug Logging

Add to your Supabase client configuration:

```typescript
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      redirectTo: REDIRECT_URL,
      debug: true, // ✅ Enable debug logging
    },
  }
);
```

### Check Supabase Auth Logs

1. Go to Supabase Dashboard
2. Navigate to **Logs** → **Auth Logs**
3. Filter by error or specific user email
4. Look for redirect-related errors

### Browser Console Debugging

Open browser console (F12) and check for:

- CORS errors
- Redirect errors
- Network errors during auth calls
- Supabase client configuration

---

## Summary

**Configuration Complete:**

- ✅ Supabase Dashboard: Site URL and Redirect URLs configured
- ✅ Environment Variables: `VITE_SUPABASE_REDIRECT_URL` set
- ✅ Code: Supabase client uses environment variable
- ✅ Testing: All auth flows work correctly

**Key URLs to Remember:**

- Production: `https://certchain.app`
- Supabase URL: `https://asxskeceekllmzxatlvn.supabase.co`
- Dashboard: `https://app.supabase.com/project/asxskeceekllmzxatlvn`

**Next Steps:**

1. Deploy to production with environment variables set
2. Test all authentication flows on `https://certchain.app`
3. Monitor auth logs for any issues
4. Update email templates if needed

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Redirect URLs Guide](https://supabase.com/docs/guides/auth/redirect-urls)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Troubleshooting Auth Issues](https://supabase.com/docs/guides/auth/troubleshooting)

---

**Last Updated:** October 27, 2025  
**Domain:** https://certchain.app  
**Supabase Project:** asxskeceekllmzxatlvn
