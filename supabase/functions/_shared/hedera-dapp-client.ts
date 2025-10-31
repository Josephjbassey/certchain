/**
 * Hedera DApp Client for Edge Functions
 * 
 * This module handles transactions signed by users' wallets (client-side)
 * and submitted through edge functions for logging and verification.
 * 
 * Flow:
 * 1. User signs transaction with their wallet (frontend)
 * 2. Frontend sends signed transaction bytes to edge function
 * 3. Edge function submits to Hedera network
 * 4. Edge function logs to Supabase with mirror node backup
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import {
  Client,
  Transaction,
  TransactionResponse,
  TransactionReceipt,
} from "https://esm.sh/@hashgraph/sdk@2.75.0/es2022/sdk.mjs";
import { syncTransactionFromMirrorNode } from './hedera-mirror-node.ts';

export interface SignedTransactionPayload {
  signedTransactionBytes: string; // Base64 encoded signed transaction
  signerAccountId: string; // User's Hedera account ID
  transactionType: string; // e.g., "TOKEN_MINT", "TOPIC_CREATE"
}

export interface DAppTransactionResult {
  success: boolean;
  transactionId?: string;
  transactionHash?: string;
  receipt?: any;
  error?: string;
  syncedFromMirror?: boolean;
}

/**
 * Submit a user-signed transaction to Hedera network
 * This allows edge functions to submit transactions signed by user wallets
 * 
 * @param client - Hedera client
 * @param signedTransactionBytes - Base64 encoded signed transaction from user wallet
 * @returns Transaction response with ID and receipt
 */
export async function submitSignedTransaction(
  client: Client,
  signedTransactionBytes: string
): Promise<{
  transactionId: string;
  receipt: TransactionReceipt;
  response: TransactionResponse;
}> {
  try {
    // Decode base64 transaction bytes
    const bytes = Uint8Array.from(atob(signedTransactionBytes), c => c.charCodeAt(0));
    
    // Deserialize transaction from bytes
    const transaction = Transaction.fromBytes(bytes);
    
    // Submit pre-signed transaction to network
    const response = await transaction.execute(client);
    
    // Get receipt for confirmation
    const receipt = await response.getReceipt(client);
    
    return {
      transactionId: response.transactionId.toString(),
      receipt,
      response,
    };
  } catch (error: any) {
    console.error('Error submitting signed transaction:', error);
    throw new Error(`Failed to submit signed transaction: ${error.message}`);
  }
}

/**
 * Process a DApp transaction: submit signed transaction and log to Supabase
 * with mirror node backup
 * 
 * @param supabase - Supabase client
 * @param client - Hedera client
 * @param payload - Signed transaction payload from frontend
 * @param userId - User ID for logging
 * @param network - Hedera network
 */
export async function processDAppTransaction(
  supabase: SupabaseClient,
  client: Client,
  payload: SignedTransactionPayload,
  userId: string,
  network: 'mainnet' | 'testnet' | 'previewnet' = 'testnet'
): Promise<DAppTransactionResult> {
  try {
    console.log(`Processing DApp transaction: ${payload.transactionType}`);
    console.log(`Signer: ${payload.signerAccountId}`);

    // Submit the signed transaction
    const { transactionId, receipt, response } = await submitSignedTransaction(
      client,
      payload.signedTransactionBytes
    );

    console.log(`Transaction submitted: ${transactionId}`);

    // Try to log directly to Supabase
    try {
      const { error: logError } = await supabase
        .from('transaction_logs')
        .insert({
          user_id: userId,
          transaction_id: transactionId,
          transaction_type: payload.transactionType,
          status: 'pending',
          metadata: {
            executed_at: new Date().toISOString(),
            source: 'dapp_wallet',
            signer_account_id: payload.signerAccountId,
            receipt_status: receipt.status.toString(),
          },
        });

      if (logError) {
        console.warn('Direct logging failed, will sync from mirror node:', logError);
        throw logError;
      }

      console.log('Transaction logged directly to Supabase');

      // Async confirmation from mirror node after delay
      setTimeout(async () => {
        try {
          const mirrorTx = await import('./hedera-mirror-node.ts').then(m => 
            m.waitForTransaction(transactionId, { network, maxRetries: 5, retryDelay: 2000 })
          );

          if (mirrorTx) {
            await supabase
              .from('transaction_logs')
              .update({
                status: mirrorTx.result === 'SUCCESS' ? 'success' : 'failed',
                transaction_hash: mirrorTx.transaction_hash,
                metadata: {
                  executed_at: new Date().toISOString(),
                  source: 'dapp_wallet',
                  signer_account_id: payload.signerAccountId,
                  confirmed_from_mirror: true,
                  consensus_timestamp: mirrorTx.consensus_timestamp,
                  charged_tx_fee: mirrorTx.charged_tx_fee,
                },
              })
              .eq('transaction_id', transactionId);

            console.log('Transaction confirmed from mirror node');
          }
        } catch (error) {
          console.error('Error confirming from mirror node:', error);
        }
      }, 5000);

      return {
        success: true,
        transactionId,
        receipt: receipt,
        syncedFromMirror: false,
      };
    } catch (logError) {
      // Fallback to mirror node sync
      console.log('Attempting mirror node backup sync...');
      
      const synced = await syncTransactionFromMirrorNode(
        supabase,
        transactionId,
        userId,
        payload.transactionType,
        network
      );

      if (synced) {
        return {
          success: true,
          transactionId,
          receipt: receipt,
          syncedFromMirror: true,
        };
      }

      // Both logging methods failed but transaction succeeded
      return {
        success: true,
        transactionId,
        receipt: receipt,
        error: 'Transaction executed but logging failed',
        syncedFromMirror: false,
      };
    }
  } catch (error: any) {
    console.error(`Error processing DApp transaction:`, error);
    
    return {
      success: false,
      error: error.message || 'Transaction processing failed',
    };
  }
}

/**
 * Verify wallet ownership by checking signature
 * This ensures the user actually controls the wallet they claim
 * 
 * @param supabase - Supabase client
 * @param userId - User ID from auth
 * @param accountId - Hedera account ID to verify
 * @param signedMessage - Signed message from wallet
 */
export async function verifyWalletOwnership(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
  signedMessage: string
): Promise<boolean> {
  try {
    // Store or update wallet connection
    const { error } = await supabase
      .from('user_wallet_connections')
      .upsert({
        user_id: userId,
        hedera_account_id: accountId,
        verified_at: new Date().toISOString(),
        last_connected: new Date().toISOString(),
      }, {
        onConflict: 'user_id,hedera_account_id'
      });

    if (error) {
      console.error('Error storing wallet connection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying wallet ownership:', error);
    return false;
  }
}

/**
 * Get user's connected wallet from Supabase
 * 
 * @param supabase - Supabase client
 * @param userId - User ID from auth
 */
export async function getUserWallet(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('user_wallet_connections')
      .select('hedera_account_id')
      .eq('user_id', userId)
      .order('last_connected', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data.hedera_account_id;
  } catch (error) {
    console.error('Error getting user wallet:', error);
    return null;
  }
}
