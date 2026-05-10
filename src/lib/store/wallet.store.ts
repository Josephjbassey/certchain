import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  isConnected: boolean;
  walletType: string | null;
  accountId: string | null;
  publicKey: string | null;
  pairingString: string | null;
  connect: (type: string, accountId: string, publicKey?: string, pairingString?: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      isConnected: false,
      walletType: null,
      accountId: null,
      publicKey: null,
      pairingString: null,
      connect: (type, accountId, publicKey, pairingString) => set({
        isConnected: true,
        walletType: type,
        accountId,
        publicKey: publicKey || null,
        pairingString: pairingString || null,
      }),
      disconnect: () => set({
        isConnected: false,
        walletType: null,
        accountId: null,
        publicKey: null,
        pairingString: null,
      }),
    }),
    {
      name: 'certchain-wallet-storage',
    }
  )
);
