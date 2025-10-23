/**
 * Deploy All Hedera Resources
 * Creates both NFT collection and HCS topic in one script
 */

const { createNFTCollection } = require('./create-nft-collection.cjs');
const { createHCSTopic } = require('./create-hcs-topic.cjs');

async function deployAll() {
  console.log("🚀 CertChain Hedera Deployment\n");
  console.log("═".repeat(60));
  console.log("\nThis script will create:");
  console.log("  1. HTS NFT Collection Token (for certificates)");
  console.log("  2. HCS Topic (for event logging)\n");
  console.log("═".repeat(60));
  console.log("");

  const results = {
    nftCollection: null,
    hcsTopic: null,
  };

  try {
    // Step 1: Create NFT Collection
    console.log("\n🎨 Step 1/2: Creating NFT Collection Token\n");
    results.nftCollection = await createNFTCollection();

    console.log("\n" + "─".repeat(60) + "\n");

    // Step 2: Create HCS Topic
    console.log("📡 Step 2/2: Creating HCS Topic\n");
    results.hcsTopic = await createHCSTopic();

    // Summary
    console.log("\n" + "═".repeat(60));
    console.log("\n✨ Deployment Complete!\n");
    console.log("📋 Summary:\n");
    console.log("NFT Collection:");
    console.log(`  Token ID: ${results.nftCollection.tokenId}`);
    console.log(`  Explorer: ${results.nftCollection.explorerUrl}\n`);
    console.log("HCS Topic:");
    console.log(`  Topic ID: ${results.hcsTopic.topicId}`);
    console.log(`  Explorer: ${results.hcsTopic.explorerUrl}\n`);

    console.log("═".repeat(60));
    console.log("\n📝 Add these to your .env file:\n");
    console.log(`VITE_COLLECTION_TOKEN_ID=${results.nftCollection.tokenId}`);
    console.log(`VITE_HCS_LOG_TOPIC_ID=${results.hcsTopic.topicId}`);

    console.log("\n💾 Update your database:\n");
    console.log(`UPDATE institutions SET`);
    console.log(`  collection_token_id = '${results.nftCollection.tokenId}',`);
    console.log(`  hcs_topic_id = '${results.hcsTopic.topicId}'`);
    console.log(`WHERE id = 'your-institution-id';`);

    console.log("\n✅ All resources deployed successfully!");

    return results;
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);

    if (results.nftCollection) {
      console.log("\n⚠️  NFT Collection was created:");
      console.log(`   Token ID: ${results.nftCollection.tokenId}`);
    }

    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  deployAll()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Deployment failed");
      process.exit(1);
    });
}

module.exports = { deployAll };
