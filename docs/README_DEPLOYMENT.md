# 🚀 Edge Functions Deployment - Quick Start

Your edge functions are ready to deploy! Follow these simple steps.

## 📁 Files Created

I've created everything you need:

1. **`deploy-functions.sh`** - Automated deployment script
2. **`setup-secrets.sh`** - Automated secrets configuration
3. **`test-functions.sh`** - Test deployed functions
4. **`DEPLOYMENT_CHECKLIST.md`** - Detailed step-by-step guide
5. **`EDGE_FUNCTIONS_DEPLOYMENT.md`** - Complete documentation
6. **`supabase/config.toml`** - Updated with your project ID

## ⚡ Quick Deploy (3 Steps)

### 1️⃣ Login to Supabase

```bash
npx supabase login
```

This will open your browser to authenticate.

### 2️⃣ Set Up Secrets

```bash
./setup-secrets.sh
```

This reads your `.env` file and sets all required secrets.

### 3️⃣ Deploy Functions

```bash
./deploy-functions.sh
```

This deploys all 7 edge functions to your Supabase project.

## ✅ That's It!

Your functions are now deployed and ready to use.

## 🧪 Test Your Deployment

```bash
./test-functions.sh
```

## 📋 What Gets Deployed

| Function | Purpose | Endpoint |
|----------|---------|----------|
| **hedera-create-did** | Create Hedera DIDs | `/functions/v1/hedera-create-did` |
| **hedera-mint-certificate** | Mint NFT certificates | `/functions/v1/hedera-mint-certificate` |
| **hedera-hcs-log** | Log to Hedera Consensus Service | `/functions/v1/hedera-hcs-log` |
| **pinata-upload** | Upload to IPFS | `/functions/v1/pinata-upload` |
| **claim-certificate** | Process certificate claims | `/functions/v1/claim-certificate` |
| **admin-users** | User management (CRUD) | `/functions/v1/admin-users` |
| **institution-staff** | Staff management (CRUD) | `/functions/v1/institution-staff` |

## 🔐 Required Secrets

These are automatically configured from your `.env`:

- `HEDERA_OPERATOR_ID` - Your Hedera account ID
- `HEDERA_OPERATOR_KEY` - Your Hedera private key
- `PINATA_JWT` - Your Pinata JWT token
- `PINATA_GATEWAY` - Your Pinata gateway domain

## 📊 Monitor Your Functions

### View in Dashboard
https://supabase.com/dashboard/project/asxskeceekllmzxatlvn/functions

### View Logs via CLI
```bash
npx supabase functions logs hedera-create-did --tail
```

## 🔧 Troubleshooting

### "Access token not provided"
```bash
npx supabase login
```

### "Project not linked"
```bash
npx supabase link --project-ref asxskeceekllmzxatlvn
```

### Check if functions are deployed
```bash
npx supabase functions list --project-ref asxskeceekllmzxatlvn
```

### View function logs
```bash
npx supabase functions logs function-name --project-ref asxskeceekllmzxatlvn
```

## 📚 Documentation

- **Quick Start**: You're reading it! ✨
- **Deployment Checklist**: `DEPLOYMENT_CHECKLIST.md` (step-by-step)
- **Complete Guide**: `EDGE_FUNCTIONS_DEPLOYMENT.md` (detailed docs)

## 🎯 Next Steps After Deployment

1. ✅ Test functions using `./test-functions.sh`
2. ✅ Check function logs in Supabase dashboard
3. ✅ Test from your frontend application
4. ✅ Monitor function performance
5. ✅ Set up alerts for errors (optional)

## 💡 Tips

- **Development**: Functions are deployed with `--no-verify-jwt` for easier testing
- **Production**: Remove the `--no-verify-jwt` flag for JWT verification
- **Updates**: Just run `./deploy-functions.sh` again to update
- **Logs**: Use `--tail` flag to watch logs in real-time

## 🆘 Need Help?

Check these resources:

1. **Deployment Checklist** - `DEPLOYMENT_CHECKLIST.md`
2. **Full Documentation** - `EDGE_FUNCTIONS_DEPLOYMENT.md`
3. **Supabase Docs** - https://supabase.com/docs/guides/functions
4. **Function Logs** - In your Supabase dashboard

## ✨ Your Function URLs

Base URL: `https://asxskeceekllmzxatlvn.supabase.co/functions/v1`

All functions are already configured in your frontend code at:
- `/src/lib/hedera/service.ts`
- `/src/lib/ipfs/service.ts`

No code changes needed! 🎉

---

**Ready to deploy?** Just run:

```bash
npx supabase login
./setup-secrets.sh
./deploy-functions.sh
```

That's it! Your edge functions will be live in minutes. 🚀
