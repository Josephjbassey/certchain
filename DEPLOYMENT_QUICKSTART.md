# Cloudflare Pages Deployment - Quick Start

## 🚀 Quick Deployment Steps

### 1. Push to GitHub (if not already done)
```bash
git add .
git commit -m "Add Cloudflare Pages deployment config"
git push origin main
```

### 2. Deploy to Cloudflare Pages

**Option A: Automatic (Recommended)**
1. Go to https://dash.cloudflare.com/
2. Click **Pages** → **Create a project**
3. Connect GitHub → Select `certchain` repo
4. Use these settings:
   - **Build command**: `npm run build`
   - **Build output**: `dist`
   - **Framework preset**: Vite
5. Add environment variables (see below)
6. Click **Save and Deploy**

**Option B: Manual via CLI**
```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build and deploy
npm run build
wrangler pages deploy dist --project-name=certchain
```

### 3. Environment Variables to Add

Copy these to Cloudflare Pages dashboard under **Settings → Environment variables**:

```bash
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

### 4. Update Supabase Configuration

1. Go to https://supabase.com/dashboard/project/asxskeceekllmzxatlvn
2. Navigate to **Authentication → URL Configuration**
3. Set **Site URL** to: `https://certchain.pages.dev` (or your custom domain)
4. Add to **Redirect URLs**:
   ```
   https://certchain.pages.dev/**
   http://localhost:8080/**
   ```

### 5. Test Your Deployment

Once deployed, test:
- [ ] Visit your Cloudflare Pages URL
- [ ] Try signing up
- [ ] Check email verification
- [ ] Test login
- [ ] Create a certificate
- [ ] Verify Hedera transactions work

## 📦 What Was Added

### New Files:
- ✅ `CLOUDFLARE_DEPLOYMENT.md` - Complete deployment guide
- ✅ `.env.production` - Production environment template
- ✅ `wrangler.toml` - Cloudflare configuration
- ✅ `public/_headers` - Security headers
- ✅ `public/_redirects` - SPA routing support

### Updated Files:
- ✅ `package.json` - Added deployment scripts

## 🎯 Next Steps

### For Production:
1. **Get Custom Domain** (optional)
   - Add in Cloudflare Pages → Custom domains
   - SSL is automatic

2. **Switch to Mainnet** (when ready)
   - Update `VITE_HEDERA_NETWORK=mainnet`
   - Deploy mainnet HCS topic and NFT collection
   - Update token IDs in environment variables

3. **Monitor Performance**
   - Enable Cloudflare Web Analytics
   - Check Supabase logs regularly
   - Set up error monitoring (Sentry, etc.)

## 💡 Helpful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build:prod

# Preview production build locally
npm run preview

# Deploy preview (CLI)
npm run deploy:preview

# Deploy production (CLI)
npm run deploy:prod
```

## 🔍 Troubleshooting

**Build fails?**
- Check Node version: `node --version` (need 18+)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check environment variables are set

**Authentication not working?**
- Verify Supabase Site URL matches deployment URL
- Check redirect URLs include wildcards
- Clear browser cache

**Assets not loading?**
- Check browser console for errors
- Verify all paths are relative (start with `/`)
- Check `_redirects` file exists in `public/`

## 📊 Expected Results

### Performance:
- ⚡ First Contentful Paint: < 1s
- ⚡ Time to Interactive: < 2s
- ⚡ Lighthouse Score: 90+

### Cost:
- 💰 Cloudflare Pages: **FREE**
- 💰 Supabase: **FREE** (or $25/mo for Pro)
- 💰 Total: **$0-25/month**

## 📚 Documentation

- Full guide: `CLOUDFLARE_DEPLOYMENT.md`
- Cloudflare Docs: https://developers.cloudflare.com/pages/
- Supabase Docs: https://supabase.com/docs

---

**Ready to deploy? Follow Option A above to get started! 🚀**
