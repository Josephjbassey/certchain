/**
 * Hedera Utility Functions
 * 
 * Helper functions for working with Hedera transactions, accounts, and the wallet connector.
 */

import {
  AccountId,
  TransactionId,
  TransactionReceipt,
  TransactionResponse,
  Transaction,
  Hbar,
} from '@hashgraph/sdk';
import type { DAppConnector } from '@hashgraph/hedera-wallet-connect';

/**
 * Network configuration
 */
export const NETWORK_CONFIG = {
  testnet: {
    name: 'Hedera Testnet',
    chainId: 'hedera:testnet',
    explorerUrl: 'https://hashscan.io/testnet',
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
  },
  mainnet: {
    name: 'Hedera Mainnet',
    chainId: 'hedera:mainnet',
    explorerUrl: 'https://hashscan.io/mainnet',
    mirrorNodeUrl: 'https://mainnet.mirrornode.hedera.com',
  },
  previewnet: {
    name: 'Hedera Previewnet',
    chainId: 'hedera:previewnet',
    explorerUrl: 'https://hashscan.io/previewnet',
    mirrorNodeUrl: 'https://previewnet.mirrornode.hedera.com',
  },
} as const;

export type HederaNetwork = keyof typeof NETWORK_CONFIG;

/**
 * Get network configuration
 */
export function getNetworkConfig(network: HederaNetwork = 'testnet') {
  return NETWORK_CONFIG[network];
}

/**
 * Get explorer URL for a transaction
 */
export function getTransactionExplorerUrl(
  transactionId: string,
  network: HederaNetwork = 'testnet'
): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/transaction/${transactionId}`;
}

/**
 * Get explorer URL for an account
 */
export function getAccountExplorerUrl(
  accountId: string,
  network: HederaNetwork = 'testnet'
): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/account/${accountId}`;
}

/**
 * Get explorer URL for a token
 */
export function getTokenExplorerUrl(
  tokenId: string,
  network: HederaNetwork = 'testnet'
): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/token/${tokenId}`;
}

/**
 * Get explorer URL for a topic
 */
export function getTopicExplorerUrl(
  topicId: string,
  network: HederaNetwork = 'testnet'
): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/topic/${topicId}`;
}

/**
 * Validate Hedera Account ID format
 */
export function isValidAccountId(accountId: string): boolean {
  const accountIdRegex = /^(\d+)\.(\d+)\.(\d+)(-[a-z]{5})?$/;
  return accountIdRegex.test(accountId);
}

/**
 * Validate Hedera Token ID format
 */
export function isValidTokenId(tokenId: string): boolean {
  const tokenIdRegex = /^(\d+)\.(\d+)\.(\d+)$/;
  return tokenIdRegex.test(tokenId);
}

/**
 * Format Hedera Account ID (remove checksum if present)
 */
export function formatAccountId(accountId: string): string {
  return accountId.split('-')[0];
}

/**
 * Parse transaction ID to get components
 */
export function parseTransactionId(transactionId: string): {
  accountId: string;
  validStartSeconds: string;
  validStartNanos: string;
} | null {
  const parts = transactionId.split('@');
  if (parts.length !== 2) return null;

  const [accountId, timestamp] = parts;
  const [validStartSeconds, validStartNanos] = timestamp.split('.');

  return {
    accountId,
    validStartSeconds,
    validStartNanos: validStartNanos || '0',
  };
}

/**
 * Convert tinybars to hbars
 */
export function tinybarsToHbars(tinybars: number | bigint): number {
  return Number(tinybars) / 100_000_000;
}

/**
 * Convert hbars to tinybars
 */
export function hbarsToTinybars(hbars: number): bigint {
  return BigInt(Math.floor(hbars * 100_000_000));
}

/**
 * Format Hbar amount for display
 */
export function formatHbarAmount(tinybars: number | bigint, decimals: number = 4): string {
  const hbars = tinybarsToHbars(tinybars);
  return `${hbars.toFixed(decimals)} ℏ`;
}

/**
 * Get signer from DAppConnector
 */
