# Hedera Resilient Edge Functions

## Overview

All Hedera edge functions have been upgraded to use a **resilient architecture** that combines:

1. **DApp Connection** - Primary transaction execution through Hedera SDK
2. **Mirror Node Backup** - Automatic fallback for transaction logging during downtime
3. **Supabase Audit Trail** - Persistent storage of all transactions in `transaction_logs` table

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Edge Function                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐          ┌──────────────────┐                │
│  │   Execute    │   →      │   Direct Log     │                │
│  │  Transaction │          │   to Supabase    │                │
│  │   (Hedera)   │          │                  │                │
│  └──────────────┘          └──────────────────┘                │
│         │                           │                            │
│         │                           ↓                            │
│         │                    ┌──────────────┐                   │
│         │                    │  Log Failed? │                   │
│         │                    └──────────────┘                   │
│         │                           │                            │
│         │                           ↓                            │
│         │                    ┌──────────────────┐               │
│         └────────────────→   │  Mirror Node     │               │
│                              │  Backup Sync     │               │
│                              └──────────────────┘               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Updated Edge Functions

### 1. `hedera-create-did`
**Purpose:** Create decentralized identifiers on Hedera

**Resilient Features:**
- Topic creation with automatic logging
- DID document publication with mirror node backup
- Transaction confirmation from mirror node after delay

**Required Parameters:**
```json
{
  "userAccountId": "0.0.12345",
  "userId": "uuid-from-supabase",
  "network": "testnet",
  "createTopic": true,
  "storeDID": true
}
```

### 2. `hedera-hcs-log`
**Purpose:** Log events to Hedera Consensus Service

**Resilient Features:**
- Topic creation with transaction logging
- Message submission with mirror node backup
- **NEW:** Mirror node sync mode to fetch historical messages

**Required Parameters:**
```json
{
  "topicId": "0.0.67890",
  "message": { "event": "certificate_issued" },
  "userId": "uuid-from-supabase",
  "messageType": "event",
  "network": "testnet",
  "syncFromMirror": false
}
```

**Mirror Sync Mode:**
```json
{
  "topicId": "0.0.67890",
  "userId": "uuid-from-supabase",
  "network": "testnet",
  "syncFromMirror": true
}
```

### 3. `hedera-mint-certificate`
**Purpose:** Mint NFT certificates on Hedera

**Resilient Features:**
- NFT collection creation with logging
- NFT minting with mirror node verification
- Institution validation before minting

**Required Parameters:**
```json
{
  "recipientAccountId": "0.0.12345",
  "userId": "uuid-from-supabase",
  "metadataCid": "ipfs://...",
  "institutionTokenId": "0.0.11111",
  "institutionId": "uuid",
  "network": "testnet",
  "certificateData": {
    "institutionName": "University Name"
  }
}
```

### 4. `token-associate`
**Purpose:** Associate tokens with Hedera accounts

**Resilient Features:**
- Mirror node check for existing associations
- Token association with transaction logging
- Operator-paid association option

**Required Parameters:**
```json
{
  "accountId": "0.0.12345",
  "tokenId": "0.0.11111",
  "userId": "uuid-from-supabase",
  "network": "testnet",
  "privateKey": "optional-for-self-signing"
}
```

## Resilient Client API

### `executeResilientTransaction()`

Core function that handles resilient transaction execution:

```typescript
import { executeResilientTransaction } from '../_shared/hedera-resilient-client.ts';

const result = await executeResilientTransaction(
  supabase,           // Supabase client
  userId,             // User ID for logging
  'TRANSACTION_TYPE', // Type of transaction
  async () => {
    // Your transaction logic here
    const tx = await createTransaction();
    const response = await tx.execute(client);
    return response.transactionId.toString();
  },
  {
    network: 'testnet',
    enableMirrorBackup: true,
    mirrorBackupDelay: 5000
  }
);

// Result contains:
// - success: boolean
// - transactionId: string
// - error?: string
// - syncedFromMirror: boolean
```

## Mirror Node Integration

### Available Functions

1. **`getTransaction()`** - Fetch transaction details
2. **`getTopicMessages()`** - Fetch HCS topic messages
3. **`getAccountTransactions()`** - Fetch account transaction history
4. **`waitForTransaction()`** - Poll for transaction confirmation
5. **`syncTransactionFromMirrorNode()`** - Sync single transaction to Supabase
6. **`batchSyncTransactions()`** - Bulk sync for downtime recovery

### Example: Manual Sync

```typescript
import { syncTransactionFromMirrorNode } from '../_shared/hedera-mirror-node.ts';

await syncTransactionFromMirrorNode(
  supabase,
  '0.0.12345@1234567890.000000000', // Transaction ID
  userId,
  'TOKEN_MINT',
  'testnet'
);
```

## Transaction Logging

All transactions are logged to the `transaction_logs` table:

