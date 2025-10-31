/**
 * Hedera Resilient Client
 * 
 * Combines DApp connection with Mirror Node backup for maximum resilience.
 * Automatically falls back to Mirror Node when DApp connection fails.
 * Ensures all transactions are logged to Supabase regardless of failures.
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import {
  syncTransactionFromMirrorNode,
  waitForTransaction,
  type MirrorNodeOptions,
} from './hedera-mirror-node.ts';

export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  transactionHash?: string;
  error?: string;
  syncedFromMirror?: boolean;
}

export interface ResilientClientOptions {
  network?: 'mainnet' | 'testnet' | 'previewnet';
  enableMirrorBackup?: boolean;
  mirrorBackupDelay?: number;
}

/**
 * Execute a transaction with automatic mirror node backup
 * 
 * Workflow:
 * 1. Execute transaction via DApp connection
 * 2. Attempt to log directly to Supabase
 * 3. If logging fails, sync from mirror node as backup
 * 4. Return result with sync status
 * 
 * @param supabase - Supabase client
 * @param userId - User ID executing the transaction
 * @param transactionType - Type of transaction
 * @param transactionFn - Function that executes the transaction and returns transaction ID
 * @param options - Resilience options
 */
export async function executeResilientTransaction(
  supabase: SupabaseClient,
  userId: string,
  transactionType: string,
  transactionFn: () => Promise<string>,
  options: ResilientClientOptions = {}
): Promise<TransactionResult> {
  const {
    network = 'testnet',
    enableMirrorBackup = true,
    mirrorBackupDelay = 5000,
  } = options;

  let transactionId: string | undefined;
  let transactionHash: string | undefined;

  try {
    // Step 1: Execute the transaction
    console.log(`Executing ${transactionType} transaction...`);
    transactionId = await transactionFn();
    console.log(`Transaction executed: ${transactionId}`);

    // Step 2: Try to log directly to Supabase
    try {
      const { error: logError } = await supabase
        .from('transaction_logs')
        .insert({
          user_id: userId,
          transaction_id: transactionId,
          transaction_type: transactionType,
          status: 'pending',
          metadata: {
            executed_at: new Date().toISOString(),
            source: 'dapp',
          },
        });

      if (logError) {
        console.warn('Direct logging failed, will sync from mirror node:', logError);
        throw logError;
      }

      console.log('Transaction logged directly to Supabase');

      // Update status after confirmation
      if (enableMirrorBackup) {
        setTimeout(async () => {
          try {
            const mirrorTx = await waitForTransaction(transactionId!, {
              network,
              maxRetries: 5,
              retryDelay: 2000,
            });

            if (mirrorTx) {
              await supabase
                .from('transaction_logs')
                .update({
                  status: mirrorTx.result === 'SUCCESS' ? 'success' : 'failed',
                  transaction_hash: mirrorTx.transaction_hash,
                  metadata: {
                    executed_at: new Date().toISOString(),
                    source: 'dapp',
                    confirmed_from_mirror: true,
                    consensus_timestamp: mirrorTx.consensus_timestamp,
                    charged_tx_fee: mirrorTx.charged_tx_fee,
                  },
                })
                .eq('transaction_id', transactionId!);

              console.log('Transaction confirmed from mirror node');
            }
          } catch (error) {
            console.error('Error confirming from mirror node:', error);
          }
        }, mirrorBackupDelay);
      }

      return {
        success: true,
        transactionId,
        syncedFromMirror: false,
      };
    } catch (logError) {
      // Step 3: Fallback to mirror node sync
      if (enableMirrorBackup && transactionId) {
        console.log('Attempting mirror node backup sync...');
        
        const synced = await syncTransactionFromMirrorNode(
          supabase,
          transactionId,
          userId,
          transactionType,
          network
        );

        if (synced) {
          return {
            success: true,
            transactionId,
            syncedFromMirror: true,
          };
        }
      }

      // Both direct logging and mirror sync failed
      return {
        success: false,
        transactionId,
        error: 'Transaction executed but logging failed',
        syncedFromMirror: false,
      };
    }
  } catch (error: any) {
    console.error(`Error executing ${transactionType} transaction:`, error);
    
    return {
      success: false,
      error: error.message || 'Transaction execution failed',
    };
  }
}

