/**
 * Hedera Utility Functions
 * 
 * Helper functions for working with Hedera transactions, accounts, and the wallet connector.
 */

import {
  AccountId,
  TransactionReceipt,
  TransactionResponse,
  Transaction,
} from '@hashgraph/sdk';
import type { DAppConnector } from '@hashgraph/hedera-wallet-connect';
import { getNetworkConfig as getCoreNetworkConfig } from './hedera/client';
import { HederaNetwork } from './hedera/types';

/**
 * Get network configuration
 */
export function getNetworkConfig(network: HederaNetwork = 'testnet') {
  return getCoreNetworkConfig();
}

/**
 * Get explorer URL for a transaction
 */
export function getTransactionExplorerUrl(
  transactionId: string,
  network: HederaNetwork = 'testnet'
): string {
  const config = getCoreNetworkConfig();
  return `${config.mirrorNodeUrl.replace('mirrornode.', '')}/transaction/${transactionId}`;
}

/**
 * Validate Hedera Account ID format
 */
export function isValidAccountId(accountId: string): boolean {
  const accountIdRegex = /^(\d+)\.(\d+)\.(\d+)(-[a-z]{5})?$/;
  return accountIdRegex.test(accountId);
}

/**
 * Format Hedera Account ID (remove checksum if present)
 */
export function formatAccountId(accountId: string): string {
  return accountId.split('-')[0];
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

export function handleHederaError(error: Error): HederaTransactionError {
  if (error instanceof HederaTransactionError) {
    return error;
  }

  // Extract error details from Hedera SDK errors
  const message = error?.message || 'Unknown Hedera error';
  const code = error?.status?.toString() || error?.code;
  const transactionId = error?.transactionId?.toString();

  return new HederaTransactionError(message, code, transactionId);
}
