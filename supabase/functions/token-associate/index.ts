import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  Client,
  PrivateKey,
  AccountId,
  TokenAssociateTransaction,
} from "https://esm.sh/@hashgraph/sdk@2.75.0/es2022/sdk.mjs";
import { executeResilientTransaction } from "../_shared/hedera-resilient-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      accountId,
      tokenId,
      userId,
      network = 'testnet',
      privateKey,  // Optional: if user wants to sign themselves
    } = await req.json();

    if (!accountId || !tokenId) {
      throw new Error('accountId and tokenId are required');
    }

    if (!userId) {
      throw new Error('userId is required for transaction logging');
    }

    console.log('Associating token with account:', accountId, tokenId);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if already associated via Mirror Node
    const mirrorNodeUrl = network === 'mainnet'
      ? 'https://mainnet-public.mirrornode.hedera.com'
      : 'https://testnet.mirrornode.hedera.com';

    const accountUrl = `${mirrorNodeUrl}/api/v1/accounts/${accountId}/tokens?token.id=${tokenId}`;
    
    try {
      const checkResponse = await fetch(accountUrl);
      if (checkResponse.ok) {
        const data = await checkResponse.json();
        if (data.tokens && data.tokens.length > 0) {
          console.log('Token already associated');
          return new Response(
            JSON.stringify({
              success: true,
              alreadyAssociated: true,
              message: 'Token already associated with account',
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }
    } catch (error) {
      console.log('Could not check association status, proceeding with association');
    }

    // Initialize Hedera client
    const client = network === 'mainnet'
      ? Client.forMainnet()
      : Client.forTestnet();

    // Determine who will pay for and sign the transaction
    let signingKey: any;
    let payerAccountId: string;

    if (privateKey) {
      // User provided their own private key (not recommended for production)
      signingKey = PrivateKey.fromStringDer(privateKey);
      payerAccountId = accountId;
    } else {
      // Use operator account (platform pays for association)
      const operatorId = Deno.env.get('HEDERA_OPERATOR_ID');
      const operatorKey = Deno.env.get('HEDERA_OPERATOR_KEY');

      if (!operatorId || !operatorKey) {
        throw new Error('Hedera credentials not configured');
      }

      signingKey = PrivateKey.fromStringDer(operatorKey);
      payerAccountId = operatorId;
      
      client.setOperator(
        AccountId.fromString(operatorId),
        signingKey
      );
    }

    // Create and execute token association transaction with resilient logging
    console.log('Creating token association transaction...');
    
    const associateResult = await executeResilientTransaction(
      supabase,
      userId,
      'TOKEN_ASSOCIATE',
      async () => {
        const associateTx = await new TokenAssociateTransaction()
          .setAccountId(AccountId.fromString(accountId))
          .setTokenIds([tokenId])
          .freezeWith(client);

        // Sign with the account that will be associated
        // Note: In production, the user's wallet should sign this
        const signedTx = await associateTx.sign(signingKey);
        
        const txResponse = await signedTx.execute(client);
        const receipt = await txResponse.getReceipt(client);

        console.log('Token association successful');
        return txResponse.transactionId.toString();
      },
      { network, enableMirrorBackup: true }
    );

    if (!associateResult.success) {
      throw new Error(`Failed to associate token: ${associateResult.error}`);
    }

    const explorerUrl = network === 'mainnet'
      ? `https://hashscan.io/mainnet/transaction/${associateResult.transactionId}`
      : `https://hashscan.io/testnet/transaction/${associateResult.transactionId}`;

    return new Response(
      JSON.stringify({
        success: true,
        alreadyAssociated: false,
        transactionId: associateResult.transactionId,
        accountId,
        tokenId,
        explorerUrl,
        message: 'Token successfully associated with account with resilient logging',
        resilientLogging: true,
        syncedFromMirror: associateResult.syncedFromMirror,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error associating token:', error);
    
    // Check for specific error cases
    let errorMessage = error.message || 'Failed to associate token';
    
    if (errorMessage.includes('TOKEN_ALREADY_ASSOCIATED')) {
      return new Response(
        JSON.stringify({
          success: true,
          alreadyAssociated: true,
          message: 'Token already associated with account',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
