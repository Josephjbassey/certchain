# Hedera Services Integration Guide

## Overview

This project integrates Hedera Hashgraph services for decentralized certificate issuance, verification, and management. The implementation uses Supabase Edge Functions to interact with Hedera's SDKs securely.

## Architecture

```
Frontend (React)
    ↓
Supabase Edge Functions
    ↓
Hedera Services (HTS, HCS, DID)
    ↓
Hedera Network (Testnet/Mainnet)
```

## Required Environment Variables

Configure these secrets in Supabase (already added):

- `HEDERA_OPERATOR_ID` - Your Hedera account ID (e.g., 0.0.xxxxx)
- `HEDERA_OPERATOR_KEY` - Your Hedera private key (DER format)
- `PINATA_JWT` - Pinata JWT token for IPFS uploads

## Edge Functions

### 1. `hedera-create-did`

Creates a Decentralized Identifier (DID) for a Hedera account.

**Endpoint**: `/functions/v1/hedera-create-did`

**Request**:
```json
{
  "userAccountId": "0.0.12345",
  "network": "testnet"
}
```

**Response**:
```json
{
  "success": true,
  "did": "did:hedera:testnet:0.0.12345",
  "accountId": "0.0.12345",
  "network": "testnet"
}
```

### 2. `hedera-mint-certificate`

Mints an NFT certificate using Hedera Token Service (HTS).

**Endpoint**: `/functions/v1/hedera-mint-certificate`

**Request**:
```json
{
  "recipientAccountId": "0.0.12345",
  "institutionTokenId": "0.0.67890",
  "metadataCid": "Qm...",
  "certificateData": {
    "courseName": "Blockchain Development",
    "institutionName": "CertChain University"
  },
  "network": "testnet"
}
```

**Response**:
```json
{
  "success": true,
  "tokenId": "0.0.67890",
  "serialNumber": 1,
  "transactionId": "0.0.12345@1234567890.123456789",
  "explorerUrl": "https://hashscan.io/testnet/transaction/...",
  "metadataCid": "Qm..."
}
```

### 3. `pinata-upload`

Uploads certificate metadata or files to IPFS via Pinata.

**Endpoint**: `/functions/v1/pinata-upload`

**Request (Metadata)**:
```json
{
  "type": "metadata",
  "certificateData": {
    "certificateId": "cert-123",
    "recipientEmail": "user@example.com",
    "courseName": "Blockchain Development",
    "issuerDid": "did:hedera:testnet:0.0.12345",
    "institutionId": "inst-456",
    "issuedAt": "2025-01-18T00:00:00Z",
    "skills": ["Solidity", "Smart Contracts"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "ipfsHash": "QmXxx...",
  "cid": "QmXxx...",
  "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmXxx..."
}
```

### 4. `hedera-hcs-log`

Logs events to Hedera Consensus Service (HCS).

**Endpoint**: `/functions/v1/hedera-hcs-log`

**Request**:
```json
{
  "topicId": "0.0.98765",
  "messageType": "certificate_issued",
  "message": {
    "certificateId": "cert-123",
    "action": "issued",
    "timestamp": "2025-01-18T00:00:00Z"
  },
  "network": "testnet"
}
```

**Response**:
```json
{
  "success": true,
  "topicId": "0.0.98765",
  "transactionId": "0.0.12345@1234567890.123456789",
  "sequenceNumber": "42",
  "explorerUrl": "https://hashscan.io/testnet/topic/0.0.98765"
}
```

## Integration Flow

### Certificate Issuance Flow

1. **Upload Metadata to IPFS**
   ```typescript
   const { data } = await supabase.functions.invoke('pinata-upload', {
     body: {
       type: 'metadata',
       certificateData: { /* certificate details */ }
     }
   });
   const metadataCid = data.cid;
   ```

2. **Mint Certificate NFT**
   ```typescript
   const { data } = await supabase.functions.invoke('hedera-mint-certificate', {
     body: {
       recipientAccountId: '0.0.12345',
       metadataCid,
       certificateData: { /* ... */ }
     }
   });
   ```

3. **Log Event to HCS**
   ```typescript
   await supabase.functions.invoke('hedera-hcs-log', {
     body: {
       topicId: institutionTopicId,
       messageType: 'certificate_issued',
       message: {
         certificateId,
         tokenId: data.tokenId,
         serialNumber: data.serialNumber
       }
     }
   });
   ```

### DID Creation Flow

1. **User connects Hedera wallet** (HashPack, Blade, etc.)
2. **Get user's account ID** from wallet
3. **Create DID**:
   ```typescript
   const { data } = await supabase.functions.invoke('hedera-create-did', {
     body: {
       userAccountId: '0.0.12345',
       network: 'testnet'
     }
   });
   ```

## Wallet Integration

The project supports Hedera wallet connections using:
- **HashPack**
- **Blade Wallet**
- **WalletConnect** (via @hashgraph/hedera-wallet-connect)

### Example Connection Code

```typescript
import { HederaWalletConnect } from '@hashgraph/hedera-wallet-connect';

const walletConnect = new HederaWalletConnect({
  network: 'testnet',
  appMetadata: {
    name: 'CertChain',
    description: 'Decentralized Certificate Platform',
    url: window.location.origin,
    icons: ['/icon.png']
  }
});

await walletConnect.connect();
const accountId = walletConnect.getAccountId();
```

## Testing

### Testnet Setup

1. Create a testnet account at https://portal.hedera.com
2. Get testnet HBAR from the faucet
3. Configure operator credentials in Supabase secrets
4. Use `network: 'testnet'` in all function calls

### Explorer

Monitor your transactions at:
- **Testnet**: https://hashscan.io/testnet
- **Mainnet**: https://hashscan.io/mainnet

## Production Checklist

- [ ] Switch to mainnet operator credentials
- [ ] Update all `network` parameters to 'mainnet'
- [ ] Ensure sufficient HBAR balance in operator account
- [ ] Set up monitoring for transaction failures
- [ ] Implement retry logic for network errors
- [ ] Add proper error handling and user notifications
- [ ] Test certificate minting flow end-to-end
- [ ] Verify IPFS metadata accessibility
- [ ] Set up HCS topic for production logging

## Security Considerations

- **Never expose operator keys** - keep in Supabase secrets only
- **Validate all inputs** - implement Zod schemas in edge functions
- **Rate limiting** - implement on edge functions
- **Access control** - use RLS policies to restrict function calls
- **Transaction monitoring** - log all blockchain transactions
- **IPFS pinning** - ensure metadata is properly pinned

## Cost Estimation

### Testnet (Free)
- Account creation: Free via portal
- Transactions: Free testnet HBAR

### Mainnet
- NFT minting: ~$0.01 USD per certificate
- HCS messages: ~$0.0001 USD per message
- Account association: ~$0.05 USD one-time
- IPFS storage (Pinata): Free tier up to 1GB

## Support

- **Hedera Docs**: https://docs.hedera.com
- **Pinata Docs**: https://docs.pinata.cloud
- **Hedera Discord**: https://hedera.com/discord
- **CertChain Issues**: GitHub repository

## Next Steps

1. Test DID creation on testnet
2. Create institution NFT collections
3. Test certificate minting flow
4. Set up HCS topics for event logging
5. Implement real-time HCS event streaming (WebSocket)
6. Add wallet connection UI components
7. Deploy smart contracts (optional EVM contracts)
8. Implement claim token flow
