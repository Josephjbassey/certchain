# Edge Functions Deployment Guide

This guide will walk you through deploying all 7 edge functions to your Supabase project.

## 📋 Prerequisites

- Supabase account with project `asxskeceekllmzxatlvn`
- Supabase access token
- All secrets configured in `.env` file

## 🚀 Quick Start (Recommended)

### Step 1: Get Supabase Access Token

1. Go to https://supabase.com/dashboard/account/tokens
2. Create a new access token (or use existing)
3. Copy the token

### Step 2: Login to Supabase CLI

```bash
npx supabase login
```

Or set the access token:

```bash
export SUPABASE_ACCESS_TOKEN=your_access_token_here
```

### Step 3: Set Up Secrets

```bash
./setup-secrets.sh
```

This will set up all required secrets from your `.env` file:
- `HEDERA_OPERATOR_ID`
- `HEDERA_OPERATOR_KEY`
- `PINATA_JWT`
- `PINATA_GATEWAY`

### Step 4: Deploy All Functions

```bash
./deploy-functions.sh
```

This will deploy all 7 edge functions:
1. `hedera-create-did` - Create Hedera DIDs
2. `hedera-mint-certificate` - Mint NFT certificates
3. `hedera-hcs-log` - Log events to HCS
4. `pinata-upload` - Upload to IPFS
5. `claim-certificate` - Process certificate claims
6. `admin-users` - User management
7. `institution-staff` - Staff management

## 🔧 Manual Deployment (Alternative)

### 1. Link Project

```bash
npx supabase link --project-ref asxskeceekllmzxatlvn
```

### 2. Set Secrets Manually

```bash
# Hedera secrets
npx supabase secrets set HEDERA_OPERATOR_ID=0.0.6834167
npx supabase secrets set HEDERA_OPERATOR_KEY=your_private_key

# Pinata secrets
npx supabase secrets set PINATA_JWT=your_jwt_token
npx supabase secrets set PINATA_GATEWAY=azure-secure-leopard-586.mypinata.cloud
```

### 3. Deploy Each Function

```bash
npx supabase functions deploy hedera-create-did --no-verify-jwt
npx supabase functions deploy hedera-mint-certificate --no-verify-jwt
npx supabase functions deploy hedera-hcs-log --no-verify-jwt
npx supabase functions deploy pinata-upload --no-verify-jwt
npx supabase functions deploy claim-certificate --no-verify-jwt
npx supabase functions deploy admin-users --no-verify-jwt
npx supabase functions deploy institution-staff --no-verify-jwt
```

## 📊 Verify Deployment

### List All Functions

```bash
npx supabase functions list
```

### Check Function Logs

```bash
npx supabase functions logs hedera-create-did
```

### Test a Function

```bash
curl -X POST \
  https://asxskeceekllmzxatlvn.supabase.co/functions/v1/hedera-create-did \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userAccountId": "0.0.123456", "network": "testnet"}'
```

## 🔐 Required Secrets

Each function requires specific environment variables:

### All Hedera Functions
- `HEDERA_OPERATOR_ID` - Your Hedera operator account ID (e.g., 0.0.6834167)
- `HEDERA_OPERATOR_KEY` - Your Hedera operator private key (DER format)

### Pinata Functions
- `PINATA_JWT` - Your Pinata JWT token
- `PINATA_GATEWAY` - Your Pinata gateway domain

## 📡 Function Endpoints

Once deployed, your functions will be available at:

```
https://asxskeceekllmzxatlvn.supabase.co/functions/v1/{function-name}
```

### Available Endpoints:

1. **hedera-create-did**
   - Creates Hedera DIDs for users
   - POST with: `{ userAccountId, network }`

2. **hedera-mint-certificate**
   - Mints NFT certificates on Hedera
   - POST with: `{ tokenId, recipientAccountId, metadata, serialNumber }`

3. **hedera-hcs-log**
   - Logs events to Hedera Consensus Service
   - POST with: `{ topicId, message, eventType }`

4. **pinata-upload**
   - Uploads data to IPFS via Pinata
   - POST with: `{ data, name }` or file upload

5. **claim-certificate**
   - Processes certificate claim tokens
   - POST with: `{ token, userAccountId }`

6. **admin-users**
   - User management operations (CRUD)
   - GET, POST, PUT, DELETE

7. **institution-staff**
   - Manages institution staff relationships
   - GET, POST, PUT, DELETE

## 🔒 Security Notes

### JWT Verification

Functions are deployed with `--no-verify-jwt` for easier testing. For production:

```bash
npx supabase functions deploy function-name  # Remove --no-verify-jwt flag
```

### RLS Policies

Ensure your database has proper Row Level Security (RLS) policies:
- `profiles` table
- `user_roles` table
- `certificate_cache` table
- `institutions` table

### API Keys

Only expose your `ANON_KEY` to the frontend. Keep `SERVICE_ROLE_KEY` secure and use only in backend.

## 🐛 Troubleshooting

### Error: "Access token not provided"

Solution:
```bash
npx supabase login
```

### Error: "Project not linked"

Solution:
```bash
npx supabase link --project-ref asxskeceekllmzxatlvn
```

### Error: "Secret not found"

Solution: Check secrets are set:
```bash
npx supabase secrets list
```

### Function Returns 500 Error

Check logs:
```bash
npx supabase functions logs function-name --tail
```

### CORS Errors

All functions include CORS headers. If issues persist, check:
- CORS is enabled in Supabase dashboard
- Origin is allowed in function code

## 📝 Function Code Structure

Each function follows this structure:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Function logic here
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

## 🔄 Updating Functions

To update a deployed function:

```bash
npx supabase functions deploy function-name --no-verify-jwt
```

Changes are deployed immediately.

## 📊 Monitoring

### View Logs in Dashboard

1. Go to https://supabase.com/dashboard/project/asxskeceekllmzxatlvn/functions
2. Select a function
3. View logs in real-time

### CLI Logs

```bash
# Live tail logs
npx supabase functions logs function-name --tail

# Get recent logs
npx supabase functions logs function-name --limit 100
```

## 🎯 Next Steps

After deployment:

1. ✅ Test each function from Supabase dashboard
2. ✅ Update frontend code to use function URLs
3. ✅ Set up monitoring and alerts
4. ✅ Configure RLS policies
5. ✅ Enable JWT verification for production
6. ✅ Set up rate limiting if needed

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Hedera SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis/sdks)
- [Pinata IPFS Documentation](https://docs.pinata.cloud/)

## 🆘 Support

If you encounter issues:

1. Check function logs: `npx supabase functions logs function-name`
2. Verify secrets: `npx supabase secrets list`
3. Test locally: `npx supabase functions serve function-name`
4. Check Supabase status: https://status.supabase.com/

---

**Ready to deploy?** Run `./deploy-functions.sh` to get started! 🚀
