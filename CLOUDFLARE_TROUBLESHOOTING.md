# Cloudflare Pages Blank Screen - Troubleshooting Guide

## Issue

Frontend pages showing blank when deployed to Cloudflare Pages.

## Common Causes & Solutions

### 1. ✅ Build Configuration (FIXED)

**Problem**: Build output directory or base path misconfigured.

**Solution Applied**:

- Added explicit `base: '/'` in `vite.config.ts`
- Set `outDir: 'dist'` explicitly
- Configured sourcemaps for debugging

### 2. ⚠️ Environment Variables (CHECK THIS!)

**Problem**: Missing environment variables cause the app to fail silently.

**Required Environment Variables for Cloudflare Pages**:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_WALLETCONNECT_PROJECT_ID=your_wallet_connect_id
VITE_HEDERA_NETWORK=testnet
```

**How to Add in Cloudflare Pages**:

1. Go to Cloudflare Dashboard
2. Select your Pages project → Settings → Environment Variables
3. Add all `VITE_*` variables for both Production and Preview environments
4. Redeploy your site

### 3. ✅ SPA Routing (FIXED)

**Problem**: Cloudflare Pages doesn't handle client-side routing by default.

**Solution**: `public/_redirects` file already configured:

```
/*    /index.html   200
```

### 4. ✅ Error Handling (FIXED)

**Problem**: Errors fail silently with no user feedback.

**Solution Applied**:

- Added try-catch in `src/main.tsx`
- Display user-friendly error messages
- Show technical details for debugging

### 5. 🔧 External Dependencies (CHECK)

**Problem**: `@reown` package marked as external but may be imported somewhere.

**Current Config**:

```javascript
rollupOptions: {
  external: [/^@reown\//],
}
```

**Action**: Verify no code imports `@reown` packages (we removed them earlier).

### 6. Console Errors (DEBUGGING)

**To Check Browser Console**:

1. Open your Cloudflare Pages URL
2. Open DevTools (F12)
3. Check Console tab for errors
4. Check Network tab for failed requests

**Common Errors**:

- `Failed to fetch` → Environment variables missing
- `Unexpected token '<'` → Routing issue (check \_redirects)
- `Cannot read property of undefined` → Missing env vars
- CORS errors → Supabase URL misconfigured

## Cloudflare Pages Build Settings

### Recommended Settings:

```
Framework preset: Vite
Build command: npm run build:prod
Build output directory: dist
Root directory: /
Node version: 18 or 20
```

### Build Command Options:

- **Development**: `npm run build:dev` (includes sourcemaps)
- **Production**: `npm run build:prod` (optimized, no sourcemaps)

## Testing Locally Before Deploy

### 1. Build for Production

```bash
npm run build:prod
```

### 2. Preview Build Locally

```bash
npm run preview
```

### 3. Test with Cloudflare Wrangler

```bash
npx wrangler pages dev dist
```

## Step-by-Step Debugging Process

### Step 1: Check Build Output

```bash
npm run build:prod
ls -la dist/
```

**Expected files**:

- `index.html`
- `assets/` folder with JS and CSS files
- `_redirects` file
- `_headers` file
- Favicon files

### Step 2: Verify Environment Variables

In Cloudflare Pages Dashboard:

1. Settings → Environment Variables
2. Ensure all `VITE_*` vars are set for Production
3. Redeploy after adding variables

### Step 3: Check Deployment Logs

In Cloudflare Pages:

1. Go to Deployments tab
2. Click on latest deployment
3. View build logs for errors
4. Check "View deployment" link

### Step 4: Browser DevTools

1. Open site in browser
2. F12 → Console tab
3. Look for red error messages
4. Network tab → Check if index.html loads (200 status)
5. Network tab → Check if JS/CSS files load

### Step 5: Test Routing

Try these URLs on your deployed site:

- `/` (homepage)
- `/about`
- `/verify`
- `/auth/login`

All should load without 404 errors.

## Quick Fix Checklist

- [x] `_redirects` file in `public/` folder
- [x] `base: '/'` in vite.config.ts
- [x] Error handling in main.tsx
- [ ] Environment variables set in Cloudflare
- [ ] Build output directory set to `dist`
- [ ] Build command set to `npm run build:prod`
- [ ] Node version 18+ selected

## Common Cloudflare Pages Issues

### Issue: "This page isn't working"

**Cause**: No index.html in dist folder
**Fix**: Check build logs, ensure build completes successfully

### Issue: Blank white page, no errors

**Cause**: JavaScript not loading
**Fix**:

1. Check Network tab in DevTools
2. Verify asset paths are correct (should start with `/assets/`)
3. Check `base` config in vite.config.ts

### Issue: Page loads but features don't work

**Cause**: Missing environment variables
**Fix**: Add all VITE\_\* variables in Cloudflare Pages settings

### Issue: Routes show 404

**Cause**: \_redirects file not copied to dist
**Fix**: Ensure \_redirects is in public/ folder (Vite copies it automatically)

## Testing Environment Variables

Add this to your app temporarily to debug:

```javascript
// In src/main.tsx (remove after testing)
console.log("Environment Check:", {
  supabase: !!import.meta.env.VITE_SUPABASE_URL,
  walletConnect: !!import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  network: import.meta.env.VITE_HEDERA_NETWORK,
});
```

## Cloudflare Pages Deployment Commands

### Deploy Preview (Branch)

```bash
npm run deploy:preview
```

### Deploy Production

```bash
npm run deploy:prod
```

### Using Wrangler CLI

```bash
# Install wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy dist --project-name=certchain
```

## Additional Resources

- [Cloudflare Pages SPA Docs](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [Vite Build Configuration](https://vitejs.dev/guide/build.html)
- [Troubleshooting Blank Pages](https://developers.cloudflare.com/pages/configuration/build-configuration/)

## Next Steps

1. **Add environment variables in Cloudflare Pages dashboard**
2. **Trigger a new deployment**
3. **Check browser console for errors**
4. **Review deployment logs**
5. **Test all routes**

If issues persist after following this guide, check the browser console and deployment logs for specific error messages.
