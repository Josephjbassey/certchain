// src/lib/hedera/client.ts
// ============================================
// HEDERA CLIENT CONFIGURATION
// ============================================

import {
  Client,
  AccountId,
  PrivateKey,
  Hbar,
  Transaction,
  TransactionResponse,
  TransactionReceipt,
} from "@hashgraph/sdk";
import type { HederaNetwork } from "./types";

interface NetworkConfig {
  name: HederaNetwork;
  mirrorNodeUrl: string;
  jsonRpcRelay: string;
}

const NETWORK_CONFIGS: Record<HederaNetwork, NetworkConfig> = {
  mainnet: {
    name: "mainnet",
    mirrorNodeUrl: "https://mainnet.mirrornode.hedera.com",
    jsonRpcRelay: "https://mainnet.hashio.io/api",
  },
  testnet: {
    name: "testnet",
    mirrorNodeUrl: "https://testnet.mirrornode.hedera.com",
    jsonRpcRelay: "https://testnet.hashio.io/api",
  },
  previewnet: {
    name: "previewnet",
    mirrorNodeUrl: "https://previewnet.mirrornode.hedera.com",
    jsonRpcRelay: "https://previewnet.hashio.io/api",
  },
};

/**
 * Get network configuration
 */
export function getNetworkConfig(): NetworkConfig {
  const network = (import.meta.env.VITE_HEDERA_NETWORK ||
    "testnet") as HederaNetwork;
  return NETWORK_CONFIGS[network];
}

/**
 * Create Hedera client for operator (server-side)
 */
export function createOperatorClient(): Client {
  const network = getNetworkConfig();
  const operatorId = AccountId.fromString(
    import.meta.env.VITE_HEDERA_OPERATOR_ID || "0.0.0"
  );
  const operatorKey = PrivateKey.fromString(
    import.meta.env.VITE_HEDERA_OPERATOR_KEY || "302e020100300506032b657004220420" + "0".repeat(64)
  );

  let client: Client;

  switch (network.name) {
    case "mainnet":
      client = Client.forMainnet();
      break;
    case "testnet":
      client = Client.forTestnet();
      break;
    case "previewnet":
      client = Client.forPreviewnet();
      break;
    default:
      throw new Error(`Unknown network: ${network.name}`);
  }

  client.setOperator(operatorId, operatorKey);
  client.setDefaultMaxTransactionFee(new Hbar(2));
  client.setDefaultMaxQueryPayment(new Hbar(1));

  return client;
}

/**
 * Create Hedera client for wallet user (client-side)
 */
export function createWalletClient(
  accountId: string,
  _signTransaction: (transaction: Transaction) => Promise<Transaction>
): Client {
  const network = getNetworkConfig();
  let client: Client;

  switch (network.name) {
    case "mainnet":
      client = Client.forMainnet();
      break;
    case "testnet":
      client = Client.forTestnet();
      break;
    case "previewnet":
      client = Client.forPreviewnet();
      break;
    default:
      throw new Error(`Unknown network: ${network.name}`);
  }

  // Set operator with wallet signing function
  const accId = AccountId.fromString(accountId);
  client.setOperator(accId, async (_message: Uint8Array) => {
    // This will be handled by wallet provider
    throw new Error("Use signTransaction instead");
  });

  client.setDefaultMaxTransactionFee(new Hbar(2));
  client.setDefaultMaxQueryPayment(new Hbar(1));

  return client;
}

/**
 * Execute transaction with retry logic
 */
export async function executeTransaction(
  transaction: Transaction,
  client: Client
): Promise<TransactionReceipt> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Freeze and sign transaction
      const frozenTx = await transaction.freezeWith(client);

      // If client has operator, it will sign.
      // If not (wallet mode), it should be signed before calling this or handled by the caller.
      let response: TransactionResponse;
      if (client.operatorAccountId) {
         response = await frozenTx.execute(client);
      } else {
         // Fallback if not operator set - though usually operator is set for execution
         response = await frozenTx.execute(client);
      }

      // Get receipt
      const receipt = await response.getReceipt(client);

      return receipt;
    } catch (error) {
      lastError = error as Error;
      console.error(`Transaction attempt ${i + 1} failed:`, error);

      // Wait before retry (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  }

  throw lastError || new Error("Transaction failed");
}
