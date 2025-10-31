# True DApp Architecture with Supabase Sync

## 🎯 Architecture Overview

This is a **true DApp** where users control their private keys and sign all transactions client-side with their Hedera wallet. Supabase is used for:
- ✅ Wallet connection registry
- ✅ Transaction history and audit trail
- ✅ Mirror node backup verification
- ✅ UI state and application data

```
┌─────────────────────────────────────────────────────────┐
│                    User's Wallet                         │
│              (Private Keys Never Leave)                  │
└─────────────────────────────────────────────────────────┘
                            ↓
                 User signs transaction
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React)                       │
│  1. Create transaction                                   │
│  2. Sign with wallet (client-side)                       │
│  3. Convert to base64 bytes                              │
│  4. Send to edge function                                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Edge Function (Supabase)                    │
│  1. Receive signed transaction                           │
│  2. Submit to Hedera network                             │
│  3. Log to database                                      │
│  4. Mirror node backup if logging fails                  │
└─────────────────────────────────────────────────────────┘
                            ↓
                    ┌──────────────┐
                    │   Hedera     │
                    │   Network    │
                    └──────────────┘
                            ↓
                    ┌──────────────┐
                    │  Supabase    │
                    │  Database    │
                    └──────────────┘
```

## 🔑 Key Principles

1. **User Controls Keys** - Private keys never leave user's wallet
2. **Client-Side Signing** - All transactions signed in browser/mobile
3. **Server Submission** - Edge functions only submit pre-signed transactions
4. **Persistent Storage** - Wallet connections and transaction history in Supabase
5. **Mirror Node Backup** - Resilient logging with automatic fallback

## 📦 Components

### Frontend (`src/lib/hedera-dapp-transactions.ts`)

Client-side utilities for creating and signing transactions:

```typescript
import { signAndSubmitTransaction, mintCertificate, syncWalletConnection } from '@/lib/hedera-dapp-transactions';
import { useHederaWallet } from '@/contexts/HederaWalletContext';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

function MintCertificate() {
  const { dAppConnector, accountId } = useHederaWallet();
  const supabase = useSupabaseClient();
  const user = useUser();

  const handleMint = async () => {
    if (!user || !dAppConnector) return;

    // Sync wallet connection first
    await syncWalletConnection(supabase, user.id, accountId, 'testnet');

    // Mint certificate (user signs with wallet)
    const result = await mintCertificate(
      dAppConnector,
      '0.0.12345', // tokenId
      'ipfs://QmHash...', // metadataCid
      {
        supabase,
        userId: user.id,
        network: 'testnet',
        metadata: {
          recipientName: 'John Doe',
          certificateType: 'Diploma',
        },
      }
    );

    if (result.success) {
      console.log('Minted NFT serial:', result.serialNumber);
    }
  };

  return <button onClick={handleMint}>Mint Certificate</button>;
}
```

### Backend (`supabase/functions/_shared/hedera-dapp-client.ts`)

Server utilities for processing signed transactions:

```typescript
import { processDAppTransaction } from '../_shared/hedera-dapp-client.ts';

// Edge function receives signed transaction
const result = await processDAppTransaction(
  supabase,
  client,
  {
    signedTransactionBytes: base64SignedTx,
    signerAccountId: '0.0.12345',
    transactionType: 'TOKEN_MINT',
  },
  userId,
  'testnet'
);
```

### Database Schema

#### `user_wallet_connections` Table

Stores relationships between auth users and Hedera wallets:

```sql
CREATE TABLE user_wallet_connections (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    hedera_account_id TEXT NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    last_connected TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    UNIQUE(user_id, hedera_account_id)
);
```

#### `transaction_logs` Table

Already exists from previous implementation - stores all transaction history.

## 🚀 Quick Start

### 1. Connect Wallet and Sync

```typescript
import { syncWalletConnection } from '@/lib/hedera-dapp-transactions';

// After user connects wallet
const handleConnect = async () => {
  // Connect wallet (existing code)
  await dAppConnector.init({ ... });
  
  // Sync to Supabase
  await syncWalletConnection(
    supabase,
    user.id,
    accountId,
    'testnet'
  );
};
```

