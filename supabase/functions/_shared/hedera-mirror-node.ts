/**
 * Hedera Mirror Node Integration
 * 
 * Provides resilient transaction logging by fetching data from Hedera Mirror Nodes.
 * Used as a backup when direct transaction logging fails or for historical data sync.
 * 
 * Mirror Node REST API: https://docs.hedera.com/hedera/sdks-and-apis/rest-api
 */

const MIRROR_NODE_URLS = {
  mainnet: 'https://mainnet-public.mirrornode.hedera.com',
  testnet: 'https://testnet.mirrornode.hedera.com',
  previewnet: 'https://previewnet.mirrornode.hedera.com',
};

export interface MirrorTransaction {
  transaction_id: string;
  consensus_timestamp: string;
  transaction_hash: string;
  charged_tx_fee: number;
  max_fee: string;
  memo_base64: string;
  name: string;
  node: string;
  result: string;
  scheduled: boolean;
  entity_id: string;
  valid_start_timestamp: string;
  valid_duration_seconds: number;
  transfers: Array<{
    account: string;
    amount: number;
    is_approval: boolean;
  }>;
}

export interface MirrorTopicMessage {
  consensus_timestamp: string;
  topic_id: string;
  message: string;
  running_hash: string;
  running_hash_version: number;
  sequence_number: number;
  chunk_info?: {
    initial_transaction_id: string;
    number: number;
    total: number;
  };
  payer_account_id: string;
}

export interface MirrorNodeOptions {
  network?: 'mainnet' | 'testnet' | 'previewnet';
  timeout?: number;
}

/**
 * Get the base URL for the Mirror Node based on network
 */
export function getMirrorNodeUrl(network: 'mainnet' | 'testnet' | 'previewnet' = 'testnet'): string {
  return MIRROR_NODE_URLS[network];
}

/**
 * Fetch transaction details from Mirror Node
 * @param transactionId - Hedera transaction ID (e.g., "0.0.12345@1234567890.000000000")
 * @param options - Mirror node options
 */
export async function getTransaction(
  transactionId: string,
  options: MirrorNodeOptions = {}
): Promise<MirrorTransaction | null> {
  const { network = 'testnet', timeout = 30000 } = options;
  const baseUrl = getMirrorNodeUrl(network);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(
      `${baseUrl}/api/v1/transactions/${transactionId}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Transaction not found on mirror node: ${transactionId}`);
        return null;
      }
      throw new Error(`Mirror node error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.transactions || data.transactions.length === 0) {
      return null;
    }

    return data.transactions[0];
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Mirror node request timeout');
    } else {
      console.error('Error fetching transaction from mirror node:', error);
    }
    return null;
  }
}

/**
 * Fetch topic messages from Mirror Node
 * @param topicId - Topic ID (e.g., "0.0.12345")
 * @param options - Query options
 */
export async function getTopicMessages(
  topicId: string,
  options: MirrorNodeOptions & {
    limit?: number;
    sequenceNumber?: number;
    timestamp?: string;
  } = {}
): Promise<MirrorTopicMessage[]> {
  const { network = 'testnet', timeout = 30000, limit = 100 } = options;
  const baseUrl = getMirrorNodeUrl(network);

  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    if (options.sequenceNumber) {
      params.append('sequencenumber', options.sequenceNumber.toString());
    }

    if (options.timestamp) {
      params.append('timestamp', options.timestamp);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(
      `${baseUrl}/api/v1/topics/${topicId}/messages?${params.toString()}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Mirror node error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error: any) {
    console.error('Error fetching topic messages from mirror node:', error);
    return [];
  }
}

/**
 * Fetch account transactions from Mirror Node
 * @param accountId - Account ID (e.g., "0.0.12345")
 * @param options - Query options
 */