/**
 * Query transaction status with mirror node fallback
 * 
 * @param supabase - Supabase client
 * @param transactionId - Transaction ID to query
 * @param network - Hedera network
 */
export async function queryTransactionStatus(
  supabase: SupabaseClient,
  transactionId: string,
  network: 'mainnet' | 'testnet' | 'previewnet' = 'testnet'
): Promise<{
  status: 'success' | 'failed' | 'pending' | 'not_found';
  transactionHash?: string;
  metadata?: any;
}> {
  try {
    // First, check Supabase
    const { data: log, error } = await supabase
      .from('transaction_logs')
      .select('*')
      .eq('transaction_id', transactionId)
      .maybeSingle();

    if (log && !error) {
      return {
        status: log.status,
        transactionHash: log.transaction_hash,
        metadata: log.metadata,
      };
    }

    // Fallback to mirror node
    console.log('Transaction not in database, checking mirror node...');
    const mirrorTx = await waitForTransaction(transactionId, {
      network,
      maxRetries: 3,
      retryDelay: 2000,
    });

    if (mirrorTx) {
      return {
        status: mirrorTx.result === 'SUCCESS' ? 'success' : 'failed',
        transactionHash: mirrorTx.transaction_hash,
        metadata: {
          consensus_timestamp: mirrorTx.consensus_timestamp,
          charged_tx_fee: mirrorTx.charged_tx_fee,
          source: 'mirror_node',
        },
      };
    }

    return { status: 'not_found' };
  } catch (error) {
    console.error('Error querying transaction status:', error);
    return { status: 'not_found' };
  }
}

/**
 * Health check for Hedera connectivity
 * Tests both DApp connection availability and Mirror Node access
 */
export async function checkHederaHealth(
  network: 'mainnet' | 'testnet' | 'previewnet' = 'testnet'
): Promise<{
  dappAvailable: boolean;
  mirrorNodeAvailable: boolean;
  mirrorNodeLatency?: number;
}> {
  const result = {
    dappAvailable: false,
    mirrorNodeAvailable: false,
    mirrorNodeLatency: undefined as number | undefined,
  };

  // Test mirror node
  try {
    const startTime = Date.now();
    const mirrorUrl = network === 'testnet' 
      ? 'https://testnet.mirrornode.hedera.com'
      : network === 'mainnet'
      ? 'https://mainnet-public.mirrornode.hedera.com'
      : 'https://previewnet.mirrornode.hedera.com';

    const response = await fetch(`${mirrorUrl}/api/v1/network/supply`, {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      result.mirrorNodeAvailable = true;
      result.mirrorNodeLatency = Date.now() - startTime;
    }
  } catch (error) {
    console.error('Mirror node health check failed:', error);
  }

  return result;
}

/**
 * Retry failed transactions from transaction_logs
 * Useful for recovering from extended downtime
 * 
 * @param supabase - Supabase client
 * @param network - Hedera network
 * @param limit - Maximum number of transactions to retry
 */
export async function retryFailedTransactions(
  supabase: SupabaseClient,
  network: 'mainnet' | 'testnet' | 'previewnet' = 'testnet',
  limit: number = 50
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  try {
    // Find failed or pending transactions older than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: failedTxs, error } = await supabase
      .from('transaction_logs')
      .select('*')
      .in('status', ['failed', 'pending'])
      .lt('created_at', fiveMinutesAgo)
      .limit(limit);

    if (error || !failedTxs) {
      console.error('Error fetching failed transactions:', error);
      return { synced, failed };
    }

    console.log(`Found ${failedTxs.length} failed/pending transactions to retry`);

    for (const tx of failedTxs) {
      try {
        const success = await syncTransactionFromMirrorNode(
          supabase,
          tx.transaction_id,
          tx.user_id,
          tx.transaction_type,
          network
        );

        if (success) {
          synced++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Error retrying transaction ${tx.transaction_id}:`, error);
        failed++;
      }
    }

    console.log(`Retry complete: ${synced} synced, ${failed} failed`);
  } catch (error) {
    console.error('Error in retryFailedTransactions:', error);
  }

  return { synced, failed };
}
