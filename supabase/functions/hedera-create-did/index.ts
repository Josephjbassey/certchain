import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userAccountId, network = 'testnet' } = await req.json();

    if (!userAccountId) {
      throw new Error('userAccountId is required');
    }

    console.log('Creating DID for account:', userAccountId);

    // Validate Hedera account ID format (0.0.xxxxx)
    if (!/^\d+\.\d+\.\d+$/.test(userAccountId)) {
      throw new Error('Invalid Hedera account ID format. Expected: 0.0.xxxxx');
    }

    // Create DID using Hedera DID method
    // Format: did:hedera:<network>:<accountId>
    const did = `did:hedera:${network}:${userAccountId}`;

    console.log('Created DID:', did);

    // In production, you would:
    // 1. Publish DID document to HCS topic
    // 2. Store DID document on IPFS
    // 3. Register DID in the DID registry

    return new Response(
      JSON.stringify({
        success: true,
        did,
        accountId: userAccountId,
        network,
        message: 'DID created successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error creating DID:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create DID',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
