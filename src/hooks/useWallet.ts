import { useState, useEffect, useCallback } from "react";
import { hederaWalletConnect } from "@/lib/wallet/hedera-wallet-connect";
import { useWalletStore } from "@/lib/store/wallet.store";
import { Transaction } from "@hashgraph/sdk";

export function useWallet() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    connect,
    disconnect: storeDisconnect,
    isConnected,
    accountId: storeAccountId
  } = useWalletStore();

  /**
   * Initialize on mount
   */
  useEffect(() => {
    const initWalletConnect = async () => {
      try {
        await hederaWalletConnect.init();
        setIsInitialized(true);

        // Check for existing session
        if (hederaWalletConnect.isConnected()) {
          const accountId = hederaWalletConnect.getAccountId();
          if (accountId) {
            connect("hashpack", accountId);
          }
        }
      } catch (err) {
        console.error("Failed to initialize Hedera Wallet Connect:", err);
        setError((err as Error).message);
      }
    };

    initWalletConnect();
  }, [connect]);

  /**
   * Connect wallet
   */
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const result = await hederaWalletConnect.connectWallet();
      connect("hashpack", result.accountId);
    } catch (err) {
      setError((err as Error).message);
      console.error("Connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [connect]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async () => {
    await hederaWalletConnect.disconnect();
    storeDisconnect();
  }, [storeDisconnect]);

  /**
   * Sign and execute transaction
   */
  const signAndExecuteTransaction = useCallback(
    async (transaction: Transaction) => {
      try {
        return await hederaWalletConnect.signAndExecuteTransaction(transaction);
      } catch (err) {
        console.error("Transaction failed:", err);
        throw err;
      }
    },
    []
  );

  return {
    isInitialized,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnect,
    signAndExecuteTransaction,
    accountId: storeAccountId || hederaWalletConnect.getAccountId(),
    network: hederaWalletConnect.getNetwork(),
    signer: hederaWalletConnect.getSigner(),
  };
}
