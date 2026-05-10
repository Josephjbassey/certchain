import { useMemo } from "react";
import { createOperatorClient } from "@/lib/hedera/client";
import { useWalletStore } from "@/lib/store/wallet.store";

export function useHederaClient() {
  const { isConnected } = useWalletStore();

  const client = useMemo(() => {
    // For now, return operator client
    // In a full implementation, we'd handle wallet-signed transactions differently
    return createOperatorClient();
  }, [isConnected]);

  return { client };
}
