/**
 * Hedera DApp Client-Side Transaction Utilities
 * 
 * These utilities help you create and sign transactions on the client-side
 * using the user's connected wallet, then submit them through edge functions.
 * 
 * This maintains the DApp architecture where users control their keys.
 */

import { DAppConnector, HederaSessionEvent, HederaJsonRpcMethod } from '@hashgraph/hedera-wallet-connect';
import {
  TokenMintTransaction,
  TokenCreateTransaction,
  TokenAssociateTransaction,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TokenType,
  TokenSupplyType,
  type Client,
} from '@hashgraph/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface WalletConnection {
  accountId: string;
  network: 'mainnet' | 'testnet' | 'previewnet';
  publicKey?: string;
}

export interface SignAndSubmitOptions {
  supabase: SupabaseClient;
  userId: string;
  network?: 'mainnet' | 'testnet' | 'previewnet';
  metadata?: Record<string, any>;
}

/**
 * Sync wallet connection to Supabase
 * Call this after user connects their wallet
 */
export async function syncWalletConnection(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
  network: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_wallet_connections')
      .upsert({
        user_id: userId,
        hedera_account_id: accountId,
        verified_at: new Date().toISOString(),
        last_connected: new Date().toISOString(),
        metadata: { network },
      }, {
        onConflict: 'user_id,hedera_account_id'
      });

    if (error) {
      console.error('Failed to sync wallet connection:', error);
      return false;
    }

    console.log('Wallet connection synced to Supabase');
    return true;
  } catch (error) {
    console.error('Error syncing wallet connection:', error);
    return false;
  }
}

/**
 * Create NFT collection transaction (to be signed by user)
 */
export function createNFTCollectionTransaction(
  tokenName: string,
  tokenSymbol: string,
  treasuryAccountId: string,
  supplyKey: string
) {
  return new TokenCreateTransaction()
    .setTokenName(tokenName)
    .setTokenSymbol(tokenSymbol)
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(treasuryAccountId)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(supplyKey)
    .setFreezeDefault(false);
}

/**
 * Create NFT mint transaction (to be signed by user)
 */
export function createMintNFTTransaction(
  tokenId: string,
  metadataCid: string
) {
  const metadata = new TextEncoder().encode(metadataCid);
  
  return new TokenMintTransaction()
    .setTokenId(tokenId)
    .setMetadata([metadata]);
}

/**
 * Create token association transaction (to be signed by user)
 */
export function createTokenAssociateTransaction(
  accountId: string,
  tokenIds: string[]
) {
  return new TokenAssociateTransaction()
    .setAccountId(accountId)
    .setTokenIds(tokenIds);
}

/**
 * Create HCS topic transaction (to be signed by user)
 */
export function createTopicTransaction(
  submitKey: string,
  memo: string
) {
  return new TopicCreateTransaction()
    .setSubmitKey(submitKey)
    .setTopicMemo(memo);
}

/**
 * Create HCS message submission transaction (to be signed by user)
 */
export function createTopicMessageTransaction(
  topicId: string,
  message: string | object
) {
  const messageString = typeof message === 'string' 
    ? message 
    : JSON.stringify(message);
  
  return new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(messageString);
}

/**
 * Sign and submit transaction using DApp connector
 * This is the main function to use for all transactions
 * 
 * @param dAppConnector - Connected DApp connector instance
 * @param transaction - Hedera transaction to sign
 * @param options - Submission options
 * @returns Transaction result with ID and receipt
 */
export async function signAndSubmitTransaction(
  dAppConnector: DAppConnector,
  transaction: any, // Hedera Transaction type
  options: SignAndSubmitOptions
): Promise<{
  success: boolean;
  transactionId?: string;
  receipt?: any;
  error?: string;
}> {
  try {
    const { supabase, userId, network = 'testnet', metadata = {} } = options;

    // Get signer from DApp connector
    const signer = dAppConnector.signers[0];
    if (!signer) {
      throw new Error('No signer available. Please connect wallet first.');
    }

    console.log('Signing transaction with wallet...');

    // Sign the transaction with user's wallet
    const signedTx = await transaction.freezeWithSigner(signer);
    
    // Convert signed transaction to bytes
    const txBytes = signedTx.toBytes();
    const base64Tx = btoa(String.fromCharCode(...txBytes));

    console.log('Transaction signed, submitting to edge function...');

    // Submit to edge function (which will submit to Hedera and log to Supabase)
    const { data, error } = await supabase.functions.invoke('hedera-mint-certificate-dapp', {
      body: {
        signedTransaction: base64Tx,
        userId,
        network,
        metadata: {
          ...metadata,
          signerAccountId: signer.getAccountId().toString(),
        },
      },
    });

    if (error) {
      throw error;
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Transaction failed');
    }

    console.log('Transaction successful:', data.transactionId);

    return {
      success: true,
      transactionId: data.transactionId,
      receipt: data.receipt,
    };
  } catch (error: any) {
    console.error('Error signing and submitting transaction:', error);
    return {
      success: false,
      error: error.message || 'Transaction failed',
    };
  }
}

