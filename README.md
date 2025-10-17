# CertChain - Decentralized Certificate Verification Platform

> **Production-ready frontend** for blockchain-based certificate issuance and verification on Hedera.

![CertChain](https://img.shields.io/badge/Hedera-Powered-007E3A?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## 🎯 Overview

CertChain is a comprehensive decentralized application for issuing, verifying, and managing tamper-proof certificates as NFTs on the Hedera blockchain. This repository contains the **production-ready frontend** built with React, TypeScript, and Tailwind CSS.

### Key Features

- ✅ **Decentralized Certificate Issuance** - Mint certificate NFTs on Hedera HTS
- ✅ **Instant Verification** - Blockchain-verified credentials in seconds
- ✅ **DID Integration** - Decentralized identifiers using `@hashgraph/did-sdk-js`
- ✅ **IPFS Storage** - Certificate metadata on Pinata/IPFS
- ✅ **Wallet Connect** - Hedera wallet integration via Reown AppKit
- ✅ **Real-time Updates** - HCS event streaming
- ✅ **Batch Operations** - Upload CSV for bulk certificate issuance
- ✅ **Analytics Dashboard** - Track issuance and verification metrics
- ✅ **Mobile-Ready** - Responsive design for all devices

## 🏗️ Architecture

### Frontend (This Repository)

- **Framework**: React 18 + Vite + TypeScript
- **UI**: TailwindCSS + `shadcn/ui` components
- **State**: React Context (`AuthProvider`) + TanStack Query (`react-query`)
- **Routing**: React Router v6
- **Theme**: Dark mode with emerald green (#007E3A) primary color

### Backend (Separate Deployment Required)

- **API**: Supabase (Edge Functions, Database, Auth)
- **Blockchain**: Hedera SDK (`@hashgraph/sdk`)
- **DID/VC**: `@hashgraph/did-sdk-js` (in Edge Functions)
- **Storage**: Pinata (server-side) + IPFS
- **Wallet**: Hedera Wallet Connect integration
- **AI**: Modular n8n microservice (optional)
- **Deployment**: Docker on Railway

### Smart Contracts (Optional)

- **HTS Native**: Primary approach using Hedera Token Service
- **Solidity**: Optional `CertificateRegistry.sol` + `SoulboundNFT.sol` via Hardhat

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Hedera testnet account (get one at [portal.hedera.com](https://portal.hedera.com))
- Pinata API key (for IPFS uploads)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd certchain

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 📦 Pages & Routes

### Public Pages

- `/` - Landing page with hero and features
- `/verify` - Certificate verification
- `/verify/[id]` - Certificate details
- `/pricing` - Pricing plans
- `/about` - About CertChain & `/docs` - Documentation

### Authentication

- `/auth/login` - Sign in
- `/auth/signup` - Register account
- `/auth/forgot-password` - Password recovery
- `/auth/2fa` - Two-Factor Authentication

### Dashboard (Authenticated)

#### User Routes

- `/dashboard/my-certificates` - View own certificates

#### Issuer Routes (`issuer` & `admin`)

- `/dashboard` - Main issuer dashboard
- `/dashboard/certificates` - All issued certificates
- `/dashboard/issue` - Issue single certificate
- `/dashboard/batch-issue` - Bulk certificate issuance
- `/dashboard/recipients` - Manage recipients
- `/dashboard/templates` - Certificate templates
- `/dashboard/analytics` - Issuance analytics

#### Admin Routes (`admin` only)

- `/admin` - Admin dashboard home
- `/admin/users` - User management
- `/admin/institutions` - Institution management
- `/admin/logs` - System audit logs
- `/dashboard/institution` - Manage own institution settings
- `/dashboard/issuers` - Manage authorized issuers
- `/dashboard/billing` - Billing & Subscriptions

### Settings

- `/settings/account` - Account settings
- `/settings/wallets` - Wallet management
- `/settings/api-keys` - API key management
- `/settings/webhooks` - Webhook configuration

## 🔧 Backend Integration

### Required Backend Services

This frontend requires a backend API with the following endpoints:

#### Authentication

```typescript
POST / api / auth / connect - wallet;
POST / api / auth / did - verify;
```

#### Certificates

```typescript
POST /api/certificates              // Issue certificate
GET  /api/certificates              // List certificates
GET  /api/certificates/:id          // Get certificate details
POST /api/certificates/:id/mint     // Mint NFT
POST /api/certificates/:id/revoke   // Revoke certificate
```

#### Verification

```typescript
POST / api / claim / generate; // Generate claim token
POST / api / claim / verify; // Verify claim token
```

#### Storage

```typescript
POST / api / upload / pinata; // Upload to Pinata/IPFS
```

#### Hedera Integration

```typescript
GET  /api/mirror/owner/:accountId   // Get NFTs by owner
GET  /api/hcs/topic/:topicId/messages // Get HCS messages
POST /api/webhook/hcs               // HCS webhook handler
```

### Environment Variables (Backend)

Create a `.env` file in your backend service:

```env
# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=302e...

# Pinata Configuration
PINATA_JWT=your_pinata_jwt_token
PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/

# DID Configuration
TRUSTID_API_KEY=your_trustid_key
TRUSTID_ISSUER_DID=did:hedera:testnet:...

# WalletConnect
WALLETCONNECT_PROJECT_ID=your_project_id

# Security
JWT_SECRET=your_strong_jwt_secret

# Database (Optional)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

## 🎨 Design System

### Color Palette

```css
Primary: #007E3A (Emerald Green)
Primary Glow: #006B32
Secondary: #004E26
Accent: #D9B96E (Gold)
Background (Light): #F8FAF8
Background (Dark): #0E1510
```

### Custom Utilities

- `gradient-hero` - Primary gradient background
- `gradient-card` - Subtle card gradient
- `gradient-accent` - Accent gradient
- `shadow-elevated` - Elevated shadow effect
- `shadow-glow` - Glow shadow effect
- `cert-shine` - Certificate shine animation

### Button Variants

```tsx
<Button variant="hero">Primary CTA</Button>
<Button variant="accent">Accent Action</Button>
<Button variant="outline">Secondary</Button>
```

## 🔐 Security Best Practices

1. **Never expose private keys** - All Hedera operations must happen on backend
2. **Validate all inputs** - Use Zod schemas for validation
3. **Implement RLS** - If using Supabase/database for caching
4. **HMAC webhook validation** - Verify all incoming webhooks
5. **Rate limiting** - Protect API endpoints
6. **DID-signed approvals** - Require signatures for critical operations

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint
npm run lint
```

## 📚 Integration Guides

### Hedera SDK Integration

```typescript
import { Client, TokenCreateTransaction, TokenType } from "@hashgraph/sdk";

// Initialize Hedera client (backend only)
const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);

// Create NFT collection
const transaction = await new TokenCreateTransaction()
  .setTokenName("CertChain Certificates")
  .setTokenSymbol("CERT")
  .setTokenType(TokenType.NonFungibleUnique)
  .setDecimals(0)
  .setInitialSupply(0)
  .setTreasuryAccountId(treasuryId)
  .setSupplyKey(supplyKey)
  .execute(client);
```

### DID/VC Integration

```typescript
import { HcsDid, HcsVc } from "@hashgraph/did-sdk-js";

// Create DID
const did = await HcsDid.generate();
await did.register();

// Issue Verifiable Credential
const vc = await HcsVc.issue({
  issuer: issuerDid,
  subject: recipientDid,
  credentialSubject: {
    certificateId: "cert-001",
    courseName: "Blockchain Development",
  },
});
```

### Pinata Upload

```typescript
import pinataSDK from "@pinata/sdk";

const pinata = new pinataSDK(pinataJWT);

// Upload certificate metadata
const result = await pinata.pinJSONToIPFS({
  certificateId: "cert-001",
  recipientName: "John Doe",
  courseName: "Advanced Blockchain",
  issuedDate: new Date().toISOString(),
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
