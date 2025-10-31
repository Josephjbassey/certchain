# 🎯 CertChain - Pure dApp Conversion Plan

## Overview

Convert CertChain from a Supabase-backend hybrid to a **pure decentralized application (dApp)** using only Hedera blockchain and IPFS for storage.

## Why Convert?

### Current Issues
- ❌ Supabase RLS policies are complex and broken
- ❌ Database synchronization issues across role-based pages
- ❌ Centralized backend dependency (Supabase)
- ❌ Edge functions add complexity
- ❌ Authentication tied to Supabase auth
- ❌ Too many pages for hackathon scope

### Benefits of Pure dApp
- ✅ True decentralization (blockchain-first)
- ✅ No database sync issues
- ✅ Wallet-based authentication only
- ✅ Simpler architecture
- ✅ Lower operating costs (no Supabase subscription)
- ✅ Better security (no centralized data breach risk)
- ✅ Focus on core features for hackathon

---

## 🏗️ New Architecture

```
┌─────────────────────────────────────────┐
│          Frontend (React)                │
│  - Wallet Connect (HashPack, Blade)     │
│  - Certificate Verification             │
│  - Certificate Issuance                  │
└────────────┬────────────────────────────┘
             │
             ├──► Hedera Network
             │    - HTS Tokens (Certificates)
             │    - HCS Topics (Event Logs)
             │    - Smart Contracts (optional)
             │
             └──► IPFS (Pinata)
                  - Certificate Metadata
                  - Images/PDFs
```

---

## 🎯 Core Features to Keep (MVP)

### 1. **Public Pages** (No Auth Required)
- ✅ **Home** - Landing page
- ✅ **Verify Certificate** - Check certificate validity via Hedera
- ✅ **About** - Project info
- ✅ **Pricing** - Simple pricing page
- ✅ **Contact** - Contact form (store in IPFS or HCS topic)

### 2. **Wallet-Connected Features**
- ✅ **Issue Certificate** - Mint NFT on Hedera HTS
- ✅ **My Certificates** - View certificates you've issued or received
- ✅ **Certificate Detail** - View single certificate metadata

### 3. **Remove These Pages**
- ❌ Login/Signup (use wallet auth only)
- ❌ All role-based dashboards (admin, instructor, institution, candidate)
- ❌ User Management
- ❌ Institution Management
- ❌ Batch Issuance (can add later)
- ❌ Analytics Dashboard
- ❌ Billing
- ❌ Settings pages (except wallet settings)
- ❌ API Keys management
- ❌ Webhooks
- ❌ Invitations
- ❌ DID Setup (simplify to auto-create)
- ❌ 2FA, Email Verification

---

## 🔧 Technical Changes

### Phase 1: Remove Supabase Dependencies

**Files to Delete:**
```
src/integrations/supabase/
src/lib/auth-context.tsx (replace with wallet context)
src/lib/supabase-utils.ts
src/examples/hedera-supabase-integration.ts
src/hooks/useUserRole.ts
src/hooks/useRoleBasedNavigation.ts
src/hooks/useInstitutionStaff.ts
src/hooks/useUsers.ts
supabase/ (entire folder)
```

**Files to Keep & Modify:**
```
src/contexts/HederaWalletContext.tsx ✅ Keep
src/lib/hedera-transactions.ts ✅ Keep (remove Supabase logging)
src/lib/hedera-utils.ts ✅ Keep
src/lib/ipfs/service.ts ✅ Keep
src/hooks/useCertificates.ts ✅ Modify (use Hedera queries)
```

### Phase 2: Simplified Authentication

**Replace:**
```typescript
// OLD: Supabase Auth
const { user } = useAuth(); // Supabase user
await supabase.auth.signIn();

// NEW: Wallet Auth Only
const { accountId, isConnected } = useHederaWallet();
```

**New Auth Flow:**
1. User clicks "Connect Wallet"
2. Choose HashPack, Blade, or Kabila
3. Approve connection
4. **That's it!** No email, password, or signup.

### Phase 3: Certificate Storage Strategy

**Current (Supabase):**
- Certificate metadata → `certificate_cache` table
- User profiles → `profiles` table
- Audit logs → `audit_logs` table

**New (Blockchain + IPFS):**
- Certificate metadata → **IPFS (Pinata)**
- Certificate ownership → **Hedera HTS Token**
- Event logs → **Hedera HCS Topic** (optional)
- User identity → **Hedera Account ID + DID**

**Certificate Data Flow:**
```
1. User issues certificate
   ├─► Upload metadata to IPFS → Get CID
   ├─► Mint HTS token with metadata CID
   └─► Store token ID on-chain

2. Verify certificate
   ├─► Query Hedera for token by serial/ID
   ├─► Fetch metadata from IPFS using CID
   └─► Display certificate details
```

### Phase 4: Simplified Page Structure