/**
 * Mint certificate NFT (complete flow)
 * 
 * @param dAppConnector - Connected DApp connector
 * @param tokenId - NFT collection token ID
 * @param metadataCid - IPFS CID for certificate metadata
 * @param options - Submission options
 */
export async function mintCertificate(
  dAppConnector: DAppConnector,
  tokenId: string,
  metadataCid: string,
  options: SignAndSubmitOptions
): Promise<{
  success: boolean;
  transactionId?: string;
  serialNumber?: number;
  error?: string;
}> {
  try {
    const transaction = createMintNFTTransaction(tokenId, metadataCid);
    
    const result = await signAndSubmitTransaction(dAppConnector, transaction, {
      ...options,
      metadata: {
        ...options.metadata,
        tokenId,
        metadataCid,
      },
    });

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      transactionId: result.transactionId,
      serialNumber: result.receipt?.serials?.[0]?.toNumber(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to mint certificate',
    };
  }
}

/**
 * Associate token with account (complete flow)
 */
export async function associateToken(
  dAppConnector: DAppConnector,
  accountId: string,
  tokenId: string,
  options: SignAndSubmitOptions
): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> {
  try {
    const transaction = createTokenAssociateTransaction(accountId, [tokenId]);
    
    const result = await signAndSubmitTransaction(dAppConnector, transaction, {
      ...options,
      metadata: {
        ...options.metadata,
        accountId,
        tokenId,
      },
    });

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to associate token',
    };
  }
}

/**
 * Submit message to HCS topic (complete flow)
 */
export async function submitTopicMessage(
  dAppConnector: DAppConnector,
  topicId: string,
  message: string | object,
  options: SignAndSubmitOptions
): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> {
  try {
    const transaction = createTopicMessageTransaction(topicId, message);
    
    const result = await signAndSubmitTransaction(dAppConnector, transaction, {
      ...options,
      metadata: {
        ...options.metadata,
        topicId,
        messageType: typeof message,
      },
    });

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to submit topic message',
    };
  }
}

/**
 * Example: Complete certificate issuance flow
 */
export async function issueCertificateComplete(
  dAppConnector: DAppConnector,
  options: SignAndSubmitOptions & {
    recipientAccountId: string;
    institutionTokenId: string;
    metadataCid: string;
    autoAssociate?: boolean;
  }
): Promise<{
  success: boolean;
  mintTransactionId?: string;
  associateTransactionId?: string;
  serialNumber?: number;
  error?: string;
}> {
  try {
    const { recipientAccountId, institutionTokenId, metadataCid, autoAssociate = true } = options;

    // Step 1: Auto-associate token with recipient (if needed)
    let associateTransactionId: string | undefined;
    
    if (autoAssociate) {
      console.log('Associating token with recipient...');
      const associateResult = await associateToken(
        dAppConnector,
        recipientAccountId,
        institutionTokenId,
        options
      );

      if (!associateResult.success && !associateResult.error?.includes('already associated')) {
        throw new Error(`Failed to associate token: ${associateResult.error}`);
      }

      associateTransactionId = associateResult.transactionId;
    }

    // Step 2: Mint certificate NFT
    console.log('Minting certificate NFT...');
    const mintResult = await mintCertificate(
      dAppConnector,
      institutionTokenId,
      metadataCid,
      options
    );

    if (!mintResult.success) {
      throw new Error(`Failed to mint certificate: ${mintResult.error}`);
    }

    return {
      success: true,
      mintTransactionId: mintResult.transactionId,
      associateTransactionId,
      serialNumber: mintResult.serialNumber,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to issue certificate',
    };
  }
}
