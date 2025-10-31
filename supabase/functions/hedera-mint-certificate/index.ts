import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
// Use ESM build from esm.sh to avoid bundling the entire npm tree (smaller deploy size)
// Import Hedera SDK from the pinned Skypack production URL to reduce bundle size
// (pinned and optimized for production as provided by the user)
import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
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
      recipientAccountId,
      institutionTokenId,
      institutionId,
      userId,
      metadataCid,
      certificateData,
      network = 'testnet',
    } = await req.json();

    if (!recipientAccountId || !metadataCid) {
      throw new Error('recipientAccountId and metadataCid are required');
    }

    if (!userId) {
      throw new Error('userId is required for transaction logging');
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate institution setup is complete before minting
    if (institutionId) {
      const { data: institution, error: instError } = await supabase
        .from('institutions')
        .select('did, hedera_account_id')
        .eq('id', institutionId)
        .single();

      if (instError) {
        throw new Error(`Failed to verify institution: ${instError.message}`);
      }

      if (!institution) {
        throw new Error('Institution not found');
      }

      // Check if institution has completed wallet and DID setup
      if (institution.did === 'pending' || institution.hedera_account_id === 'pending') {
        throw new Error('Institution setup incomplete. Please connect wallet and create DID first.');
      }

      console.log('Institution verified:', institutionId);
    }

    console.log('Minting certificate NFT for:', recipientAccountId);

    // Initialize Hedera client
    const operatorId = Deno.env.get('HEDERA_OPERATOR_ID');
    const operatorKey = Deno.env.get('HEDERA_OPERATOR_KEY');

    if (!operatorId || !operatorKey) {
      throw new Error('Hedera credentials not configured');
    }

    const client = network === 'mainnet'
      ? Client.forMainnet()
      : Client.forTestnet();

    const operatorPrivateKey = PrivateKey.fromStringDer(operatorKey);
    client.setOperator(
      AccountId.fromString(operatorId),
      operatorPrivateKey
    );

    let tokenId = institutionTokenId;

    // If no token collection exists, create one with resilient logging
    if (!tokenId) {
      console.log('Creating new NFT collection...');
      
      const tokenResult = await executeResilientTransaction(
        supabase,
        userId,
        'TOKEN_CREATE',
        async () => {
          const tokenCreateTx = await new TokenCreateTransaction()
            .setTokenName(certificateData?.institutionName || 'CertChain Certificates')
            .setTokenSymbol('CERT')
            .setTokenType(TokenType.NonFungibleUnique)
            .setDecimals(0)
            .setInitialSupply(0)
            .setTreasuryAccountId(AccountId.fromString(operatorId))
            .setSupplyType(TokenSupplyType.Infinite)
            .setSupplyKey(operatorPrivateKey)
            .setFreezeDefault(false)
            .freezeWith(client);

          const tokenCreateSign = await tokenCreateTx.sign(operatorPrivateKey);
          const tokenCreateSubmit = await tokenCreateSign.execute(client);
          const tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
          tokenId = tokenCreateRx.tokenId!.toString();

          console.log('Created token collection:', tokenId);
          return tokenCreateSubmit.transactionId.toString();
        },
        { network, enableMirrorBackup: true }
      );

      if (!tokenResult.success) {
        throw new Error(`Failed to create token collection: ${tokenResult.error}`);
      }
    }

    // Mint NFT with metadata CID and resilient logging
    console.log('Minting NFT serial...');
    
    const metadata = new TextEncoder().encode(metadataCid);
    
    let serialNumber: number | undefined;
    
    const mintResult = await executeResilientTransaction(
      supabase,
      userId,
      'TOKEN_MINT',
      async () => {
        const mintTx = await new TokenMintTransaction()
          .setTokenId(tokenId!)
          .setMetadata([metadata])
          .freezeWith(client);

        const mintSign = await mintTx.sign(operatorPrivateKey);
        const mintSubmit = await mintSign.execute(client);
        const mintRx = await mintSubmit.getReceipt(client);
        
        serialNumber = mintRx.serials[0].toNumber();
        console.log('Minted NFT serial:', serialNumber);

        return mintSubmit.transactionId.toString();
      },
      { network, enableMirrorBackup: true }
    );

    if (!mintResult.success) {
      throw new Error(`Failed to mint NFT: ${mintResult.error}`);
    }

    // Transfer NFT to recipient (optional - could be done via claim token)
    // const transferTx = await new TransferTransaction()
    //   .addNftTransfer(tokenId, serialNumber, operatorId, recipientAccountId)
    //   .freezeWith(client);
    // ...

    return new Response(
      JSON.stringify({
        success: true,
        tokenId,
        serialNumber,
        transactionId: mintResult.transactionId,
        explorerUrl: `https://hashscan.io/${network}/transaction/${mintResult.transactionId}`,
        metadataCid,
        message: 'Certificate minted successfully with resilient logging',
        resilientLogging: true,
        syncedFromMirror: mintResult.syncedFromMirror,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error minting certificate:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to mint certificate',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