**New Routing:**
```typescript
// Public Routes (No wallet required)
/                     → Home
/verify               → Verify Certificate
/verify/:tokenId      → Certificate Detail (public)
/about                → About
/pricing              → Pricing
/contact              → Contact
/docs                 → Documentation

// Wallet-Connected Routes
/issue                → Issue Certificate (requires wallet)
/my-certificates      → My Certificates (issued & received)
/certificate/:id      → Certificate Detail (owner view)

// Remove ALL role-based routes:
/admin/*              ❌ Delete
/instructor/*         ❌ Delete
/institution/*        ❌ Delete
/candidate/*          ❌ Delete
/dashboard            ❌ Delete
/settings/*           ❌ Delete (except wallet settings)
/auth/*               ❌ Delete
```

---

## 📦 Dependencies to Remove

```json
{
  "remove": [
    "@supabase/supabase-js",
    "@tanstack/react-query" (optional - only if used for Supabase)
  ],
  "keep": [
    "@hashgraph/sdk",
    "@hashgraph/hedera-wallet-connect",
    "@walletconnect/modal",
    "pinata-web3",
    "react-router-dom",
    "All @radix-ui components"
  ]
}
```

---

## 🚀 Implementation Steps

### Step 1: Backup Current State
```bash
git checkout -b pre-dapp-conversion
git push origin pre-dapp-conversion
```

### Step 2: Remove Supabase
```bash
# Delete Supabase folder
rm -rf supabase/

# Delete Supabase integration
rm -rf src/integrations/supabase/

# Delete Supabase utilities
rm src/lib/supabase-utils.ts
rm src/examples/hedera-supabase-integration.ts

# Delete auth context
rm src/lib/auth-context.tsx
```

### Step 3: Delete Unused Pages
```bash
# Delete auth pages
rm -rf src/pages/auth/

# Delete role-based pages
rm -rf src/pages/admin/
rm -rf src/pages/settings/
rm src/pages/Dashboard.tsx

# Delete complex dashboard features
rm src/pages/dashboard/Analytics.tsx
rm src/pages/dashboard/BatchIssue.tsx
rm src/pages/dashboard/BatchHistory.tsx
rm src/pages/dashboard/Billing.tsx
rm src/pages/dashboard/Institution.tsx
rm src/pages/dashboard/Issuers.tsx
rm src/pages/dashboard/Recipients.tsx
rm src/pages/dashboard/Templates.tsx
rm src/pages/dashboard/WebhookLogs.tsx
rm src/pages/DidSetup.tsx
rm src/pages/Claim.tsx
```

### Step 4: Update Remaining Pages

**Keep & Update:**
- `src/pages/Index.tsx` ✅ (remove Supabase, add wallet connect CTA)
- `src/pages/Verify.tsx` ✅ (query Hedera directly)
- `src/pages/VerifyDetail.tsx` ✅ (fetch from IPFS)
- `src/pages/About.tsx` ✅
- `src/pages/Pricing.tsx` ✅
- `src/pages/Contact.tsx` ✅ (store submissions in HCS topic)
- `src/pages/Docs.tsx` ✅
- `src/pages/dashboard/IssueCertificate.tsx` → Rename to `src/pages/IssueCertificate.tsx`
- `src/pages/dashboard/Certificates.tsx` → Rename to `src/pages/MyCertificates.tsx`
- `src/pages/dashboard/MyCertificates.tsx` ✅
- `src/pages/dashboard/CertificateDetail.tsx` ✅

### Step 5: Update Hooks

**Remove:**
```bash
rm src/hooks/useUserRole.ts
rm src/hooks/useRoleBasedNavigation.ts
rm src/hooks/useInstitutionStaff.ts
rm src/hooks/useUsers.ts
```

**Update:**
```bash
# Update useCertificates.ts to query Hedera/IPFS
# Remove all Supabase queries
```

### Step 6: Simplify Components

**Remove:**
```bash
rm src/components/DashboardLayout.tsx
rm src/components/DashboardSidebar.tsx
rm src/components/ProtectedRoute.tsx (replace with WalletProtectedRoute)
```

**Update:**
```bash
# Update PublicHeader.tsx
# - Remove "Login" link
# - Add "Connect Wallet" button
# - Show connected account ID
```

### Step 7: Update Environment Variables

**Remove from `.env`:**
```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_REDIRECT_URL=
```

**Keep:**
```bash
VITE_WALLETCONNECT_PROJECT_ID=
VITE_HEDERA_NETWORK=testnet
VITE_HCS_LOG_TOPIC_ID= (optional)
```

**Add:**
```bash
VITE_PINATA_JWT=
VITE_PINATA_GATEWAY=
VITE_TOKEN_ID= (your HTS token ID for certificates)
```

### Step 8: Update App.tsx Routing

```typescript
// Remove ALL protected routes
// Remove role-based routing
// Simplify to:
<Routes>
  {/* Public */}
  <Route path="/" element={<Index />} />
  <Route path="/verify" element={<Verify />} />
  <Route path="/verify/:tokenId" element={<VerifyDetail />} />
  <Route path="/about" element={<About />} />
  <Route path="/pricing" element={<Pricing />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/docs" element={<Docs />} />
  
  {/* Wallet-Connected */}
  <Route path="/issue" element={<WalletProtectedRoute><IssueCertificate /></WalletProtectedRoute>} />
  <Route path="/my-certificates" element={<WalletProtectedRoute><MyCertificates /></WalletProtectedRoute>} />
  <Route path="/certificate/:id" element={<WalletProtectedRoute><CertificateDetail /></WalletProtectedRoute>} />
  
  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## 🎨 New Component: WalletProtectedRoute

```typescript
import { Navigate } from 'react-router-dom';
import { useHederaWallet } from '@/contexts/HederaWalletContext';
import { Button } from '@/components/ui/button';

