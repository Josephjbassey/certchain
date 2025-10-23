import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Use a pinned Skypack ESM build to avoid bundling the npm package (smaller deploy size)
import {
  Client,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "https://esm.sh/@hashgraph/sdk@2.75.0/es2022/sdk.mjs";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      topicId,
      message,
      messageType,
      network = 'testnet',
      createTopic = false,
    } = await req.json();

    if (!message) {
      throw new Error('message is required');
    }

    console.log('Logging event to HCS:', messageType || 'general');

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

    let finalTopicId = topicId;

    // Create topic if requested and none exists
    if (createTopic && !topicId) {
      console.log('Creating new HCS topic...');
      
      const topicCreateTx = await new TopicCreateTransaction()
        .setSubmitKey(operatorPrivateKey)
        .setTopicMemo('CertChain Event Log')
        .freezeWith(client);

      const topicCreateSign = await topicCreateTx.sign(operatorPrivateKey);
      const topicCreateSubmit = await topicCreateSign.execute(client);
      const topicCreateRx = await topicCreateSubmit.getReceipt(client);
      finalTopicId = topicCreateRx.topicId!.toString();

      console.log('Created HCS topic:', finalTopicId);
    }

    if (!finalTopicId) {
      throw new Error('topicId is required or createTopic must be true');
    }

    // Submit message to HCS
    console.log('Submitting message to topic:', finalTopicId);

    const eventPayload = JSON.stringify({
      type: messageType || 'event',
      timestamp: new Date().toISOString(),
      data: message,
    });

    const submitTx = await new TopicMessageSubmitTransaction()
      .setTopicId(finalTopicId)
      .setMessage(eventPayload)
      .freezeWith(client);

    const submitSign = await submitTx.sign(operatorPrivateKey);
    const submitSubmit = await submitSign.execute(client);
    const submitRx = await submitSubmit.getReceipt(client);

    console.log('Message submitted to HCS');

    return new Response(
      JSON.stringify({
        success: true,
        topicId: finalTopicId,
        transactionId: submitSubmit.transactionId.toString(),
        sequenceNumber: submitRx.topicSequenceNumber?.toString(),
        explorerUrl: `https://hashscan.io/${network}/topic/${finalTopicId}`,
        message: 'Event logged to HCS successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error logging to HCS:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to log to HCS',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
