/**
 * Create HCS Topic for CertChain Event Logging
 * This script creates a new HCS topic for logging certificate events
 */

const {
  Client,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  Hbar,
} = require("@hashgraph/sdk");

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function createHCSTopic() {
  console.log("🚀 Creating HCS Topic for CertChain Event Logging\n");

  // Load environment variables
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;
  const network = process.env.VITE_HEDERA_NETWORK || 'testnet';

  if (!operatorId || !operatorKey) {
    throw new Error('Missing HEDERA_OPERATOR_ID or HEDERA_OPERATOR_KEY in .env file');
  }

  console.log(`📋 Configuration:`);
  console.log(`   Network: ${network}`);
  console.log(`   Operator: ${operatorId}\n`);

  // Initialize Hedera client
  const client = network === 'mainnet'
    ? Client.forMainnet()
    : Client.forTestnet();

  const operatorPrivateKey = PrivateKey.fromStringDer(operatorKey);
  client.setOperator(
    AccountId.fromString(operatorId),
    operatorPrivateKey
  );

  try {
    console.log("📝 Creating HCS Topic...");

    // Create HCS topic
    const topicCreateTx = await new TopicCreateTransaction()
      .setTopicMemo("CertChain Certificate Events - Immutable audit log for certificate lifecycle")
      .setAdminKey(operatorPrivateKey)
      .setSubmitKey(operatorPrivateKey)
      .setMaxTransactionFee(new Hbar(10))
      .freezeWith(client);

    const topicCreateSign = await topicCreateTx.sign(operatorPrivateKey);
    const topicCreateSubmit = await topicCreateSign.execute(client);
    const topicCreateRx = await topicCreateSubmit.getReceipt(client);
    const topicId = topicCreateRx.topicId;

    console.log(`✅ HCS Topic Created!`);
    console.log(`\n📊 Topic Details:`);
    console.log(`   Topic ID: ${topicId}`);
    console.log(`   Memo: CertChain Certificate Events`);
    console.log(`   Admin Key: Set (operator)`);
    console.log(`   Submit Key: Set (operator)`);

    // Get explorer URL
    const explorerUrl = network === 'mainnet'
      ? `https://hashscan.io/mainnet/topic/${topicId}`
      : `https://hashscan.io/testnet/topic/${topicId}`;

    console.log(`\n🔗 Explorer Link:`);
    console.log(`   ${explorerUrl}`);

    console.log(`\n💾 Save this Topic ID to your .env file:`);
    console.log(`   VITE_HCS_LOG_TOPIC_ID=${topicId}`);

    console.log(`\n📝 Update your institution record in Supabase:`);
    console.log(`   UPDATE institutions SET hcs_topic_id = '${topicId}' WHERE id = 'your-institution-id';`);

    console.log(`\n💡 Usage Example:`);
    console.log(`   Use this topic ID when calling hedera-hcs-log function to log events.`);

    return {
      topicId: topicId.toString(),
      transactionId: topicCreateSubmit.transactionId.toString(),
      explorerUrl,
    };
  } catch (error) {
    console.error("\n❌ Error creating HCS topic:", error);
    throw error;
  } finally {
    client.close();
  }
}

// Run if called directly
if (require.main === module) {
  createHCSTopic()
    .then((result) => {
      console.log("\n✨ HCS Topic created successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Failed to create HCS topic:", error.message);
      process.exit(1);
    });
}

module.exports = { createHCSTopic };
