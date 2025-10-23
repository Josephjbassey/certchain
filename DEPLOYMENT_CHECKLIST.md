# 🚀 Edge Functions Deployment Checklist

Follow these steps to deploy your edge functions to Supabase.

## ✅ Pre-Deployment Checklist

- [ ] Supabase project created: `asxskeceekllmzxatlvn`
- [ ] Database schema applied
- [ ] Environment variables configured in `.env`
- [ ] Hedera operator account funded with HBAR
- [ ] Pinata account created and JWT obtained
- [ ] Supabase CLI access token ready

## 🔐 Step 1: Get Your Supabase Access Token

1. Visit: https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Name it: "CertChain CLI"
4. Copy the token (you'll only see it once!)

## 🔑 Step 2: Authenticate with Supabase

Choose one method:

### Method A: Interactive Login (Recommended)
```bash
npx supabase login
```
This will open a browser for authentication.

### Method B: Environment Variable
```bash
export SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxx
```

## 🔗 Step 3: Link Your Project

```bash
cd /root/repo
npx supabase link --project-ref asxskeceekllmzxatlvn
```

You'll be asked to enter your database password.

## 🔐 Step 4: Set Up Secrets

Run the automated script:

```bash
./setup-secrets.sh
```

Or set manually:

```bash
npx supabase secrets set HEDERA_OPERATOR_ID="0.0.6834167" --project-ref asxskeceekllmzxatlvn
npx supabase secrets set HEDERA_OPERATOR_KEY="3030020100300706052b8104000a0422042066d62bf2024563a7f1d9421a96e995da5a258201e2a240b4c2591eddd4c1c1de" --project-ref asxskeceekllmzxatlvn
npx supabase secrets set PINATA_JWT="your_jwt_here" --project-ref asxskeceekllmzxatlvn
npx supabase secrets set PINATA_GATEWAY="azure-secure-leopard-586.mypinata.cloud" --project-ref asxskeceekllmzxatlvn
```

Verify secrets:
```bash
npx supabase secrets list --project-ref asxskeceekllmzxatlvn
```

## 📦 Step 5: Deploy Functions

### Option A: Deploy All at Once (Recommended)

```bash
./deploy-functions.sh
```

### Option B: Deploy Individually

```bash
# 1. Hedera DID Creation
npx supabase functions deploy hedera-create-did --no-verify-jwt --project-ref asxskeceekllmzxatlvn

# 2. Certificate Minting
npx supabase functions deploy hedera-mint-certificate --no-verify-jwt --project-ref asxskeceekllmzxatlvn

# 3. HCS Event Logging
npx supabase functions deploy hedera-hcs-log --no-verify-jwt --project-ref asxskeceekllmzxatlvn

# 4. IPFS Upload
npx supabase functions deploy pinata-upload --no-verify-jwt --project-ref asxskeceekllmzxatlvn

# 5. Certificate Claims
npx supabase functions deploy claim-certificate --no-verify-jwt --project-ref asxskeceekllmzxatlvn

# 6. User Management
npx supabase functions deploy admin-users --no-verify-jwt --project-ref asxskeceekllmzxatlvn

# 7. Staff Management
npx supabase functions deploy institution-staff --no-verify-jwt --project-ref asxskeceekllmzxatlvn
```

## ✅ Step 6: Verify Deployment

### Check Function Status

```bash
npx supabase functions list --project-ref asxskeceekllmzxatlvn
```

Expected output:
```
┌─────────────────────────────┬─────────┬───────────────────────┬─────────┐
│ NAME                        │ STATUS  │ CREATED AT            │ REGION  │
├─────────────────────────────┼─────────┼───────────────────────┼─────────┤
│ hedera-create-did           │ ACTIVE  │ 2025-10-23 05:30:00   │ us-east │
│ hedera-mint-certificate     │ ACTIVE  │ 2025-10-23 05:30:15   │ us-east │
│ hedera-hcs-log              │ ACTIVE  │ 2025-10-23 05:30:30   │ us-east │
│ pinata-upload               │ ACTIVE  │ 2025-10-23 05:30:45   │ us-east │
│ claim-certificate           │ ACTIVE  │ 2025-10-23 05:31:00   │ us-east │
│ admin-users                 │ ACTIVE  │ 2025-10-23 05:31:15   │ us-east │
│ institution-staff           │ ACTIVE  │ 2025-10-23 05:31:30   │ us-east │
└─────────────────────────────┴─────────┴───────────────────────┴─────────┘
```

### Test a Function

```bash
# Test DID creation
curl -X POST \
  "https://asxskeceekllmzxatlvn.supabase.co/functions/v1/hedera-create-did" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userAccountId": "0.0.123456",
    "network": "testnet"
  }'
```

Expected response:
```json
{
  "success": true,
  "did": "did:hedera:testnet:0.0.123456",
  "accountId": "0.0.123456",
  "network": "testnet",
  "message": "DID created successfully"
}
```

## 📊 Step 7: Monitor Functions

### View Logs in Real-Time

```bash
# Watch logs for a specific function
npx supabase functions logs hedera-create-did --tail --project-ref asxskeceekllmzxatlvn

# View last 100 log entries
npx supabase functions logs hedera-mint-certificate --limit 100 --project-ref asxskeceekllmzxatlvn
```

### Dashboard Monitoring

Visit: https://supabase.com/dashboard/project/asxskeceekllmzxatlvn/functions

## 🔧 Troubleshooting

### Issue: "Access token not provided"

**Solution:**
```bash
npx supabase login
# or
export SUPABASE_ACCESS_TOKEN=your_token
```

### Issue: "Project not linked"

**Solution:**
```bash
npx supabase link --project-ref asxskeceekllmzxatlvn
```

### Issue: Function returns 500 error

**Solution:**
1. Check logs: `npx supabase functions logs function-name --project-ref asxskeceekllmzxatlvn`
2. Verify secrets are set: `npx supabase secrets list --project-ref asxskeceekllmzxatlvn`
3. Check Hedera operator account has HBAR balance

### Issue: "Secret not found in function"

**Solution:**
```bash
# List current secrets
npx supabase secrets list --project-ref asxskeceekllmzxatlvn

# Re-set missing secret
npx supabase secrets set SECRET_NAME="value" --project-ref asxskeceekllmzxatlvn
```

### Issue: CORS errors in frontend

**Solution:**
All functions already include CORS headers. Check:
1. You're using the correct anon key
2. Authorization header format: `Bearer YOUR_ANON_KEY`

### Issue: "Hedera credentials not configured"

**Solution:**
```bash
# Verify secrets exist
npx supabase secrets list --project-ref asxskeceekllmzxatlvn

# Should show:
# - HEDERA_OPERATOR_ID
# - HEDERA_OPERATOR_KEY
# - PINATA_JWT
# - PINATA_GATEWAY
```

## 🎯 Post-Deployment Tasks

- [ ] Test each function from Supabase dashboard
- [ ] Update frontend service URLs (already configured in your code)
- [ ] Set up monitoring alerts
- [ ] Enable JWT verification for production (remove `--no-verify-jwt`)
- [ ] Configure rate limiting
- [ ] Set up backup Hedera operator account
- [ ] Document API usage for team

## 📱 Function Endpoints

Once deployed, your functions are available at:

| Function | Endpoint | Purpose |
|----------|----------|---------|
| hedera-create-did | `/functions/v1/hedera-create-did` | Create DIDs |
| hedera-mint-certificate | `/functions/v1/hedera-mint-certificate` | Mint NFTs |
| hedera-hcs-log | `/functions/v1/hedera-hcs-log` | Log to HCS |
| pinata-upload | `/functions/v1/pinata-upload` | Upload to IPFS |
| claim-certificate | `/functions/v1/claim-certificate` | Process claims |
| admin-users | `/functions/v1/admin-users` | User CRUD |
| institution-staff | `/functions/v1/institution-staff` | Staff CRUD |

## 🔒 Security Reminders

1. **Never commit** secrets to git
2. **Rotate** Hedera operator keys regularly
3. **Monitor** function usage and costs
4. **Enable** JWT verification for production
5. **Set up** RLS policies on all tables
6. **Use** service role key only in edge functions (never frontend)

## 📚 Resources

- [Deployment Guide](./EDGE_FUNCTIONS_DEPLOYMENT.md) - Detailed guide
- [Supabase Functions Docs](https://supabase.com/docs/guides/functions)
- [Hedera Documentation](https://docs.hedera.com/)

## ✨ Quick Command Reference

```bash
# Login
npx supabase login

# Link project
npx supabase link --project-ref asxskeceekllmzxatlvn

# Set secret
npx supabase secrets set KEY="value" --project-ref asxskeceekllmzxatlvn

# List secrets
npx supabase secrets list --project-ref asxskeceekllmzxatlvn

# Deploy function
npx supabase functions deploy function-name --no-verify-jwt --project-ref asxskeceekllmzxatlvn

# List functions
npx supabase functions list --project-ref asxskeceekllmzxatlvn

# View logs
npx supabase functions logs function-name --tail --project-ref asxskeceekllmzxatlvn

# Delete function (if needed)
npx supabase functions delete function-name --project-ref asxskeceekllmzxatlvn
```

---

**Ready?** Start with Step 1 and work through each step carefully. Good luck! 🚀