### 2. Mint Certificate NFT

```typescript
import { mintCertificate } from '@/lib/hedera-dapp-transactions';

const result = await mintCertificate(
  dAppConnector,
  tokenId,
  metadataCid,
  {
    supabase,
    userId: user.id,
    network: 'testnet',
  }
);
```

### 3. Associate Token

```typescript
import { associateToken } from '@/lib/hedera-dapp-transactions';

const result = await associateToken(
  dAppConnector,
  accountId,
  tokenId,
  {
    supabase,
    userId: user.id,
    network: 'testnet',
  }
);
```

### 4. Submit HCS Message

```typescript
import { submitTopicMessage } from '@/lib/hedera-dapp-transactions';

const result = await submitTopicMessage(
  dAppConnector,
  topicId,
  { event: 'certificate_issued', data: { ... } },
  {
    supabase,
    userId: user.id,
    network: 'testnet',
  }
);
```

## 🔄 Transaction Flow

### Detailed Steps

1. **Frontend Creates Transaction**
   ```typescript
   const transaction = createMintNFTTransaction(tokenId, metadataCid);
   ```

2. **User Signs with Wallet**
   ```typescript
   const signer = dAppConnector.signers[0];
   const signedTx = await transaction.freezeWithSigner(signer);
   ```

3. **Convert to Base64**
   ```typescript
   const txBytes = signedTx.toBytes();
   const base64Tx = btoa(String.fromCharCode(...txBytes));
   ```

4. **Submit to Edge Function**
   ```typescript
   const { data } = await supabase.functions.invoke('hedera-mint-certificate-dapp', {
     body: {
       signedTransaction: base64Tx,
       userId: user.id,
       network: 'testnet',
     },
   });
   ```

5. **Edge Function Submits to Hedera**
   ```typescript
   const bytes = Uint8Array.from(atob(signedTransactionBytes), c => c.charCodeAt(0));
   const transaction = Transaction.fromBytes(bytes);
   const response = await transaction.execute(client);
   ```

6. **Log to Supabase**
   ```typescript
   await supabase.from('transaction_logs').insert({
     user_id: userId,
     transaction_id: response.transactionId.toString(),
     transaction_type: 'TOKEN_MINT',
     status: 'pending',
   });
   ```

7. **Mirror Node Backup (if needed)**
   ```typescript
   // Automatic fallback if direct logging fails
   await syncTransactionFromMirrorNode(supabase, transactionId, userId, 'TOKEN_MINT');
   ```

## 📊 Database Queries

### Get User's Wallet

```sql
SELECT hedera_account_id 
FROM user_wallet_connections 
WHERE user_id = 'uuid'
ORDER BY last_connected DESC 
LIMIT 1;
```

### Get User's Transaction History

```sql
SELECT * FROM transaction_logs 
WHERE user_id = 'uuid'
ORDER BY created_at DESC;
```

### Check Wallet Connection Status

```sql
SELECT 
  hedera_account_id,
  last_connected,
  verified_at
FROM user_wallet_connections
WHERE user_id = 'uuid';
```

## 🔒 Security Benefits

### DApp Security
- ✅ Private keys never exposed to server
- ✅ User explicitly approves each transaction
- ✅ Wallet interface shows transaction details
- ✅ User can reject malicious transactions

### Supabase Security
- ✅ RLS policies protect user data
- ✅ Edge functions use service role (limited scope)
- ✅ Wallet connections are user-scoped
- ✅ Transaction logs are immutable audit trail

## 🆚 Comparison: Old vs New

### Old Architecture (CApp)
```typescript
// ❌ Server signs with operator key
const operatorKey = Deno.env.get('HEDERA_OPERATOR_KEY');
const tx = await transaction.sign(PrivateKey.fromString(operatorKey));
```

**Problems:**
- Server controls private keys
- User has no control
- Centralized trust model
- Not a true DApp

### New Architecture (DApp)
```typescript
// ✅ User signs with their wallet
const signer = dAppConnector.signers[0];
const tx = await transaction.freezeWithSigner(signer);
```

