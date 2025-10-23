# 🎉 Hedera Resources Deployment - Complete

## ✅ Successfully Deployed

### 1. HTS NFT Collection Token

**Purpose**: This token collection is used to mint certificate NFTs. Each certificate issued will be an NFT in this collection.

| Property | Value |
|----------|-------|
| **Token ID** | `0.0.7115182` |
| **Name** | CertChain Certificates |
| **Symbol** | CERT |
| **Type** | Non-Fungible Unique (NFT) |
| **Supply Type** | Infinite |
| **Treasury** | 0.0.6834167 (your operator account) |
| **Network** | Testnet |

**Explorer**: https://hashscan.io/testnet/token/0.0.7115182

**What You Can Do**:
- Mint new certificate NFTs
- Transfer certificates to recipients
- View all minted certificates in the collection
- Track certificate ownership on-chain

### 2. HCS Topic for Event Logging

**Purpose**: This topic is used to log immutable events related to certificate lifecycle (issued, claimed, revoked, etc.).

| Property | Value |
|----------|-------|
| **Topic ID** | `0.0.7115183` |
| **Memo** | CertChain Certificate Events |
| **Admin Key** | Set (operator controlled) |
| **Submit Key** | Set (operator controlled) |
| **Network** | Testnet |

**Explorer**: https://hashscan.io/testnet/topic/0.0.7115183

**What You Can Do**:
- Log certificate issuance events
- Log certificate claims
- Log revocations
- Create audit trail
- Query event history

## 📝 Configuration Updated

The following has been added to your `.env` file:

```env
VITE_HCS_LOG_TOPIC_ID=0.0.7115183
VITE_COLLECTION_TOKEN_ID=0.0.7115182
```

## 🗄️ Database Update Required

You need to update your institution records in Supabase with these IDs:

```sql
-- Update your institution record
UPDATE institutions
SET
  collection_token_id = '0.0.7115182',
  hcs_topic_id = '0.0.7115183'
WHERE id = 'your-institution-id';

-- Or if you don't have an institution yet, insert one
INSERT INTO institutions (
  id,
  name,
  domain,
  hedera_account_id,
  treasury_account_id,
  collection_token_id,
  did,
  hcs_topic_id,
  admin_user_id,
  verified,
  status
) VALUES (
  gen_random_uuid(),
  'Your Institution Name',
  'yourdomain.com',
  '0.0.6834167',
  '0.0.6834167',
  '0.0.7115182',
  'did:hedera:testnet:0.0.6834167',
  '0.0.7115183',
  'your-user-id',
  true,
  'active'
);
```

## 🚀 How to Use

### Minting Certificates

Now that you have a collection token, you can mint certificates using the REST API approach:

```typescript
// 1. Upload metadata to IPFS
const { data: uploadResult } = await supabase.functions.invoke('pinata-upload', {
  body: {
    type: 'metadata',
    certificateData: {
      certificateId: 'cert-123',
      courseName: 'Blockchain Development',
      institutionName: 'Tech University',
      issuerDid: 'did:hedera:testnet:0.0.6834167',
      recipientEmail: 'student@example.com',
      institutionId: 'inst-456',
      issuedAt: new Date().toISOString(),
    }
  }
});

// 2. Mint NFT using Hedera REST API
// (You'll need to implement this using REST API - see DEPLOYMENT_RESULTS.md)

// 3. Log event to HCS
// (Also needs REST API implementation)
```

### Logging Events to HCS

```typescript
// Log certificate issuance
const event = {
  eventType: 'certificate_issued',
  certificateId: 'cert-123',
  tokenId: '0.0.7115182',
  serialNumber: 1,
  recipientAccountId: '0.0.123456',
  timestamp: new Date().toISOString()
};

// Submit to HCS topic 0.0.7115183
// (Needs REST API implementation)
```

## 📊 Token Economics

### Costs on Testnet (FREE)
- All operations are free on testnet
- Get testnet HBAR from: https://portal.hedera.com

