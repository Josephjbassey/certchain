/**
 * Hedera Transaction Utilities
 * 
 * Provides helper functions for signing and executing transactions on the Hedera network,
 * synced with Supabase backend for audit trails and data persistence.
 */

import {
  Transaction,
  Query,
  TransactionResponse,
  TransactionReceipt,
  AccountId,
} from '@hashgraph/sdk';
import {
  DAppConnector,
  SignAndExecuteTransactionParams,
  SignAndExecuteQueryParams,
  SignTransactionParams,
  transactionToBase64String,
  queryToBase64String,
} from '@hashgraph/hedera-wallet-connect';
import { supabase } from '@/integrations/supabase/client';

interface TransactionResult {
  transactionId: string;
  transactionHash?: string;
  receipt?: any;
  error?: string;
}

interface TransactionLog {
  user_id: string;
  transaction_id: string;
  transaction_type: string;
  status: 'pending' | 'success' | 'failed';
  transaction_hash?: string;
  error_message?: string;
  metadata?: Record<string, any>;
}

/**
 * Sign and execute a transaction on Hedera, then log it to Supabase
 */
export async function signAndExecuteTransaction(
  dAppConnector: DAppConnector,
  transaction: Transaction,
  accountId: string,
  transactionType: string,
  metadata?: Record<string, any>
): Promise<TransactionResult> {
  try {
    // Get user from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Convert transaction to base64 for Hedera
    const transactionBase64 = transactionToBase64String(transaction);

    // Prepare params for DAppConnector
    const params: SignAndExecuteTransactionParams = {
      signerAccountId: `hedera:testnet:${accountId}`, // Format: hedera:<network>:<accountId>
      transactionList: transactionBase64,
    };

    // Execute transaction via wallet
    const result = await dAppConnector.signAndExecuteTransaction(params);

    // Log successful transaction to Supabase
    const transactionLog: TransactionLog = {
      user_id: user.id,
      transaction_id: result.transactionId,
      transaction_type: transactionType,
      status: 'success',
      transaction_hash: result.transactionHash,
      metadata,
    };

    await logTransactionToSupabase(transactionLog);

    return {
      transactionId: result.transactionId,
      transactionHash: result.transactionHash,
    };
  } catch (error: any) {
    console.error('Transaction execution failed:', error);

    // Log failed transaction to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const failedLog: TransactionLog = {
        user_id: user.id,
        transaction_id: '',
        transaction_type: transactionType,
        status: 'failed',
        error_message: error.message || 'Unknown error',
        metadata,
      };
      await logTransactionToSupabase(failedLog);
    }

    return {
      transactionId: '',
      error: error.message || 'Transaction failed',
    };
  }
}

/**
 * Sign a transaction without executing (for batch operations)
 */
export async function signTransaction(
  dAppConnector: DAppConnector,
  transaction: Transaction,
  accountId: string
): Promise<Transaction> {
  const params: SignTransactionParams = {
    signerAccountId: `hedera:testnet:${accountId}`,
    transactionBody: transaction,
  };

  const signedTx = await dAppConnector.signTransaction(params);
  return signedTx;
}

/**
 * Execute a query on Hedera network
 */
export async function executeQuery<T>(
  dAppConnector: DAppConnector,
  query: Query<T>,
  accountId: string
): Promise<T> {
  const queryBase64 = queryToBase64String(query);

  const params: SignAndExecuteQueryParams = {
    signerAccountId: `hedera:testnet:${accountId}`,
    query: queryBase64,
  };

  const result = await dAppConnector.signAndExecuteQuery(params);
  return result.response as T;
}

/**
 * Log transaction to Supabase for audit trail
 */
async function logTransactionToSupabase(log: TransactionLog): Promise<void> {
  try {
    // Check if transaction_logs table exists, if not we'll skip logging
    const { error } = await supabase
      .from('transaction_logs')
      .insert(log);

    if (error) {
      console.warn('Failed to log transaction to Supabase:', error);
      // Don't throw - logging failure shouldn't break the transaction
    }
  } catch (error) {
    console.warn('Failed to log transaction:', error);
  }
}

/**
 * Get transaction history from Supabase
 */
export async function getTransactionHistory(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('transaction_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Helper to format Hedera account ID for HIP-30 standard
 * @param accountId - Account ID in format "0.0.12345"
 * @param network - Network ("mainnet" | "testnet" | "previewnet")
 */
export function formatHederaAccountId(accountId: string, network: string = 'testnet'): string {
  return `hedera:${network}:${accountId}`;
}

/**
 * Parse HIP-30 formatted account ID to get just the account number
 * @param formattedId - Account ID in format "hedera:testnet:0.0.12345"
 */
export function parseHederaAccountId(formattedId: string): string {
  const parts = formattedId.split(':');
  return parts[parts.length - 1]; // Return "0.0.12345"
}