export function getSigner(dAppConnector: DAppConnector | null, accountId: string | null) {
  if (!dAppConnector || !accountId) {
    throw new Error('Wallet not connected');
  }

  if (!dAppConnector.signers || dAppConnector.signers.length === 0) {
    throw new Error('No signers available');
  }

  // Find signer for the specific account
  const signer = dAppConnector.signers.find(
    (s) => s.getAccountId().toString() === accountId
  );

  if (!signer) {
    // Fallback to first signer
    return dAppConnector.signers[0];
  }

  return signer;
}

/**
 * Execute a transaction with the wallet signer
 */
export async function executeTransaction<T extends Transaction>(
  transaction: T,
  dAppConnector: DAppConnector | null,
  accountId: string | null
): Promise<{
  response: TransactionResponse;
  receipt: TransactionReceipt;
  transactionId: string;
}> {
  const signer = getSigner(dAppConnector, accountId);

  // Freeze transaction with signer
  const frozenTx = await transaction.freezeWithSigner(signer);

  // Execute transaction
  const response = await frozenTx.executeWithSigner(signer);

  // Get transaction ID
  const transactionId = response.transactionId.toString();

  // Get receipt
  const receipt = await response.getReceiptWithSigner(signer);

  return {
    response,
    receipt,
    transactionId,
  };
}

/**
 * Sign a transaction without executing it
 */
export async function signTransaction<T extends Transaction>(
  transaction: T,
  dAppConnector: DAppConnector | null,
  accountId: string | null
): Promise<T> {
  const signer = getSigner(dAppConnector, accountId);
  return await transaction.signWithSigner(signer);
}

/**
 * Wait for transaction to appear on mirror node
 */
export async function waitForMirrorNode(
  transactionId: string,
  network: HederaNetwork = 'testnet',
  maxAttempts: number = 10,
  delayMs: number = 2000
): Promise<any> {
  const config = getNetworkConfig(network);
  const url = `${config.mirrorNodeUrl}/api/v1/transactions/${transactionId}`;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Mirror node attempt ${attempt + 1} failed:`, error);
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(`Transaction ${transactionId} not found on mirror node after ${maxAttempts} attempts`);
}

/**
 * Create a DID for a Hedera account
 */
export function createHederaDID(
  accountId: string,
  network: HederaNetwork = 'testnet'
): string {
  const formattedAccountId = formatAccountId(accountId);
  return `did:hedera:${network}:${formattedAccountId}`;
}

/**
 * Parse a Hedera DID
 */
export function parseHederaDID(did: string): {
  method: string;
  network: HederaNetwork;
  accountId: string;
} | null {
  const didRegex = /^did:hedera:(testnet|mainnet|previewnet):(\d+\.\d+\.\d+)$/;
  const match = did.match(didRegex);

  if (!match) return null;

  return {
    method: 'hedera',
    network: match[1] as HederaNetwork,
    accountId: match[2],
  };
}

/**
 * Error handling utilities
 */
export class HederaTransactionError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly transactionId?: string
  ) {
    super(message);
    this.name = 'HederaTransactionError';
  }
}

export function handleHederaError(error: any): HederaTransactionError {
  if (error instanceof HederaTransactionError) {
    return error;
  }

  // Extract error details from Hedera SDK errors
  const message = error?.message || 'Unknown Hedera error';
  const code = error?.status?.toString() || error?.code;
  const transactionId = error?.transactionId?.toString();

  return new HederaTransactionError(message, code, transactionId);
}

/**
 * Retry a Hedera operation with exponential backoff
 */
export async function retryHederaOperation<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < maxAttempts - 1) {
        const delay = initialDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new HederaTransactionError(
    `Operation failed after ${maxAttempts} attempts: ${lastError?.message}`,
    'RETRY_EXHAUSTED'
  );
}

/**
 * Batch operations helper
 */
export async function executeBatch<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  batchSize: number = 5,
  delayBetweenBatches: number = 1000
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(operation));
    results.push(...batchResults);

    // Delay between batches to avoid rate limiting
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
}
