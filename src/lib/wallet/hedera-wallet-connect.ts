import {
  HederaSessionEvent,
  HederaJsonRpcMethod,
  DAppConnector,
  HederaChainId,
  DAppSigner,
} from "@hashgraph/hedera-wallet-connect";
import { LedgerId, Transaction } from "@hashgraph/sdk";

/**
 * Hedera Wallet Connect Manager
 */
class HederaWalletConnectManager {
  private static instance: HederaWalletConnectManager;
  private dAppConnector: DAppConnector | null = null;
  private signer: DAppSigner | null = null;
  private accountId: string | null = null;
  private network: "mainnet" | "testnet" | "previewnet" = "testnet";

  private constructor() {
    const networkEnv = import.meta.env.VITE_HEDERA_NETWORK;
    if (
      networkEnv === "mainnet" ||
      networkEnv === "testnet" ||
      networkEnv === "previewnet"
    ) {
      this.network = networkEnv;
    }
  }

  static getInstance(): HederaWalletConnectManager {
    if (!HederaWalletConnectManager.instance) {
      HederaWalletConnectManager.instance =
        new HederaWalletConnectManager();
    }
    return HederaWalletConnectManager.instance;
  }

  /**
   * Get Hedera Chain ID based on network
   */
  private getChainId(): HederaChainId {
    switch (this.network) {
      case "mainnet":
        return HederaChainId.Mainnet;
      case "testnet":
        return HederaChainId.Testnet;
      case "previewnet":
        return HederaChainId.Previewnet;
      default:
        return HederaChainId.Testnet;
    }
  }

  /**
   * Initialize DAppConnector
   */
  async init(): Promise<void> {
    try {
      const metadata = {
        name: "Hedera CertChain",
        description: "Issue and verify blockchain certificates on Hedera",
        url:
          typeof window !== "undefined"
            ? window.location.origin
            : "https://certchain.hedera.com",
        icons: [
          typeof window !== "undefined"
            ? `${window.location.origin}/logo.png`
            : "https://certchain.hedera.com/logo.png",
        ],
      };

      // Initialize DAppConnector with WalletConnect v2
      this.dAppConnector = new DAppConnector(
        metadata,
        this.network === 'mainnet' ? LedgerId.MAINNET : LedgerId.TESTNET,
        import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "",
        Object.values(HederaJsonRpcMethod),
        [this.getChainId()],
        undefined
      );

      // Set up event listeners
      this.setupEventListeners();

      // Try to restore previous session
      await this.dAppConnector.init();

      const existingSessions = this.dAppConnector.signers;
      if (existingSessions && existingSessions.length > 0) {
          this.signer = existingSessions[0];
          this.accountId = this.signer.getAccountId().toString();
      }
    } catch (error) {
      console.error("Failed to initialize Hedera Wallet Connect:", error);
      throw error;
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (!this.dAppConnector) return;

    // Session event listener
    this.dAppConnector.onSessionEvent((event: HederaSessionEvent) => {
      console.log("Session event:", event);
    });
  }

  /**
   * Connect wallet
   */
  async connectWallet(): Promise<{
    accountId: string;
    network: string;
    topic: string;
  }> {
    if (!this.dAppConnector) {
      throw new Error("DAppConnector not initialized");
    }

    try {
      // Open WalletConnect modal
      await this.dAppConnector.openModal();

      // After modal closes, the signers array should be populated if successful
      if (this.dAppConnector.signers.length === 0) {
          throw new Error("No account found after connection");
      }

      this.signer = this.dAppConnector.signers[0];
      this.accountId = this.signer.getAccountId().toString();

      return {
        accountId: this.accountId,
        network: this.network,
        topic: 'session-topic', // In reality, we'd get this from session data if needed
      };
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    if (!this.dAppConnector) return;

    try {
      await this.dAppConnector.disconnectAll();
      this.signer = null;
      this.accountId = null;
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }

  /**
   * Sign and execute transaction
   */
  async signAndExecuteTransaction(
    transaction: Transaction
  ): Promise<{ transactionId: string; receipt: unknown }> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      const result = await this.signer.signAndExecuteTransaction(
        transaction as never
      );

      return {
        transactionId: result.transactionId.toString(),
        receipt: result,
      };
    } catch (error) {
      console.error("Failed to execute transaction:", error);
      throw error;
    }
  }

  /**
   * Sign transaction (without executing)
   */
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      const signedTx = await this.signer.signTransaction(transaction as never);
      return signedTx as Transaction;
    } catch (error) {
      console.error("Failed to sign transaction:", error);
      throw error;
    }
  }

  /**
   * Sign message
   */
  async signMessage(message: string): Promise<{ signature: string }> {
    if (!this.signer || !this.accountId) {
      throw new Error("Wallet not connected");
    }

    try {
      const result = await this.signer.sign(
        [new TextEncoder().encode(message)],
        this.accountId
      );

      return {
        signature: Buffer.from(result[0]).toString("hex"),
      };
    } catch (error) {
      console.error("Failed to sign message:", error);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(): Promise<unknown> {
    if (!this.signer || !this.accountId) {
      throw new Error("Wallet not connected");
    }

    try {
      return await this.signer.getAccountBalance(this.accountId);
    } catch (error) {
      console.error("Failed to get balance:", error);
      throw error;
    }
  }

  /**
   * Get account info
   */
  async getAccountInfo(): Promise<unknown> {
    if (!this.signer || !this.accountId) {
      throw new Error("Wallet not connected");
    }

    try {
      return await this.signer.getAccountInfo(this.accountId);
    } catch (error) {
      console.error("Failed to get account info:", error);
      throw error;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.signer !== null && this.accountId !== null;
  }

  /**
   * Get account ID
   */
  getAccountId(): string | null {
    return this.accountId;
  }

  /**
   * Get network
   */
  getNetwork(): string {
    return this.network;
  }

  /**
   * Get signer (for advanced use)
   */
  getSigner(): DAppSigner | null {
    return this.signer;
  }
}

// Export singleton instance
export const hederaWalletConnect = HederaWalletConnectManager.getInstance();
