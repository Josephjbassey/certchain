import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
// Use a pinned Skypack ESM build to avoid bundling the npm package (smaller deploy size)
import {
  Client,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "https://esm.sh/@hashgraph/sdk@2.75.0/es2022/sdk.mjs";
import { executeResilientTransaction } from "../_shared/hedera-resilient-client.ts";
import { getTopicMessages, decodeTopicMessage } from "../_shared/hedera-mirror-node.ts";

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
      userId,
      network = 'testnet',
      createTopic = false,
      syncFromMirror = false,
    } = await req.json();

    if (!message && !syncFromMirror) {
      throw new Error('message is required');
    }

    if (!userId) {
      throw new Error('userId is required for transaction logging');
    }

    console.log('Logging event to HCS:', messageType || 'general');

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle mirror node sync request
    if (syncFromMirror && topicId) {
      console.log('Syncing topic messages from mirror node...');
      const messages = await getTopicMessages(topicId, {
        network,
        limit: 100,
      });

      // Store messages in database
      const syncedMessages = [];
      for (const msg of messages) {
        const decodedMessage = decodeTopicMessage(msg.message);
        syncedMessages.push({
          topic_id: msg.topic_id,
          sequence_number: msg.sequence_number,
          consensus_timestamp: msg.consensus_timestamp,
          message: decodedMessage,
          payer_account_id: msg.payer_account_id,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          messagesCount: messages.length,
          messages: syncedMessages,
          message: 'Topic messages synced from mirror node',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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

    // Create topic if requested and none exists with resilient logging
    if (createTopic && !topicId) {
      console.log('Creating new HCS topic...');
      
      const topicResult = await executeResilientTransaction(
        supabase,
        userId,
        'TOPIC_CREATE',
        async () => {
          const topicCreateTx = await new TopicCreateTransaction()
            .setSubmitKey(operatorPrivateKey)
            .setTopicMemo('CertChain Event Log')
            .freezeWith(client);

          const topicCreateSign = await topicCreateTx.sign(operatorPrivateKey);
          const topicCreateSubmit = await topicCreateSign.execute(client);
          const topicCreateRx = await topicCreateSubmit.getReceipt(client);
          finalTopicId = topicCreateRx.topicId!.toString();

          console.log('Created HCS topic:', finalTopicId);
          return topicCreateSubmit.transactionId.toString();
        },
        { network, enableMirrorBackup: true }
      );

      if (!topicResult.success) {
        throw new Error(`Failed to create topic: ${topicResult.error}`);
      }
    }

    if (!finalTopicId) {
      throw new Error('topicId is required or createTopic must be true');
    }

    // Submit message to HCS with resilient logging
    console.log('Submitting message to topic:', finalTopicId);

    const eventPayload = JSON.stringify({
      type: messageType || 'event',
      timestamp: new Date().toISOString(),
      data: message,
    });

    let sequenceNumber: string | undefined;
    
    const submitResult = await executeResilientTransaction(
      supabase,
      userId,
      'TOPIC_MESSAGE_SUBMIT',
      async () => {
        const submitTx = await new TopicMessageSubmitTransaction()
          .setTopicId(finalTopicId!)
          .setMessage(eventPayload)
          .freezeWith(client);

        const submitSign = await submitTx.sign(operatorPrivateKey);
        const submitSubmit = await submitSign.execute(client);
        const submitRx = await submitSubmit.getReceipt(client);
        
        sequenceNumber = submitRx.topicSequenceNumber?.toString();
        console.log('Message submitted to HCS');

        return submitSubmit.transactionId.toString();
      },
      { network, enableMirrorBackup: true }
    );

    if (!submitResult.success) {
      throw new Error(`Failed to submit message: ${submitResult.error}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        topicId: finalTopicId,
        transactionId: submitResult.transactionId,
        sequenceNumber,
        explorerUrl: `https://hashscan.io/${network}/topic/${finalTopicId}`,
        message: 'Event logged to HCS successfully with resilient logging',
        resilientLogging: true,
        syncedFromMirror: submitResult.syncedFromMirror,
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
