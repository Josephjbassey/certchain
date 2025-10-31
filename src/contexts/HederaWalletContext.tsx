import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  HederaSessionEvent,
  HederaJsonRpcMethod,
  DAppConnector,
  HederaChainId,
} from '@hashgraph/hedera-wallet-connect';
import { LedgerId, AccountId, Transaction } from '@hashgraph/sdk';
import { toast } from 'sonner';
import {
  executeTransaction as execTx,
  signTransaction as signTx,
  getSigner as getSignerUtil,
  handleHederaError,
  type HederaNetwork,
} from '@/lib/hedera-utils';

interface HederaWalletContextType {
  dAppConnector: DAppConnector | null;
  isConnected: boolean;
  isConnecting: boolean;
  accountId: string | null;
  network: HederaNetwork;
  sessionData: any | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (network: HederaNetwork) => Promise<void>;
  executeTransaction: <T extends Transaction>(transaction: T) => Promise<{
    transactionId: string;
    receipt: any;
  }>;
  signTransaction: <T extends Transaction>(transaction: T) => Promise<T>;
  getSigner: () => any | null;
}

const HederaWalletContext = createContext<HederaWalletContextType | undefined>(undefined);

interface HederaWalletProviderProps {
  children: ReactNode;
}

export const HederaWalletProvider = ({ children }: HederaWalletProviderProps) => {
  const [dAppConnector, setDAppConnector] = useState<DAppConnector | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [network, setNetwork] = useState<HederaNetwork>('testnet');
  const [sessionData, setSessionData] = useState<any | null>(null);

  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
  const hederaNetwork = (import.meta.env.VITE_HEDERA_NETWORK || 'testnet') as HederaNetwork;

  const getLedgerId = (net: HederaNetwork) => {
    switch (net) {
      case 'mainnet': return LedgerId.MAINNET;
      case 'previewnet': return LedgerId.PREVIEWNET;
      default: return LedgerId.TESTNET;
    }
  };

  const getChainId = (net: HederaNetwork) => {
    switch (net) {
      case 'mainnet': return HederaChainId.Mainnet;
      case 'previewnet': return HederaChainId.Previewnet;
      default: return HederaChainId.Testnet;
    }
  };

  useEffect(() => {
    setNetwork(hederaNetwork);
  }, [hederaNetwork]);

  useEffect(() => {
    const initDAppConnector = async () => {
      if (!projectId) {
        console.error('WalletConnect project ID not found');
        return;
      }

      const metadata = {
        name: 'CertChain',
        description: 'Blockchain Certificate Management Platform',
        url: window.location.origin,
        icons: [`${window.location.origin}/logo.png`],
      };

      try {
        const ledgerId = getLedgerId(hederaNetwork);
        const chainId = getChainId(hederaNetwork);

        const connector = new DAppConnector(
          metadata,
          ledgerId,
          projectId,
          Object.values(HederaJsonRpcMethod),
          [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
          [chainId]
        );

        await connector.init({ logger: 'error' });

        connector.onSessionIframeCreated = (session: any) => {
          console.log('Session created:', session);
          setSessionData(session);
          try {
            if (session?.accountIds && session.accountIds.length > 0) {
              setAccountId(session.accountIds[0]);
              setIsConnected(true);
              toast.success('Wallet connected successfully');
            }
          } catch (error) {
            console.error('Error processing session:', error);
          }
        };

        const existingSessions = connector.signers;
        if (existingSessions && existingSessions.length > 0) {
          const firstSession = existingSessions[0];
          const accId = firstSession.getAccountId();
          if (accId) {
            setAccountId(accId.toString());
            setIsConnected(true);
            setNetwork(hederaNetwork);
          }
        }

        setDAppConnector(connector);
      } catch (error) {
        console.error('Failed to initialize DAppConnector:', error);
        toast.error('Failed to initialize wallet connection');
      }
    };

    initDAppConnector();
  }, [projectId, hederaNetwork]);

  const connect = useCallback(async () => {
    if (!dAppConnector) {
      toast.error('Wallet connector not initialized');
      throw new Error('DAppConnector not initialized');
    }

    if (isConnecting) {
      return;
    }

    try {
      setIsConnecting(true);
      await dAppConnector.openModal();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      const hederaError = handleHederaError(error);
      toast.error(hederaError.message);
      throw hederaError;
    } finally {
      setIsConnecting(false);
    }
  }, [dAppConnector, isConnecting]);

  const disconnect = useCallback(async () => {
    if (!dAppConnector) {
      throw new Error('DAppConnector not initialized');
    }

    try {
      await dAppConnector.disconnectAll();
      setIsConnected(false);
      setAccountId(null);
      setSessionData(null);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      const hederaError = handleHederaError(error);
      toast.error(hederaError.message);
      throw hederaError;
    }
  }, [dAppConnector]);

  const switchNetwork = useCallback(async (newNetwork: HederaNetwork) => {
    toast.info(`Network switching to ${newNetwork} - please reconnect your wallet`);
    await disconnect();
    setNetwork(newNetwork);
  }, [disconnect]);

  const executeTransactionFn = useCallback(async <T extends Transaction>(transaction: T) => {
    try {
      const result = await execTx(transaction, dAppConnector, accountId);
      toast.success('Transaction executed successfully');
      return {
        transactionId: result.transactionId,
        receipt: result.receipt,
      };
    } catch (error) {
      const hederaError = handleHederaError(error);
      toast.error(`Transaction failed: ${hederaError.message}`);
      throw hederaError;
    }
  }, [dAppConnector, accountId]);

  const signTransactionFn = useCallback(async <T extends Transaction>(transaction: T) => {
    try {
      const signed = await signTx(transaction, dAppConnector, accountId);
      toast.success('Transaction signed successfully');
      return signed;
    } catch (error) {
      const hederaError = handleHederaError(error);
      toast.error(`Signing failed: ${hederaError.message}`);
      throw hederaError;
    }
  }, [dAppConnector, accountId]);

  const getSignerFn = useCallback(() => {
    try {
      return getSignerUtil(dAppConnector, accountId);
    } catch (error) {
      console.error('Failed to get signer:', error);
      return null;
    }
  }, [dAppConnector, accountId]);

  return (
    <HederaWalletContext.Provider
      value={{
        dAppConnector,
        isConnected,
        isConnecting,
        accountId,
        network,
        connect,
        disconnect,
        switchNetwork,
        sessionData,
        getSigner: getSignerFn,
        executeTransaction: executeTransactionFn,
        signTransaction: signTransactionFn,
      }}
    >
      {children}
    </HederaWalletContext.Provider>
  );
};

export const useHederaWallet = () => {
  const context = useContext(HederaWalletContext);
  if (context === undefined) {
    throw new Error('useHederaWallet must be used within a HederaWalletProvider');
  }
  return context;
};

