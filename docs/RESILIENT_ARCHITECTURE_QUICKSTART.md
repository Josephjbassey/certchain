# Hedera Resilient Architecture - Quick Reference

## 🎯 What Changed?

All Hedera edge functions now have **automatic backup** to Mirror Node when Supabase is unavailable.

## 🚀 Quick Start

### Before (Old Code)

```typescript
const response = await supabase.functions.invoke("hedera-mint-certificate", {
  body: {
    recipientAccountId: "0.0.12345",
    metadataCid: "ipfs://...",
  },
});
```

### After (New Code)

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();

const response = await supabase.functions.invoke("hedera-mint-certificate", {
  body: {
    userId: user.id, // ← ADD THIS LINE
    recipientAccountId: "0.0.12345",
    metadataCid: "ipfs://...",
  },
});
```

## 📋 Required Parameter

**All Hedera edge functions now require:**

- `userId` - UUID from authenticated user

Get it from:

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();
const userId = user.id;
```

## 🔧 Updated Functions

| Function                  | Required Params                               | New Feature                    |
| ------------------------- | --------------------------------------------- | ------------------------------ |
| `hedera-create-did`       | `userAccountId`, `userId`                     | Mirror backup for DID creation |
| `hedera-hcs-log`          | `topicId`, `message`, `userId`                | Mirror sync mode               |
| `hedera-mint-certificate` | `recipientAccountId`, `metadataCid`, `userId` | NFT minting backup             |
| `token-associate`         | `accountId`, `tokenId`, `userId`              | Association logging            |

## 📊 New Response Format

```json
{
  "success": true,
  "transactionId": "0.0.12345@1234567890.000000000",
  "resilientLogging": true,
  "syncedFromMirror": false,
  ...
}
```

**Fields:**

- `resilientLogging` - Always `true` (feature enabled)
- `syncedFromMirror` - `true` if backup was used

## 🔍 Check Transaction Logs

```sql
-- View recent transactions
SELECT * FROM transaction_logs
ORDER BY created_at DESC
LIMIT 10;

-- Check which used backup
SELECT * FROM transaction_logs
WHERE metadata->>'synced_from_mirror' = 'true';
```

## 💾 What Gets Logged?

Every Hedera transaction creates a record:

```sql
{
  user_id: UUID,
  transaction_id: "0.0.12345@...",
  transaction_type: "TOKEN_MINT",
  status: "success",
  transaction_hash: "0x...",
  metadata: { ... }
}
```

## 🏥 Health Check

```typescript
import { checkHederaHealth } from "./supabase/functions/_shared/hedera-resilient-client.ts";

const health = await checkHederaHealth("testnet");
console.log(health.mirrorNodeAvailable);
```

## 🔄 Recovery After Outage

```typescript
import { retryFailedTransactions } from "./supabase/functions/_shared/hedera-resilient-client.ts";

// Retry failed transactions
const result = await retryFailedTransactions(
  supabase,
  "testnet",
  50 // limit
);

console.log(`Recovered: ${result.synced} transactions`);
```

## 📖 Full Documentation

See detailed guides:

- [`HEDERA_RESILIENT_EDGE_FUNCTIONS.md`](./HEDERA_RESILIENT_EDGE_FUNCTIONS.md) - Complete API reference
- [`RESILIENT_ARCHITECTURE_COMPLETE.md`](./RESILIENT_ARCHITECTURE_COMPLETE.md) - Implementation details
- [`HEDERA_SUPABASE_INTEGRATION.md`](./HEDERA_SUPABASE_INTEGRATION.md) - DApp + CApp architecture

## ⚠️ Migration Checklist

- [ ] Update all `hedera-create-did` calls to include `userId`
- [ ] Update all `hedera-hcs-log` calls to include `userId`
- [ ] Update all `hedera-mint-certificate` calls to include `userId`
- [ ] Update all `token-associate` calls to include `userId`
- [ ] Test error handling with new response format
- [ ] Set up monitoring for `syncedFromMirror` flag
- [ ] Create cron job for periodic `retryFailedTransactions()`

## 🎉 Benefits

✅ **Zero Data Loss** - Transactions logged even if Supabase is down  
✅ **Automatic Backup** - Mirror Node syncs transparently  
✅ **Complete Audit Trail** - All transactions in database  
✅ **Graceful Degradation** - No user-facing errors  
✅ **Easy Recovery** - Built-in downtime recovery tools

## 🚨 Error Messages

**"userId is required for transaction logging"**

- Solution: Add `userId: user.id` to request body

**"Transaction not found on mirror node"**

- Normal: Mirror nodes have 2-5 second delay
- Solution: Wait and retry, or increase `mirrorBackupDelay`

**"Failed to sync from mirror node"**

- Check: Network connectivity
- Check: Mirror node status (testnet.mirrornode.hedera.com)

## 📞 Support

Questions? Check the comprehensive guides in `/docs`:

- Architecture diagrams
- API examples
- Testing procedures
- Troubleshooting guide

---

**Updated:** 2024-11-01  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
