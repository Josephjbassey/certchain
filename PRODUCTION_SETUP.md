# Hedera CertChain - Production Setup Guide

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### 2. Required Environment Variables

#### Frontend Variables (VITE_*)
- `VITE_HEDERA_NETWORK`: Hedera network (testnet/mainnet)
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_WALLETCONNECT_PROJECT_ID`: WalletConnect project ID

#### Backend Variables (Supabase Edge Functions)
- `HEDERA_OPERATOR_ID`: Hedera operator account ID
- `HEDERA_OPERATOR_KEY`: Hedera operator private key (DER format)
- `PINATA_JWT`: Pinata JWT for IPFS uploads

### 3. Network Configuration

#### Testnet (Development)
```env
VITE_HEDERA_NETWORK=testnet
```
- Mirror Node: https://testnet.mirrornode.hedera.com
- Explorer: https://hashscan.io/testnet

#### Mainnet (Production)
```env
VITE_HEDERA_NETWORK=mainnet
```
- Mirror Node: https://mainnet-public.mirrornode.hedera.com
- Explorer: https://hashscan.io/mainnet

### 4. Hedera Setup

1. **Create Hedera Account**
   - Visit https://portal.hedera.com
   - Create testnet or mainnet account
   - Fund account with HBAR

2. **Configure Operator**
   ```bash
   # Set in Supabase Edge Function Secrets
   HEDERA_OPERATOR_ID=0.0.xxxxx
   HEDERA_OPERATOR_KEY=302e...
   ```

3. **Create HCS Topic** (Optional)
   ```typescript
   // Use Hedera SDK or Portal
   const topicId = await createTopic({
     memo: "CertChain Log Topic"
   });
   ```

### 5. Pinata/IPFS Setup

1. **Create Pinata Account**
   - Visit https://pinata.cloud
   - Generate JWT token

2. **Configure Pinata**
   ```bash
   # Set in Supabase Edge Function Secrets
   PINATA_JWT=eyJhbGc...
   ```

### 6. Supabase Setup

1. **Create Supabase Project**
   - Visit https://supabase.com
   - Create new project
   - Note URL and anon key

2. **Run Migrations**
   ```bash
   cd supabase
   supabase db push
   ```

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy hedera-create-did
   supabase functions deploy hedera-mint-certificate
   supabase functions deploy hedera-hcs-log
   supabase functions deploy pinata-upload
   ```

4. **Set Edge Function Secrets**
   ```bash
   supabase secrets set HEDERA_OPERATOR_ID=0.0.xxxxx
   supabase secrets set HEDERA_OPERATOR_KEY=302e...
   supabase secrets set PINATA_JWT=eyJhbGc...
   ```

### 7. Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Run tests
bun run test

# Build for production
bun run build
```

### 8. Production Deployment

#### Option A: Vercel (Frontend)
```bash
vercel --prod
```

#### Option B: Railway (Full Stack)
```bash
railway up
```

#### Docker Deployment
```bash
docker build -t certchain .
docker run -p 3000:3000 certchain
```

### 9. Security Checklist

- [ ] Never commit `.env` files
- [ ] Use environment-specific configs
- [ ] Store operator keys in secure vaults
- [ ] Enable RLS on Supabase tables
- [ ] Configure CORS properly
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Enable audit logging
- [ ] Regular security audits

### 10. Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Enable HCS audit logs
- [ ] Monitor Hedera transaction costs
- [ ] Track IPFS pin status

## Architecture

```
┌─────────────┐
│   Frontend  │ (React + Vite)
│  (Browser)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Supabase   │ (Auth + DB + Edge Functions)
└──────┬──────┘
       │
       ├──────────────┬─────────────┐
       ▼              ▼             ▼
┌──────────┐   ┌──────────┐  ┌──────────┐
│ Hedera   │   │  Pinata  │  │   DID    │
│ HTS+HCS  │   │   IPFS   │  │  SDK.js  │
└──────────┘   └──────────┘  └──────────┘
```

## Support

- Documentation: https://docs.certchain.io
- Email: support@certchain.io
- Discord: https://discord.gg/certchain
