import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { Client } from "https://esm.sh/@hashgraph/sdk@2.75.0/es2022/sdk.mjs";
import { processDAppTransaction, type SignedTransactionPayload } from "../_shared/hedera-dapp-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Hedera Mint Certificate (DApp Mode)
 * 
 * This edge function receives a PRE-SIGNED transaction from the user's wallet
 * and submits it to the Hedera network with resilient logging.
 * 
 * Flow:
 * 1. Frontend: User creates and signs transaction with their wallet
 * 2. Frontend: Sends signed transaction bytes to this function
 * 3. Backend: This function submits to Hedera
 * 4. Backend: Logs to Supabase with mirror node backup
 * 
 * This ensures the user controls their private keys (true DApp)
 * while still getting the benefits of server-side logging and monitoring.
 */

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      signedTransaction,
      userId,
      network = 'testnet',
      metadata = {},
    } = await req.json();

    if (!signedTransaction) {
      throw new Error('signedTransaction is required (base64 encoded signed transaction bytes)');
    }

    if (!userId) {
      throw new Error('userId is required for transaction logging');
    }

    console.log('Processing DApp mint transaction for user:', userId);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize Hedera client (no operator needed since transaction is pre-signed)
    const client = network === 'mainnet'
      ? Client.forMainnet()
      : Client.forTestnet();

    // Process the signed transaction
    const payload: SignedTransactionPayload = {
      signedTransactionBytes: signedTransaction,
      signerAccountId: metadata.signerAccountId || 'unknown',
      transactionType: 'TOKEN_MINT',
    };

    const result = await processDAppTransaction(
      supabase,
      client,
      payload,
      userId,
      network
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to process transaction');
    }

    const explorerUrl = network === 'mainnet'
      ? `https://hashscan.io/mainnet/transaction/${result.transactionId}`
      : `https://hashscan.io/testnet/transaction/${result.transactionId}`;

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: result.transactionId,
        receipt: result.receipt,
        explorerUrl,
        metadata: {
          ...metadata,
          tokenId: metadata.tokenId,
          serialNumber: result.receipt?.serials?.[0]?.toNumber(),
        },
        message: 'Certificate minted successfully (DApp mode)',
        dappMode: true,
        syncedFromMirror: result.syncedFromMirror,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error processing mint transaction:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process mint transaction',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
