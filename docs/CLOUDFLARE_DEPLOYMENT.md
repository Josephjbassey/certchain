# Cloudflare Pages Deployment Guide

This guide will help you deploy the CertChain frontend to Cloudflare Pages while keeping Supabase for backend services.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Pages                          │
│  ┌─────────────────────────────────────────────────┐        │
│  │  Frontend (React + Vite)                        │        │
│  │  - Static assets served via Cloudflare CDN      │        │
│  │  - Global edge network                          │        │
│  │  - Automatic SSL                                │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   PostgreSQL     │  │   Auth Service   │                │
│  │   Database       │  │   - Login        │                │
│  └──────────────────┘  │   - Signup       │                │
│                        │   - Sessions     │                │
│  ┌──────────────────┐  └──────────────────┘                │
│  │  Edge Functions  │                                       │
│  │  - Hedera mint   │  ┌──────────────────┐                │
│  │  - Create DID    │  │   Storage        │                │
│  │  - HCS logging   │  │   (if needed)    │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. ✅ GitHub account
2. ✅ Cloudflare account (free tier is sufficient)
3. ✅ Supabase project (already configured)
4. ✅ Domain name (optional, Cloudflare provides `*.pages.dev` subdomain)

## Step 1: Prepare Your Repository

### 1.1 Update `.gitignore` (if needed)

Ensure sensitive files are not committed:

```bash
# Environment variables
.env
.env.local
.env.production.local

# Build output
dist/
build/

# OS files
.DS_Store
Thumbs.db

# Editor
.vscode/*
!.vscode/settings.json
.idea/
```

### 1.2 Commit and Push to GitHub

```bash
git add .
git commit -m "Prepare for Cloudflare Pages deployment"
git push origin main
```

## Step 2: Create Cloudflare Pages Project

### Option A: Via Cloudflare Dashboard (Recommended)

1. **Login to Cloudflare**

   - Go to https://dash.cloudflare.com/
   - Navigate to **Pages** in the sidebar

2. **Create a Project**

   - Click **"Create a project"**
   - Click **"Connect to Git"**
   - Authorize Cloudflare to access your GitHub account
   - Select your `certchain` repository

3. **Configure Build Settings**

   ```
   Project name:           certchain (or your-custom-name)
   Production branch:      main
   Framework preset:       Vite
   Build command:          npm run build
   Build output directory: dist
   Root directory:         /
   ```

4. **Set Environment Variables**

   Add these variables in **Settings → Environment variables**:

   ```
   VITE_HEDERA_NETWORK=testnet
   VITE_SUPABASE_PROJECT_ID=asxskeceekllmzxatlvn
   VITE_SUPABASE_URL=https://asxskeceekllmzxatlvn.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzeHNrZWNlZWtsbG16eGF0bHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MzM1MjYsImV4cCI6MjA3NjUwOTUyNn0.aoHQmo5inbkIeMaoQQ2l0ZP8uvKWVWIiul9HNFoD0dc
   VITE_WALLETCONNECT_PROJECT_ID=68d6e555353594118fe331ce105dea71
   VITE_HCS_LOG_TOPIC_ID=0.0.7115183
   VITE_COLLECTION_TOKEN_ID=0.0.7115182
   VITE_ENABLE_ANALYTICS=true
   VITE_ENABLE_WEBHOOKS=true
   VITE_ENABLE_AI_CONSOLE=false
   ```

   **Important:**

   - Set these for both **Production** and **Preview** environments
   - For production, consider using `VITE_HEDERA_NETWORK=mainnet` and mainnet token IDs

5. **Deploy**
   - Click **"Save and Deploy"**
   - Cloudflare will automatically build and deploy your site
   - First deployment takes 2-5 minutes