```sql
CREATE TABLE transaction_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  transaction_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'success', 'failed')),
  transaction_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Transaction Types

- `TOPIC_CREATE` - HCS topic creation
- `TOPIC_MESSAGE_SUBMIT` - HCS message submission
- `TOKEN_CREATE` - NFT collection creation
- `TOKEN_MINT` - NFT minting
- `TOKEN_ASSOCIATE` - Token association
- `CONSENSUS_SUBMIT_MESSAGE` - General consensus message
- `TOKEN_TRANSFER` - Token/NFT transfer

## Downtime Recovery

### Automatic Recovery

The resilient client automatically:
1. Detects direct logging failures
2. Waits for transaction to appear on mirror node (2-5 seconds delay)
3. Syncs transaction data from mirror node
4. Updates `transaction_logs` table

### Manual Recovery

For extended downtime, use the batch sync:

```typescript
import { batchSyncTransactions } from '../_shared/hedera-resilient-client.ts';

const result = await batchSyncTransactions(
  supabase,
  '0.0.12345',     // Account ID
  userId,
  '2024-01-01T00:00:00Z', // Since timestamp
  'testnet'
);

console.log(`Synced: ${result.synced}, Failed: ${result.failed}`);
```

### Retry Failed Transactions

```typescript
import { retryFailedTransactions } from '../_shared/hedera-resilient-client.ts';

const result = await retryFailedTransactions(
  supabase,
  'testnet',
  50  // Limit
);
```

## Health Monitoring

### Check Hedera Services

```typescript
import { checkHederaHealth } from '../_shared/hedera-resilient-client.ts';

const health = await checkHederaHealth('testnet');

console.log({
  mirrorNodeAvailable: health.mirrorNodeAvailable,
  mirrorNodeLatency: health.mirrorNodeLatency
});
```

## Response Format

All updated edge functions return:

```json
{
  "success": true,
  "transactionId": "0.0.12345@1234567890.000000000",
  "resilientLogging": true,
  "syncedFromMirror": false,
  "message": "Operation completed with resilient logging",
  ...additionalData
}
```

## Error Handling

### Graceful Degradation

1. **Transaction Succeeds, Logging Fails:**
   - Transaction is executed
   - Mirror node automatically syncs
   - Returns success with `syncedFromMirror: true`

2. **Transaction Fails:**
   - No transaction executed
   - No logging attempted
   - Returns error message

3. **Mirror Node Unavailable:**
   - Falls back to direct logging only
   - Transaction still succeeds
   - Warning logged

## Best Practices

### 1. Always Pass `userId`

```typescript
// ✅ Good
{ userId: user.id, ...params }

// ❌ Bad
{ ...params }  // Missing userId
```

### 2. Handle Mirror Sync Flag

```typescript
if (result.syncedFromMirror) {
  console.log('Transaction logged via mirror node backup');
}
```

### 3. Monitor Transaction Logs

```sql
-- Check for transactions that needed mirror backup
SELECT * FROM transaction_logs
WHERE metadata->>'synced_from_mirror' = 'true';

-- Check for failed transactions
SELECT * FROM transaction_logs
WHERE status = 'failed'
ORDER BY created_at DESC;
```

### 4. Set Up Periodic Sync Cron

Create a cron job to periodically retry failed transactions:

```typescript
// In a scheduled function
import { retryFailedTransactions } from '../_shared/hedera-resilient-client.ts';

// Run every hour
await retryFailedTransactions(supabase, 'testnet', 100);
```

## Migration Notes

### Breaking Changes

All edge functions now require `userId` parameter:

**Before:**
```json
{
  "accountId": "0.0.12345",
  "tokenId": "0.0.11111"
}
```

**After:**
```json
{
  "accountId": "0.0.12345",
  "tokenId": "0.0.11111",
  "userId": "uuid-from-auth"
}
```

### Backward Compatibility

Old function calls will fail with:
```json
{
  "success": false,
  "error": "userId is required for transaction logging"
}
```

## Testing

### Test Resilience

1. **Normal Operation:**
   ```bash
   # Call function normally
   curl -X POST https://your-project.supabase.co/functions/v1/hedera-mint-certificate \
     -H "Content-Type: application/json" \
     -d '{"userId": "...", "recipientAccountId": "0.0.12345", "metadataCid": "ipfs://..."}'
   ```

2. **Simulate Database Failure:**
   - Temporarily revoke database permissions
   - Transaction should still succeed with mirror backup

3. **Check Logs:**
   ```sql
   SELECT * FROM transaction_logs 
   WHERE user_id = 'your-user-id'
   ORDER BY created_at DESC
   LIMIT 10;
   ```

## Support

### Debugging

Enable verbose logging by checking edge function logs in Supabase dashboard.

### Common Issues

**Issue:** "Transaction not found on mirror node"
**Solution:** Mirror nodes have 2-5 second delay. Increase `mirrorBackupDelay`.

**Issue:** "userId is required"
**Solution:** Update frontend code to include `userId` in all edge function calls.

**Issue:** "Failed to sync from mirror node"
**Solution:** Check network connectivity and mirror node status.

## References

- [Hedera Mirror Node API](https://docs.hedera.com/hedera/sdks-and-apis/rest-api)
- [Hedera SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis/sdks)
- [Transaction Logs Schema](../supabase/migrations/20251031000000_create_transaction_logs.sql)
- [Resilient Client Source](../supabase/functions/_shared/hedera-resilient-client.ts)
- [Mirror Node Integration](../supabase/functions/_shared/hedera-mirror-node.ts)
