# 🔷 CertChain - Decentralized Certificate Verification Platform

> **Production-ready decentralized certificate issuance and verification on Hedera Hashgraph**

![Hedera](https://img.shields.io/badge/Hedera-Powered-007E3A?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## 🎯 Overview

CertChain is a production-ready decentralized application for issuing, verifying, and managing tamper-proof certificates as NFTs on Hedera. Built with React, TypeScript, and integrated with Hedera Token Service (HTS), Hedera Consensus Service (HCS), DID SDK, and IPFS.

### ✨ Key Features

- 🔐 **Hedera Integration** - HTS token minting, HCS event logging, DID management
- 📦 **IPFS Storage** - Decentralized metadata storage via Pinata
- 🔄 **Real-time Events** - SSE streaming for HCS consensus messages
- 🔑 **API Management** - Full API key generation with scopes and permissions
- 🪝 **Webhooks** - HMAC-signed event notifications
- 💼 **Wallet Management** - HashPack, Blade, Kabila wallet support
- 📊 **Analytics** - Certificate issuance and verification tracking
- 🎨 **Modern UI** - TailwindCSS + shadcn/ui with dark mode
- 📱 **Mobile-Ready** - Fully responsive design
- 🛡️ **Production Security** - Error boundaries, structured logging, retry logic

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **UI**: TailwindCSS + shadcn/ui components
- **State**: React Context + TanStack Query
- **Routing**: React Router v6

### Backend Integration
- **API**: Supabase Edge Functions
- **Blockchain**: `@hashgraph/sdk` (v2.75.0)
- **DID**: `@hashgraph/did-sdk-js`
- **Wallet**: `@hashgraph/hedera-wallet-connect` + Reown AppKit
- **Storage**: Pinata IPFS
- **Database**: Supabase PostgreSQL

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Hedera testnet account ([portal.hedera.com](https://portal.hedera.com))
- Supabase project
- Pinata account

### Installation

```bash
# Install dependencies
bun install

# Copy environment template
cp .env.example .env

# Configure .env (see PRODUCTION_SETUP.md)

# Start development
bun run dev
```

### Environment Variables

```env
VITE_HEDERA_NETWORK=testnet
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

**Backend secrets** (Supabase Edge Functions):
```bash
supabase secrets set HEDERA_OPERATOR_ID=0.0.xxxxx
supabase secrets set HEDERA_OPERATOR_KEY=302e...
supabase secrets set PINATA_JWT=eyJhbGc...
```

See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for complete setup instructions.

## 📦 Project Structure

```
src/
├── lib/
│   ├── hedera/          # Hedera service integration
│   │   ├── service.ts   # Main Hedera SDK wrapper
│   │   ├── config.ts    # Network configuration
│   │   ├── errors.ts    # Error handling & retry
│   │   └── types.ts     # TypeScript definitions
│   ├── ipfs/            # Pinata/IPFS service
│   ├── hcs/             # Real-time HCS events
│   └── logging/         # Structured logging
├── pages/
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard pages
│   ├── settings/        # Settings pages
│   │   ├── ApiKeys.tsx  # API key management
│   │   ├── Wallets.tsx  # Wallet management
│   │   └── WebhooksSettings.tsx
│   └── admin/           # Admin pages
└── components/
    ├── ErrorBoundary.tsx
    ├── ProtectedRoute.tsx
    └── ui/              # shadcn components
```

## 📚 Key Services

### Hedera Service (`src/lib/hedera/`)

```typescript
import { hederaService } from '@/lib/hedera';

// Create DID
const did = await hederaService.createDID({
  userAccountId: '0.0.12345'
});

// Mint certificate
const cert = await hederaService.mintCertificate({
  recipientAccountId: '0.0.12345',
  institutionTokenId: '0.0.67890',
  metadataCid: 'Qm...',
  certificateData: { ... }
});

// Log to HCS
await hederaService.logToHCS({
  topicId: '0.0.98765',
  messageType: 'certificate.issued',
  message: { ... }
});
```

### IPFS Service (`src/lib/ipfs/`)

```typescript
import { ipfsService } from '@/lib/ipfs';

// Upload metadata
const result = await ipfsService.uploadMetadata({
  certificateId: 'cert-123',
  courseName: 'Blockchain 101',
  ...
});

// Fetch from IPFS (with fallbacks)
const metadata = await ipfsService.fetchFromIPFS('Qm...');
```

### HCS Event Stream (`src/lib/hcs/`)

```typescript
import { hcsEventStream } from '@/lib/hcs';

// Subscribe to events
const unsubscribe = hcsEventStream.subscribe('certificate.issued', (event) => {
  console.log('New certificate:', event);
});
```

## 🔐 Security Features

✅ **Production-Ready Security**:
- Environment validation with Zod
- API key hashing (SHA-256)
- Webhook HMAC signatures
- Retry logic with exponential backoff
- Error boundaries
- Structured logging with HCS audit trail
- Multi-network support (testnet/mainnet)

## 📦 Pages & Routes

### Public (9 pages)
- `/` - Landing page
- `/verify` - Certificate verification
- `/verify/:certificateId` - Verification detail
- `/verify/scan` - QR code scanner
- `/pricing`, `/about`, `/docs`, `/contact`

### Auth (6 pages)
- `/auth/login`, `/auth/signup`
- `/auth/forgot-password`, `/auth/reset-password/:token`
- `/auth/verify-email`, `/auth/2fa`

### Dashboard (40+ pages)
**Role-based routing**: `/candidate/`, `/instructor/`, `/institution/`, `/admin/`

- Certificate management
- Issue certificates (single & batch)
- Recipients & templates
- Analytics & reporting
- Settings & integrations

## 🧪 Development

```bash
# Development
bun run dev

# Build
bun run build

# Test
bun run test

# Lint
bun run lint
```

## 📊 Production Deployment

### Option 1: Vercel

```bash
vercel --prod
```

### Option 2: Railway

```bash
railway up
```

### Option 3: Docker

```bash
docker build -t certchain .
docker run -p 3000:3000 certchain
```

## 📚 Documentation

- [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) - Complete setup guide
- [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - What's been built
- [HEDERA_SERVICES.md](./HEDERA_SERVICES.md) - Hedera integration guide
- [SUPER_ADMIN_SETUP.md](./SUPER_ADMIN_SETUP.md) - Admin configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## � Links

- **Hedera**: https://hedera.com
- **Hedera SDK**: https://docs.hedera.com
- **DID SDK**: https://github.com/hashgraph/did-sdk-js
- **Supabase**: https://supabase.com
- **Pinata**: https://pinata.cloud

## 💬 Support

- **Email**: support@certchain.io
- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues

---

**Built with ❤️ using Hedera Hashgraph**

Status: ✅ **PRODUCTION READY**
});

console.log(`IPFS CID: ${result.IpfsHash}`);
```

## 🚢 Deployment

### Frontend Deployment (This Repository)

```bash
npm run build
# Deploy dist/ to Vercel, Netlify, or any static host
```

### Backend Deployment (Railway)

1. Create `Dockerfile` for backend API
2. Create `Dockerfile` for AI microservice
3. Configure Railway project with both containers
4. Set environment variables in Railway dashboard
5. Deploy via GitHub integration

### Smart Contract Deployment

```bash
# Using Hardhat
npx hardhat run scripts/deploy.ts --network hedera-testnet

# Using Remix IDE
# Connect to Hedera JSON-RPC Relay
# Deploy CertificateRegistry.sol and SoulboundNFT.sol
```

## 📊 Production Checklist

- [ ] Backend API deployed and accessible
- [ ] Hedera testnet → mainnet migration
- [ ] Pinata production keys configured
- [ ] DID topics created and registered
- [ ] Smart contracts deployed (if using Solidity)
- [ ] Wallet Connect project configured
- [ ] Environment variables secured
- [ ] SSL certificates installed
- [ ] Monitoring and logging set up
- [ ] Rate limiting configured
- [ ] Backup strategies implemented
- [ ] CI/CD pipelines active

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting PRs.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🔗 Resources

- [Hedera Documentation](https://docs.hedera.com)
- [Hedera DID SDK](https://github.com/hashgraph/did-sdk-js)
- [Pinata Docs](https://docs.pinata.cloud)
- [Reown WalletConnect](https://docs.reown.com)
- [shadcn/ui Components](https://ui.shadcn.com)

## 📧 Support

For questions and support:

- Create an issue in this repository
- Join our Discord community
- Email: support@certchain.example

---

**Built with ❤️ on Hedera Hashgraph**
