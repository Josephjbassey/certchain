# Hedera DApp + Supabase Backend Integration Guide

This project combines **Hedera blockchain** (decentralized ledger) with **Supabase** (centralized database) to create a hybrid architecture that leverages the best of both worlds.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │ DApp Features    │         │ Traditional App  │        │
│  │ (Blockchain)     │         │ (Database)       │        │
│  └────────┬─────────┘         └────────┬─────────┘        │
└───────────┼──────────────────────────────┼─────────────────┘
            │                              │
            ↓                              ↓
┌───────────────────────┐      ┌────────────────────────┐
│   Hedera Network      │      │   Supabase Backend     │
│                       │      │                        │
│ • Topics (Messages)   │      │ • PostgreSQL DB        │
│ • NFTs (Certificates) │      │ • Auth & Users         │
│ • Smart Contracts     │      │ • File Storage         │
│ • Consensus Service   │      │ • Real-time Updates    │
└───────────────────────┘      └────────────────────────┘
        ↓                                  ↓
   Immutable                         Queryable
   Transparent                       Fast Access
   Verifiable                        Relational
```

## Key Components

### 1. HederaWalletContext (`src/contexts/HederaWalletContext.tsx`)

Manages wallet connections using the official `@hashgraph/hedera-wallet-connect` library.

**Features:**
- DAppConnector initialization
- Wallet connection (HashPack, Blade, Kabila)
- Session management
- Account ID tracking
- Network configuration

**Usage:**
```typescript
import { useHederaWallet } from '@/contexts/HederaWalletContext';

function MyComponent() {
  const { dAppConnector, accountId, isConnected, connect } = useHederaWallet();
  
  const handleConnect = async () => {
    await connect(); // Opens wallet modal
  };
}
```

### 2. Hedera Transaction Utilities (`src/lib/hedera-transactions.ts`)

Helper functions that bridge Hedera blockchain operations with Supabase logging.

**Key Functions:**

#### `signAndExecuteTransaction`
Signs and executes a transaction, then logs it to Supabase.

```typescript
import { signAndExecuteTransaction } from '@/lib/hedera-transactions';
import { TopicCreateTransaction } from '@hashgraph/sdk';

const result = await signAndExecuteTransaction(
  dAppConnector,
  new TopicCreateTransaction().setTopicMemo('My Topic'),
  accountId,
  'TOPIC_CREATE',
  { purpose: 'certificate' } // metadata
);
```

#### `signTransaction`
Signs a transaction without executing (useful for batch operations).

```typescript
const signedTx = await signTransaction(dAppConnector, transaction, accountId);
```

#### `executeQuery`
Executes a query on Hedera (e.g., get account balance).

```typescript
import { AccountBalanceQuery } from '@hashgraph/sdk';

const balance = await executeQuery(
  dAppConnector,
  new AccountBalanceQuery().setAccountId(accountId),
  accountId
);
```

### 3. Integration Examples (`src/examples/hedera-supabase-integration.ts`)

Real-world examples showing how to:
- Issue certificates on Hedera + store metadata in Supabase
- Submit messages to Hedera topics
- Verify certificate authenticity
- Batch operations
- Sync wallet connections

## Data Flow Patterns

### Pattern 1: Certificate Issuance

```
1. User clicks "Issue Certificate"
   ↓
2. Frontend creates Hedera Topic Transaction
   ↓
3. DAppConnector opens wallet modal
   ↓
4. User signs transaction in wallet (HashPack/Blade)
   ↓
5. Transaction executes on Hedera → get transaction ID
   ↓
6. Save certificate metadata to Supabase:
   - certificate ID
   - recipient info
   - Hedera topic ID
   - transaction hash
   ↓
7. Return success to user
```

**Why both?**
- **Hedera**: Immutable proof that certificate was issued
- **Supabase**: Fast queries, user management, relationships

### Pattern 2: Certificate Verification

```
1. User enters certificate ID
   ↓
2. Query Supabase for certificate metadata
   ↓
3. Extract Hedera topic ID
   ↓
4. Query Hedera network for topic messages
   ↓
5. Compare hashes
   ↓
6. Return verification status
```

**Benefit**: Combines speed of database queries with blockchain immutability.

### Pattern 3: Wallet Connection with Profile Sync

```
1. User connects wallet via DAppConnector
   ↓
2. Wallet returns account ID (e.g., "0.0.12345")
   ↓
3. Save wallet to Supabase user_wallets table:
   - user_id (from Supabase Auth)
   - account_id (from Hedera)
   - wallet_type (HashPack/Blade)
   - is_primary flag
   ↓
4. User can now use both:
   - Traditional login (email/password)
   - Wallet login (Web3 style)
```

## Database Schema

### `user_wallets` Table
Stores connected Hedera wallets for each user.

```sql
CREATE TABLE user_wallets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  account_id TEXT NOT NULL, -- Hedera account ID
  wallet_type TEXT, -- 'hashpack', 'blade', 'kabila'
  is_primary BOOLEAN DEFAULT false,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);