export function WalletProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accountId, isConnected, connectWallet } = useHederaWallet();

  if (!isConnected || !accountId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="mb-8">You need to connect a Hedera wallet to access this page.</p>
        <Button onClick={connectWallet} size="lg">
          Connect Wallet
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## 📝 New Certificate Issuance Flow

```typescript
// src/pages/IssueCertificate.tsx (simplified)

async function issueCertificate(formData: CertificateForm) {
  const { accountId, dAppConnector } = useHederaWallet();
  
  // 1. Upload metadata to IPFS
  const metadata = {
    name: formData.recipientName,
    description: formData.courseName,
    image: formData.imageUrl, // or upload image to IPFS
    issuer: accountId,
    issuedAt: new Date().toISOString(),
  };
  
  const ipfsResult = await ipfsService.uploadJSON(metadata);
  const metadataCID = ipfsResult.cid;
  
  // 2. Mint HTS NFT with metadata
  const tokenMintTx = await new TokenMintTransaction()
    .setTokenId(TOKEN_ID)
    .setMetadata([Buffer.from(metadataCID)])
    .freezeWith(client);
  
  const result = await signAndExecuteTransaction(
    dAppConnector,
    tokenMintTx,
    accountId
  );
  
  // 3. Transfer to recipient (optional)
  if (formData.recipientAccountId) {
    const transferTx = await new TransferTransaction()
      .addNftTransfer(TOKEN_ID, result.serialNumber, accountId, formData.recipientAccountId)
      .freezeWith(client);
    
    await signAndExecuteTransaction(dAppConnector, transferTx, accountId);
  }
  
  return {
    transactionId: result.transactionId,
    tokenId: TOKEN_ID,
    serialNumber: result.serialNumber,
    metadataCID,
  };
}
```

---

## 🔍 New Verification Flow

```typescript
// src/pages/Verify.tsx (simplified)

async function verifyCertificate(tokenId: string, serialNumber: string) {
  // 1. Query Hedera for token info
  const tokenInfo = await new TokenInfoQuery()
    .setTokenId(tokenId)
    .execute(client);
  
  const nftInfo = await new TokenNftInfoQuery()
    .setTokenId(tokenId)
    .setNftId(serialNumber)
    .execute(client);
  
  // 2. Get metadata CID from NFT
  const metadataCID = Buffer.from(nftInfo.metadata).toString();
  
  // 3. Fetch metadata from IPFS
  const metadata = await ipfsService.fetchJSON(metadataCID);
  
  // 4. Display certificate
  return {
    valid: true,
    tokenId,
    serialNumber,
    owner: nftInfo.accountId.toString(),
    metadata,
    mintedAt: nftInfo.creationTime,
  };
}
```

---

## 📊 Estimated Timeline

| Phase | Tasks | Time | Priority |
|-------|-------|------|----------|
| **Phase 1** | Remove Supabase files & dependencies | 1 hour | 🔴 Critical |
| **Phase 2** | Delete unused pages & components | 1 hour | 🔴 Critical |
| **Phase 3** | Update routing (App.tsx) | 30 min | 🔴 Critical |
| **Phase 4** | Create WalletProtectedRoute | 30 min | 🔴 Critical |
| **Phase 5** | Update IssueCertificate page | 2 hours | 🔴 Critical |
| **Phase 6** | Update Verify page | 1 hour | 🔴 Critical |
| **Phase 7** | Update MyCertificates page | 1 hour | 🟡 High |
| **Phase 8** | Update Header/Navigation | 30 min | 🟡 High |
| **Phase 9** | Testing & bug fixes | 2 hours | 🟡 High |
| **Phase 10** | Documentation update | 1 hour | 🟢 Medium |

**Total: ~10-12 hours** (1-2 days)

---

## ✅ Success Criteria

After conversion, you should have:

1. ✅ **No Supabase dependencies** - Zero database calls
2. ✅ **Wallet-only auth** - No email/password
3. ✅ **5-7 core pages** - Down from 30+ pages
4. ✅ **Working certificate issuance** - Mint NFTs on Hedera
5. ✅ **Working certificate verification** - Query Hedera + IPFS
6. ✅ **Clean, simple codebase** - Easy to understand and maintain
7. ✅ **Hackathon-ready** - Focused on core demo features

---

## 🎯 Next Steps

**Do you want me to:**
1. ✅ Start executing this plan step-by-step?
2. ✅ Create a new branch for the conversion?
3. ✅ Begin with Phase 1 (Remove Supabase)?

Let me know and I'll start the conversion! 🚀