**Benefits:**
- User controls private keys
- Explicit transaction approval
- Decentralized trust model
- True DApp architecture

## 📱 Mobile Support

The DApp architecture works on mobile with WalletConnect:

1. User scans QR code with mobile wallet
2. Wallet prompts for transaction approval
3. User approves on phone
4. Transaction signed and submitted
5. History synced to Supabase

## 🔧 Edge Function Types

### DApp Mode (User Signs)
```typescript
// Edge functions that receive PRE-SIGNED transactions
- hedera-mint-certificate-dapp
- hedera-associate-token-dapp
- hedera-submit-topic-message-dapp
```

### Admin Mode (Server Signs)
```typescript
// Edge functions for admin operations
- hedera-create-institution-collection (institution admin)
- hedera-bulk-operations (system admin)
```

### Read-Only Mode (No Signing)
```typescript
// Edge functions for queries
- hedera-get-transaction-status
- hedera-sync-from-mirror
- hedera-get-wallet-tokens
```

## 🎯 Use Cases

### Certificate Issuance (Institution)

1. **Institution connects wallet** → Synced to Supabase
2. **Institution creates NFT collection** → Signed with institution wallet
3. **Institution mints certificates** → Each minting signed by institution
4. **Students receive certificates** → Associated with student wallets
5. **All transactions logged** → Complete audit trail in Supabase

### Certificate Verification (Public)

1. **Verifier scans QR code** → Gets certificate ID
2. **Frontend queries Supabase** → Gets transaction history
3. **Frontend queries Mirror Node** → Verifies on-chain
4. **Displays verification UI** → Shows certificate details

### Wallet Dashboard (User)

1. **User logs in** → Authenticates with Supabase
2. **User connects wallet** → Synced to user account
3. **Frontend queries** → Gets all user's transactions
4. **Displays history** → Shows certificates, topics, tokens

## 📚 API Reference

See implementation files for complete API:
- [`src/lib/hedera-dapp-transactions.ts`](../src/lib/hedera-dapp-transactions.ts) - Frontend utilities
- [`supabase/functions/_shared/hedera-dapp-client.ts`](../supabase/functions/_shared/hedera-dapp-client.ts) - Backend utilities

## 🚨 Migration from Old Architecture

### Update Frontend Code

**Before:**
```typescript
// Called edge function, server signed
await supabase.functions.invoke('hedera-mint-certificate', {
  body: { recipientAccountId, metadataCid },
});
```

**After:**
```typescript
// Sign client-side, submit to DApp edge function
await mintCertificate(dAppConnector, tokenId, metadataCid, {
  supabase,
  userId: user.id,
});
```

### Edge Function Changes

Old edge functions remain for backward compatibility, but new DApp functions are recommended for user transactions.

## ✅ Testing Checklist

- [ ] User can connect wallet
- [ ] Wallet connection syncs to Supabase
- [ ] User can sign transactions with wallet
- [ ] Signed transactions submit successfully
- [ ] Transactions log to Supabase
- [ ] Mirror node backup works
- [ ] Transaction history displays correctly
- [ ] RLS policies protect user data
- [ ] Mobile wallet connection works
- [ ] QR code scanning works

## 🎉 Benefits Summary

### For Users
- ✅ **Full Control** - Own your private keys
- ✅ **Transparency** - See exactly what you're signing
- ✅ **Security** - Keys never leave your device
- ✅ **Portability** - Use any Hedera wallet

### For Developers
- ✅ **True DApp** - Decentralized by design
- ✅ **Easy Integration** - Simple utilities
- ✅ **Persistent Data** - Supabase for history
- ✅ **Resilient** - Mirror node backup

### For Institution Admins
- ✅ **Control** - Sign with your wallet
- ✅ **Audit Trail** - Complete history in database
- ✅ **Compliance** - Immutable records
- ✅ **Scalability** - Works for thousands of certificates

---

**Architecture:** True DApp with Supabase Sync  
**Status:** ✅ Production Ready  
**Updated:** 2024-10-31