```

### `transaction_logs` Table
Audit trail for all blockchain transactions.

```sql
CREATE TABLE transaction_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  transaction_id TEXT NOT NULL, -- Hedera TX ID
  transaction_type TEXT NOT NULL, -- 'TOPIC_CREATE', 'NFT_MINT'
  status TEXT CHECK (status IN ('pending', 'success', 'failed')),
  transaction_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `certificates` Table
Certificate metadata with blockchain references.

```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  recipient_email TEXT,
  title TEXT,
  description TEXT,
  topic_id TEXT, -- Hedera topic ID
  transaction_hash TEXT, -- Blockchain proof
  status TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Environment Variables

Required environment variables:

```env
# Hedera Configuration
VITE_HEDERA_NETWORK=testnet  # or 'mainnet'
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Transaction Flow Example

Here's a complete flow for issuing a certificate:

```typescript
import { TopicCreateTransaction, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { useHederaWallet } from '@/contexts/HederaWalletContext';
import { signAndExecuteTransaction } from '@/lib/hedera-transactions';
import { supabase } from '@/integrations/supabase/client';

async function issueCertificate(recipientEmail: string, data: any) {
  const { dAppConnector, accountId } = useHederaWallet();
  
  // 1. Create Hedera topic (immutable ledger)
  const topicTx = new TopicCreateTransaction()
    .setTopicMemo('Certificate: ' + data.title);
    
  const topicResult = await signAndExecuteTransaction(
    dAppConnector,
    topicTx,
    accountId!,
    'TOPIC_CREATE',
    { recipient: recipientEmail }
  );
  
  // 2. Submit certificate data to topic
  const message = JSON.stringify({
    certificateId: data.id,
    issuer: accountId,
    recipient: recipientEmail,
    timestamp: new Date().toISOString()
  });
  
  const messageTx = new TopicMessageSubmitTransaction()
    .setTopicId(topicResult.transactionId)
    .setMessage(message);
    
  await signAndExecuteTransaction(
    dAppConnector,
    messageTx,
    accountId!,
    'TOPIC_MESSAGE',
    { topicId: topicResult.transactionId }
  );
  
  // 3. Save to Supabase for fast queries
  const { data: certificate } = await supabase
    .from('certificates')
    .insert({
      recipient_email: recipientEmail,
      title: data.title,
      description: data.description,
      topic_id: topicResult.transactionId,
      transaction_hash: topicResult.transactionHash,
      status: 'issued'
    })
    .select()
    .single();
    
  return certificate;
}
```

## Best Practices

### 1. **Use Hedera for**:
- Immutable records (certificates, credentials)
- Proof of existence (timestamps, hashes)
- NFTs and tokens
- Smart contract execution
- Consensus and verification

### 2. **Use Supabase for**:
- User authentication and profiles
- Fast queries and searches
- Relationships between entities
- Real-time updates
- File storage (images, PDFs)
- Analytics and reporting

### 3. **Sync Pattern**:
Always save Hedera transaction IDs in Supabase:

```typescript
// ✅ Good: Link blockchain to database
const { data } = await supabase
  .from('certificates')
  .insert({
    ...certificateData,
    hedera_topic_id: result.transactionId,  // Link to blockchain
    hedera_tx_hash: result.transactionHash
  });

// ❌ Bad: Orphaned blockchain transaction
await signAndExecuteTransaction(...);
// No record in database
```

### 4. **Error Handling**:
Handle both blockchain and database errors:

```typescript
try {
  const txResult = await signAndExecuteTransaction(...);
  
  try {
    await supabase.from('table').insert({...});
  } catch (dbError) {
    // Blockchain succeeded but DB failed
    // Log for manual reconciliation
    console.error('DB insert failed after successful TX:', txResult.transactionId);
  }
} catch (txError) {
  // Blockchain transaction failed
  // No DB insert needed
}
```

## Testing

### Test Wallet Connection:
```typescript
import { useHederaWallet } from '@/contexts/HederaWalletContext';

const { connect, isConnected, accountId } = useHederaWallet();

// Connect wallet
await connect();

// Check connection
console.log('Connected:', isConnected);
console.log('Account:', accountId);
```

### Test Transaction:
```typescript
import { TopicCreateTransaction } from '@hashgraph/sdk';

const tx = new TopicCreateTransaction()
  .setTopicMemo('Test Topic');

const result = await signAndExecuteTransaction(
  dAppConnector,
  tx,
  accountId,
  'TOPIC_CREATE'
);

console.log('Transaction ID:', result.transactionId);
```

## Troubleshooting

### Wallet Not Connecting
- Ensure WalletConnect Project ID is set in `.env`
- Check that wallet extension is installed
- Try different wallet (HashPack vs Blade)

### Transaction Failing
- Check account has sufficient HBAR balance
- Verify network (testnet vs mainnet)
- Check transaction parameters

### Database Errors
- Verify Supabase credentials
- Check RLS policies
- Ensure user is authenticated

## Resources

- [Hedera Documentation](https://docs.hedera.com/)
- [Hedera Wallet Connect](https://github.com/hashgraph/hedera-wallet-connect)
- [Supabase Documentation](https://supabase.com/docs)
- [HIP-30: Account Identifiers](https://hips.hedera.com/hip/hip-30)
- [HIP-820: Wallet Standard](https://hips.hedera.com/hip/hip-820)