### Costs on Mainnet (When you migrate)
- **Token Creation**: ~$1 USD (one-time)
- **Topic Creation**: ~$0.01 USD (one-time)
- **NFT Minting**: ~$0.01 USD per certificate
- **HCS Message**: ~$0.0001 USD per event
- **NFT Transfer**: ~$0.01 USD per transfer

Your operator account (0.0.6834167) will be charged for all these operations.

## 🔄 Certificate Lifecycle

With these resources deployed, here's how a certificate flows through your system:

1. **Institution Admin** issues certificate via dashboard
2. **Metadata** uploaded to IPFS (pinata-upload function)
3. **NFT minted** from collection 0.0.7115182 (needs REST API)
4. **Event logged** to topic 0.0.7115183 (needs REST API)
5. **Certificate transferred** to recipient's Hedera account
6. **Claim logged** to HCS topic
7. **Recipient** verifies ownership via wallet

## 🔍 Monitoring & Verification

### View Your Token Collection
https://hashscan.io/testnet/token/0.0.7115182

Here you can see:
- Total NFTs minted
- Current holders
- Transaction history
- Token metadata

### View Your HCS Topic
https://hashscan.io/testnet/topic/0.0.7115183

Here you can see:
- All messages submitted
- Sequence numbers
- Timestamps
- Message content

### Query via Mirror Node

```bash
# Get token info
curl https://testnet.mirrornode.hedera.com/api/v1/tokens/0.0.7115182

# Get topic messages
curl https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.7115183/messages

# Get NFTs in collection
curl https://testnet.mirrornode.hedera.com/api/v1/tokens/0.0.7115182/nfts
```

## 🔐 Security Notes

### Token Control
- **Supply Key**: Controlled by your operator account
- **Admin Key**: Controlled by your operator account
- Only you can mint new certificates
- Only you can update token properties

### Topic Control
- **Admin Key**: Controlled by your operator account
- **Submit Key**: Controlled by your operator account
- Only you can submit messages
- Messages are immutable once submitted

### Best Practices
1. **Never share** your operator private key
2. **Backup** your operator account credentials
3. **Monitor** your HBAR balance
4. **Test** on testnet before mainnet
5. **Rotate** keys periodically (advanced)

## 📚 Next Steps

### Immediate
1. ✅ Resources deployed
2. ✅ Environment variables updated
3. ⏳ Update institution record in database
4. ⏳ Implement REST API functions for minting
5. ⏳ Implement REST API functions for HCS logging

### Short Term
1. Test certificate minting flow
2. Test HCS event logging
3. Verify certificates on Hashscan
4. Set up monitoring/alerts
5. Document certificate issuance process

### Long Term
1. Migrate to mainnet
2. Implement certificate templates
3. Add batch minting
4. Set up WebSocket for HCS streaming
5. Implement advanced features (revocation, renewal)

## 🆘 Troubleshooting

### Issue: Need to mint more certificates
**Solution**: Use your collection token ID (0.0.7115182) with the REST API

### Issue: Need to log events
**Solution**: Use your topic ID (0.0.7115183) with the HCS REST API

### Issue: Out of HBAR
**Solution**: For testnet, get more from https://portal.hedera.com
For mainnet, purchase HBAR and transfer to 0.0.6834167

### Issue: Want to create additional collections
**Solution**: Run `node scripts/create-nft-collection.cjs` again
Each institution can have multiple collections

### Issue: Want to create additional topics
**Solution**: Run `node scripts/create-hcs-topic.cjs` again
You can have topics for different event types

## 📖 Resources

- **Hedera Token Service Docs**: https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service
- **Hedera Consensus Service Docs**: https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service
- **Mirror Node API**: https://docs.hedera.com/hedera/sdks-and-apis/rest-api
- **Hashscan Explorer**: https://hashscan.io/testnet
- **Your Token**: https://hashscan.io/testnet/token/0.0.7115182
- **Your Topic**: https://hashscan.io/testnet/topic/0.0.7115183

## ✨ Summary

You now have:
- ✅ NFT collection for minting certificates
- ✅ HCS topic for event logging
- ✅ Environment variables configured
- ✅ Immutable blockchain infrastructure
- ✅ Ready for certificate issuance

Your CertChain infrastructure is deployed and ready to use! 🚀
