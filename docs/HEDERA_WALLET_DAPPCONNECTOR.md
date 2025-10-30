# Hedera Wallet Integration - Using DAppConnector

## Overview

This project now uses the official **`@hashgraph/hedera-wallet-connect`** package with the **DAppConnector** approach as recommended by Hedera. This follows the exact implementation patterns from the [official Hedera WalletConnect repository](https://github.com/hashgraph/hedera-wallet-connect).

## Why the Change?

The previous implementation used `@reown/appkit` which:
- Is not the officially recommended approach by Hedera
- May have compatibility issues with Hedera-specific features
- Doesn't follow the latest WalletConnect standards for Hedera

The new implementation uses:
- `@hashgraph/hedera-wallet-connect` v2.0.3 (official Hedera package)
- `@walletconnect/modal` v2.7.0 (official WalletConnect modal)
- Follows exact patterns from official Hedera examples

## Supported Wallets

All wallets that support WalletConnect on Hedera:
- 🔷 **HashPack** - Most popular Hedera wallet
- ⚔️ **Blade Wallet** - Feature-rich wallet
- 🌟 **Kabila Wallet** - Mobile-first wallet
- Any other Hedera WalletConnect-compatible wallet

## Implementation Details

### 1. HederaWalletContext

Located at `src/contexts/HederaWalletContext.tsx`

```typescript
import { DAppConnector, HederaSessionEvent, HederaJsonRpcMethod } from '@hashgraph/hedera-wallet-connect';

// Initialize with metadata and network
const dAppConnector = new DAppConnector(
  metadata,
  ledgerId,
  projectId,
  Object.values(HederaJsonRpcMethod),
  [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
  [HederaChainId.Testnet]
);

await dAppConnector.init({ logger: 'error' });
```

### 2. Usage in Components

```typescript
import { useHederaWallet } from '@/contexts/HederaWalletContext';

function MyComponent() {
  const { connect, disconnect, accountId, isConnected, dAppConnector } = useHederaWallet();

  const handleConnect = async () => {
    await connect(); // Opens WalletConnect modal
  };

  return (
    <div>
      {isConnected ? (
        <p>Connected: {accountId}</p>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### 3. Signing Transactions

```typescript
import { TransferTransaction, AccountId, Hbar } from '@hashgraph/sdk';

// Get signer from DAppConnector
const signer = dAppConnector.getSigner(AccountId.fromString(accountId));

// Create and sign transaction
const transaction = await new TransferTransaction()
  .addHbarTransfer(fromAccount, Hbar.fromTinybars(-100))
  .addHbarTransfer(toAccount, Hbar.fromTinybars(100))
  .freezeWithSigner(signer);

// Execute transaction
const response = await transaction.executeWithSigner(signer);

// Get receipt
const receipt = await response.getReceiptWithSigner(signer);
```

## Environment Variables Required

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
VITE_HEDERA_NETWORK=testnet
```

Get your WalletConnect Project ID from: https://cloud.walletconnect.com/

## Migration Notes

### Removed Packages
- ❌ `@reown/appkit`
- ❌ `@reown/appkit-adapter-wagmi`

### Added Packages
- ✅ `@walletconnect/modal` (already had `@hashgraph/hedera-wallet-connect`)

### Code Changes
- `src/contexts/HederaWalletContext.tsx` - New context using DAppConnector
- `src/App.tsx` - Wrapped app with HederaWalletProvider
- `src/pages/settings/Wallets.tsx` - Updated to use new context

## Testing Checklist

- [ ] HashPack wallet connection works
- [ ] Blade wallet connection works  
- [ ] Kabila wallet connection works
- [ ] Account ID is correctly displayed after connection
- [ ] Transactions can be signed
- [ ] Session persists across page refreshes
- [ ] Disconnect functionality works
- [ ] Multiple wallet connections are handled properly

## References

- [Official Hedera WalletConnect Repo](https://github.com/hashgraph/hedera-wallet-connect)
- [Hedera WalletConnect Docs](https://docs.reown.com/advanced/multichain/rpc-reference/hedera-rpc)
- [Example React Integration](https://github.com/Hashpack/hashconnect/tree/main/example/react-dapp)
- [Hedera Native JSON-RPC Spec](https://docs.reown.com/advanced/multichain/rpc-reference/hedera-rpc)

## Troubleshooting

### "WalletConnect project ID not found"
- Make sure `VITE_WALLETCONNECT_PROJECT_ID` is set in your `.env` file
- Restart the dev server after adding environment variables

### "Failed to initialize DAppConnector"
- Check that you're using the correct network (testnet/mainnet)
- Verify WalletConnect project ID is valid
- Check browser console for detailed error messages

### "No wallet detected"
- User needs to have a Hedera wallet installed (HashPack, Blade, or Kabila)
- The wallet extension must be enabled in the browser
- Try refreshing the page after installing a wallet

### Session not persisting
- Check that cookies/local storage are enabled
- WalletConnect sessions are stored by the DAppConnector automatically
- Make sure the app domain matches the one configured in WalletConnect Cloud

## Next Steps for TestSprite

Now that the wallet integration follows the official Hedera pattern, TestSprite can test:

1. **Wallet Connection Flow**
   - Open wallet modal
   - Connect with different wallet types
   - Verify account ID is stored correctly

2. **Transaction Signing**
   - Create a test certificate
   - Sign the minting transaction
   - Verify on HashScan

3. **DID Creation**
   - Connect wallet
   - Create DID using connected account
   - Verify DID format and storage

4. **Multi-Wallet Support**
   - Connect multiple wallets
   - Switch between wallets
   - Set primary wallet

---

**Last Updated:** 2025-10-30
**Implementation:** Following official Hedera guidelines
**Status:** ✅ Ready for testing