### Option B: Via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy dist --project-name=certchain
```

## Step 3: Configure Custom Domain (Optional)

1. **Add Domain in Cloudflare Pages**

   - Go to your Pages project → **Custom domains**
   - Click **"Set up a custom domain"**
   - Enter your domain (e.g., `certchain.com` or `app.certchain.com`)

2. **Update DNS**

   - If domain is already on Cloudflare: DNS records are added automatically
   - If domain is elsewhere: Add CNAME record pointing to `certchain.pages.dev`

3. **SSL/TLS**
   - Cloudflare automatically provisions SSL certificates
   - Usually takes 5-15 minutes

## Step 4: Update Supabase Configuration

### 4.1 Add Cloudflare Domain to Supabase

1. **Login to Supabase Dashboard**

   - Go to https://supabase.com/dashboard
   - Select your project: `asxskeceekllmzxatlvn`

2. **Update Site URL**

   - Go to **Authentication → URL Configuration**
   - Add your Cloudflare Pages URL to **Site URL**:
     ```
     https://certchain.pages.dev
     ```
     or your custom domain:
     ```
     https://app.certchain.com
     ```

3. **Update Redirect URLs**

   - Add to **Redirect URLs** (one per line):
     ```
     https://certchain.pages.dev/**
     https://app.certchain.com/**
     ```

4. **Save Changes**

### 4.2 Test Authentication Flow

After deployment, test:

- [ ] Sign up
- [ ] Email verification
- [ ] Login
- [ ] Password reset
- [ ] Logout

## Step 5: Configure Cloudflare Pages Settings

### 5.1 Build Configuration

Create `_headers` file in `public/` folder (optional, for additional security):

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 5.2 Redirects for SPA (Already handled by Vite)

Cloudflare Pages automatically handles SPA routing, but you can add custom redirects in `public/_redirects`:

```
/*    /index.html   200
```

## Step 6: Continuous Deployment

Cloudflare Pages automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Cloudflare automatically:
# 1. Detects the push
# 2. Runs build command
# 3. Deploys to production
# 4. Provides preview URL for branches
```

### Preview Deployments

Every branch and PR gets a unique preview URL:

- **Production**: `https://certchain.pages.dev`
- **Branch**: `https://branch-name.certchain.pages.dev`
- **PR**: Automatic preview link in PR comments

## Step 7: Monitoring & Analytics

### 7.1 Cloudflare Web Analytics (Free)

1. Enable in **Pages → Your Project → Analytics**
2. Tracks:
   - Page views
   - Visitors
   - Performance metrics
   - Geographic distribution

### 7.2 Supabase Logs

Monitor backend activity:

1. Go to Supabase Dashboard → **Logs**
2. View:
   - API requests
   - Auth events
   - Database queries
   - Edge function invocations

## Step 8: Performance Optimization

### 8.1 Build Optimization

Your `vite.config.ts` is already optimized, but you can add:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          hedera: ["@hashgraph/sdk"],
        },
      },
    },
  },
});
```

### 8.2 Cloudflare CDN

Cloudflare automatically:

- ✅ Caches static assets globally
- ✅ Compresses with Brotli/Gzip
- ✅ Minifies HTML/CSS/JS
- ✅ Serves via HTTP/3 (QUIC)

## Troubleshooting

### Build Fails

**Check logs in Cloudflare Pages dashboard:**

```bash
# Common issues:
# 1. Missing environment variables
# 2. Node version mismatch
# 3. Build command incorrect
```

**Set Node version** (add to package.json):

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Environment Variables Not Working

- Ensure all variables start with `VITE_` (Vite requirement)
- Rebuild after changing environment variables
- Check variable is set for correct environment (Production/Preview)

### Authentication Redirect Issues

1. Verify Supabase **Site URL** matches your deployment URL
2. Check **Redirect URLs** include wildcards (`/**`)
3. Clear browser cache and cookies
4. Check browser console for CORS errors

### CORS Errors

- Supabase Edge Functions already have CORS headers
- If issues persist, check Supabase function logs
- Verify Cloudflare domain is added to Supabase allowed origins

## Cost Breakdown

### Cloudflare Pages

- ✅ **Free Tier**:

  - Unlimited bandwidth
  - Unlimited requests
  - 500 builds/month
  - 1 concurrent build
  - Free SSL certificates
  - Global CDN

- 💰 **Paid Plans** (optional):
  - $20/month for more builds
  - Priority support
  - Advanced analytics

### Supabase

- ✅ **Free Tier**:

  - 500 MB database
  - 5 GB bandwidth
  - 2 GB file storage
  - 50,000 monthly active users

- 💰 **Pro Plan** ($25/month):
  - 8 GB database
  - 250 GB bandwidth
  - 100 GB file storage
  - 100,000 monthly active users

### Total Monthly Cost

- **Development**: $0 (Free tier)
- **Production**: $0-$45 (depending on needs)

## Security Checklist

- [x] Environment variables properly set
- [x] Supabase RLS policies enabled
- [x] API keys not exposed in frontend
- [x] HTTPS enforced (automatic)
- [x] Hedera operator keys only in Supabase Edge Functions
- [x] Pinata JWT only in backend
- [ ] Regular dependency updates (`npm audit`)
- [ ] Monitor Supabase logs for suspicious activity

## Next Steps

1. ✅ Deploy to Cloudflare Pages
2. ✅ Configure custom domain
3. ✅ Update Supabase URLs
4. ✅ Test authentication flow
5. 📊 Set up monitoring
6. 🚀 Announce to users!

## Useful Commands

```bash
# Local development
npm run dev

# Production build test
npm run build
npm run preview

# Deploy manually (if needed)
wrangler pages deploy dist --project-name=certchain

# View deployment logs
# (Available in Cloudflare dashboard)
```

## Support

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: Create issue in your repository

---

**🎉 Your CertChain app is now ready to scale globally with Cloudflare's edge network while maintaining all backend functionality through Supabase!**
