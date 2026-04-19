# Hedera Smart Contracts for CertChain

This directory contains the Smart Contracts required to run CertChain as a 100% decentralized Pure dApp without a Supabase backend.

## Prerequisites & Environment Variables

To deploy these contracts to the Hedera Testnet, you must have an active Hedera Testnet account (ECDSA preferred for EVM compatibility). You can create one for free at the [Hedera Developer Portal](https://portal.hedera.com/).

Ensure your `.env` file (at the root of the repository) contains the following variable:

```env
VITE_HEDERA_OPERATOR_KEY=0x<your_ecdsa_private_key>
```
*Note: Hardhat requires your private key to be in Hex format (starting with `0x`) for EVM signing.*

## How to Deploy

1. Ensure your `.env` is properly configured.
2. From this `contracts/` directory, run:
   ```bash
   npx hardhat run scripts/deploy.ts --network hederaTestnet
   ```

## Contract Overview
- **CertChainRegistry.sol**: Manages Role-Based Access Control (RBAC) securely on the ledger, replacing the Postgres `user_roles` database table.
- **CertChainFactory.sol**: Acts as the verified proxy to issue Hedera Token Service (HTS) NFTs representing certificates, replacing the Supabase Deno Edge Functions.
