import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  HederaSessionEvent,
  HederaJsonRpcMethod,
  DAppConnector,
  HederaChainId,
  type SessionData,
} from '@hashgraph/hedera-wallet-connect';
import { LedgerId } from '@hashgraph/sdk';

interface HederaWalletContextType {
  dAppConnector: DAppConnector | null;
  isConnected: boolean;
  accountId: string | null;
  network: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sessionData: SessionData | null;
  // Expose signer for advanced transaction operations
  getSigner: () => any | null;
}

const HederaWalletContext = createContext<HederaWalletContextType | undefined>(undefined);

interface HederaWalletProviderProps {
  children: ReactNode;
}

export const HederaWalletProvider = ({ children }: HederaWalletProviderProps) => {
  const [dAppConnector, setDAppConnector] = useState<DAppConnector | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  // Get WalletConnect project ID from environment
  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

  // Get network from environment (default to testnet)
  const hederaNetwork = import.meta.env.VITE_HEDERA_NETWORK || 'testnet';
  const ledgerId = hederaNetwork === 'mainnet' ? LedgerId.MAINNET : LedgerId.TESTNET;

  useEffect(() => {
    const initDAppConnector = async () => {
      if (!projectId) {
        console.error('WalletConnect project ID not found in environment variables');
        return;
      }

      const metadata = {
        name: 'CertChain',
        description: 'Blockchain Certificate Management Platform',
        url: window.location.origin,
        icons: [`${window.location.origin}/logo.png`],
      };

      try {
        // Initialize DAppConnector with metadata, ledger ID, project ID, methods, events, and chains
        const connector = new DAppConnector(
          metadata,
          ledgerId,
          projectId,
          Object.values(HederaJsonRpcMethod),
          [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
          [HederaChainId.Testnet]
        );

        await connector.init({ logger: 'error' });

        // Set up event listeners
        connector.onSessionIframeCreated = (session) => {
          console.log('Session created:', session);
          setSessionData(session);
          if (session.accountIds && session.accountIds.length > 0) {
            setAccountId(session.accountIds[0]);
            setIsConnected(true);
          }
        };

        // Check for existing sessions
        const existingSessions = connector.signers;
        if (existingSessions && existingSessions.length > 0) {
          const firstSession = existingSessions[0];
          if (firstSession.getAccountId()) {
            setAccountId(firstSession.getAccountId().toString());
            setIsConnected(true);
            setNetwork(hederaNetwork);
          }
        }

        setDAppConnector(connector);
      } catch (error) {
        console.error('Failed to initialize DAppConnector:', error);
      }
    };

    initDAppConnector();
  }, [projectId, ledgerId, hederaNetwork]);

  const connect = async () => {
    if (!dAppConnector) {
      throw new Error('DAppConnector not initialized');
    }

    try {
      // Open the pairing modal
      await dAppConnector.openModal();

      // Wait for connection
      // The onSessionIframeCreated callback will handle the session data
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    if (!dAppConnector) {
      throw new Error('DAppConnector not initialized');
    }

    try {
      await dAppConnector.disconnectAll();
      setIsConnected(false);
      setAccountId(null);
      setNetwork(null);
      setSessionData(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  };

  const getSigner = () => {
    if (!dAppConnector || !dAppConnector.signers || dAppConnector.signers.length === 0) {
      return null;
    }
    return dAppConnector.signers[0]; // Return first signer
  };

  return (
    <HederaWalletContext.Provider
      value={{
        dAppConnector,
        isConnected,
        accountId,
        network,
        connect,
        disconnect,
        sessionData,
        getSigner,
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
