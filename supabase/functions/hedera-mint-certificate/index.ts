/// <reference lib="deno.worker" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Use ESM build from esm.sh to avoid bundling the entire npm tree (smaller deploy size)
import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
} from "https://esm.sh/@hashgraph/sdk@2.49.0";

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
      metadataCid,
      certificateData,
      network = 'testnet',
    } = await req.json();

    if (!recipientAccountId || !metadataCid) {
      throw new Error('recipientAccountId and metadataCid are required');
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

    // If no token collection exists, create one
    if (!tokenId) {
      console.log('Creating new NFT collection...');
      
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
    }

    // Mint NFT with metadata CID
    console.log('Minting NFT serial...');
    
    const metadata = new TextEncoder().encode(metadataCid);
    
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([metadata])
      .freezeWith(client);

    const mintSign = await mintTx.sign(operatorPrivateKey);
    const mintSubmit = await mintSign.execute(client);
    const mintRx = await mintSubmit.getReceipt(client);
    
    const serialNumber = mintRx.serials[0].toNumber();
    console.log('Minted NFT serial:', serialNumber);

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
        transactionId: mintSubmit.transactionId.toString(),
        explorerUrl: `https://hashscan.io/${network}/transaction/${mintSubmit.transactionId}`,
        metadataCid,
        message: 'Certificate minted successfully',
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