export async function getAccountTransactions(
  accountId: string,
  options: MirrorNodeOptions & {
    limit?: number;
    transactionType?: string;
    timestamp?: string;
  } = {}
): Promise<MirrorTransaction[]> {
  const { network = 'testnet', timeout = 30000, limit = 100 } = options;
  const baseUrl = getMirrorNodeUrl(network);

  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    if (options.transactionType) {
      params.append('transactiontype', options.transactionType);
    }

    if (options.timestamp) {
      params.append('timestamp', options.timestamp);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(
      `${baseUrl}/api/v1/accounts/${accountId}/transactions?${params.toString()}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Mirror node error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.transactions || [];
  } catch (error: any) {
    console.error('Error fetching account transactions from mirror node:', error);
    return [];
  }
}

/**
 * Wait for transaction to appear on Mirror Node
 * Mirror nodes have a delay (typically 2-5 seconds) before transactions appear
 * 
 * @param transactionId - Transaction ID to wait for
 * @param options - Options including max retries and delay
 */
export async function waitForTransaction(
  transactionId: string,
  options: MirrorNodeOptions & {
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): Promise<MirrorTransaction | null> {
  const { maxRetries = 10, retryDelay = 2000, network = 'testnet' } = options;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const transaction = await getTransaction(transactionId, { network });
    
    if (transaction) {
      return transaction;
    }

    // Wait before retry
    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  console.warn(`Transaction ${transactionId} not found after ${maxRetries} attempts`);
  return null;
}

/**
 * Sync transaction to Supabase from Mirror Node
 * This is the backup mechanism when direct logging fails
 * 
 * @param supabaseClient - Supabase client instance
 * @param transactionId - Transaction ID to sync
 * @param userId - User ID who initiated the transaction
 * @param transactionType - Type of transaction
 */
export async function syncTransactionFromMirrorNode(
  supabaseClient: any,
  transactionId: string,
  userId: string,
  transactionType: string,
  network: 'mainnet' | 'testnet' | 'previewnet' = 'testnet'
): Promise<boolean> {
  try {
    // Wait for transaction to appear on mirror node
    console.log(`Syncing transaction ${transactionId} from mirror node...`);
    
    const mirrorTx = await waitForTransaction(transactionId, {
      network,
      maxRetries: 15,
      retryDelay: 2000,
    });

    if (!mirrorTx) {
      console.error(`Failed to fetch transaction ${transactionId} from mirror node`);
      return false;
    }

    // Check if transaction already exists in database
    const { data: existing } = await supabaseClient
      .from('transaction_logs')
      .select('id')
      .eq('transaction_id', transactionId)
      .maybeSingle();

    if (existing) {
      console.log(`Transaction ${transactionId} already synced`);
      return true;
    }

    // Insert transaction log
    const { error } = await supabaseClient
      .from('transaction_logs')
      .insert({
        user_id: userId,
        transaction_id: transactionId,
        transaction_type: transactionType,
        status: mirrorTx.result === 'SUCCESS' ? 'success' : 'failed',
        transaction_hash: mirrorTx.transaction_hash,
        metadata: {
          consensus_timestamp: mirrorTx.consensus_timestamp,
          charged_tx_fee: mirrorTx.charged_tx_fee,
          memo: mirrorTx.memo_base64,
          node: mirrorTx.node,
          result: mirrorTx.result,
          synced_from_mirror: true,
          synced_at: new Date().toISOString(),
        },
      });

    if (error) {
      console.error('Error inserting transaction log:', error);
      return false;
    }

    console.log(`Successfully synced transaction ${transactionId} from mirror node`);
    return true;
  } catch (error) {
    console.error('Error syncing transaction from mirror node:', error);
    return false;
  }
}

/**
 * Batch sync multiple transactions from Mirror Node
 * Useful for recovering from extended downtime
 * 
 * @param supabaseClient - Supabase client instance
 * @param accountId - Account ID to sync transactions for
 * @param userId - User ID
 * @param since - Timestamp to sync from (ISO format)
 */
export async function batchSyncTransactions(
  supabaseClient: any,
  accountId: string,
  userId: string,
  since?: string,
  network: 'mainnet' | 'testnet' | 'previewnet' = 'testnet'
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  try {
    console.log(`Batch syncing transactions for account ${accountId}...`);

    // Fetch transactions from mirror node
    const transactions = await getAccountTransactions(accountId, {
      network,
      limit: 100,
      timestamp: since ? `gte:${since}` : undefined,
    });

    console.log(`Found ${transactions.length} transactions to sync`);

    // Sync each transaction
    for (const tx of transactions) {
      const success = await syncTransactionFromMirrorNode(
        supabaseClient,
        tx.transaction_id,
        userId,
        tx.name || 'UNKNOWN',
        network
      );

      if (success) {
        synced++;
      } else {
        failed++;
      }
    }

    console.log(`Batch sync complete: ${synced} synced, ${failed} failed`);
  } catch (error) {
    console.error('Error during batch sync:', error);
  }

  return { synced, failed };
}

/**
 * Decode base64 message from topic
 */
export function decodeTopicMessage(base64Message: string): string {
  try {
    return atob(base64Message);
  } catch (error) {
    console.error('Error decoding topic message:', error);
    return base64Message;
  }
}

/**
 * Parse Hedera transaction ID to extract components
 */
export function parseTransactionId(transactionId: string): {
  accountId: string;
  validStartSeconds: string;
  validStartNanos: string;
} | null {
  try {
    const match = transactionId.match(/^(\d+\.\d+\.\d+)@(\d+)\.(\d+)$/);
    if (!match) return null;

    return {
      accountId: match[1],
      validStartSeconds: match[2],
      validStartNanos: match[3],
    };
  } catch (error) {
    return null;
  }
}
