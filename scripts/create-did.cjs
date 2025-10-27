/**
 * Create Hedera DID for CertChain Institution
 * This script creates a Decentralized Identifier (DID) for an institution
 * Format: did:hedera:<network>:<accountId>
 */

const {
  Client,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");

const crypto = require("crypto");
require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

async function createDID() {
  console.log("🆔 Creating Hedera DID for Institution\n");

  // Load environment variables
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;
  const network = process.env.VITE_HEDERA_NETWORK || "testnet";

  if (!operatorId || !operatorKey) {
    throw new Error(
      "Missing HEDERA_OPERATOR_ID or HEDERA_OPERATOR_KEY in .env file"
    );
  }

  // Get institution account ID from command line or use operator ID as default
  const institutionAccountId = process.argv[2] || operatorId;

  console.log(`📋 Configuration:`);
  console.log(`   Network: ${network}`);
  console.log(`   Operator: ${operatorId}`);
  console.log(`   Institution Account: ${institutionAccountId}\n`);

  // Initialize Hedera client
  const client =
    network === "mainnet" ? Client.forMainnet() : Client.forTestnet();

  const operatorPrivateKey = PrivateKey.fromStringDer(operatorKey);
  client.setOperator(AccountId.fromString(operatorId), operatorPrivateKey);

  try {
    // Step 1: Create DID identifier
    const did = `did:hedera:${network}:${institutionAccountId}`;
    console.log(`✅ DID Created: ${did}\n`);

    // Step 2: Create DID Document (W3C compliant)
    const didDocument = {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1",
      ],
      id: did,
      verificationMethod: [
        {
          id: `${did}#key-1`,
          type: "Ed25519VerificationKey2020",
          controller: did,
          publicKeyMultibase: generatePublicKeyMultibase(institutionAccountId),
        },
      ],
      authentication: [`${did}#key-1`],
      assertionMethod: [`${did}#key-1`],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      service: [
        {
          id: `${did}#certchain`,
          type: "CertificateIssuerService",
          serviceEndpoint: `https://certchain.hedera.com/institutions/${institutionAccountId}`,
        },
      ],
    };

    console.log("📄 DID Document Created:");
    console.log(JSON.stringify(didDocument, null, 2));
    console.log();

    // Step 3: Create HCS Topic for DID Document
    console.log("📝 Creating HCS Topic for DID Document...");

    const topicCreateTx = await new TopicCreateTransaction()
      .setSubmitKey(operatorPrivateKey)
      .setTopicMemo(`DID Document for ${did}`)
      .freezeWith(client);

    const topicCreateSign = await topicCreateTx.sign(operatorPrivateKey);
    const topicCreateSubmit = await topicCreateSign.execute(client);
    const topicCreateRx = await topicCreateSubmit.getReceipt(client);
    const topicId = topicCreateRx.topicId;

    console.log(`✅ HCS Topic Created: ${topicId}`);

    // Step 4: Publish DID Document to HCS
    console.log("📤 Publishing DID Document to HCS...");

    const didDocumentMessage = JSON.stringify({
      operation: "create",
      did: did,
      didDocument: didDocument,
      timestamp: new Date().toISOString(),
    });

    const submitTx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(didDocumentMessage)
      .freezeWith(client);

    const submitSign = await submitTx.sign(operatorPrivateKey);
    const submitSubmit = await submitSign.execute(client);
    const submitRx = await submitSubmit.getReceipt(client);

    console.log(`✅ DID Document Published to HCS`);

    // Generate explorer URLs
    const topicExplorerUrl =
      network === "mainnet"
        ? `https://hashscan.io/mainnet/topic/${topicId}`
        : `https://hashscan.io/testnet/topic/${topicId}`;

    const transactionExplorerUrl =
      network === "mainnet"
        ? `https://hashscan.io/mainnet/transaction/${submitSubmit.transactionId}`
        : `https://hashscan.io/testnet/transaction/${submitSubmit.transactionId}`;

    // Step 5: Generate DID Document Hash for verification
    const didDocumentHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(didDocument))
      .digest("hex");

    console.log(`\n📊 DID Creation Summary:`);
    console.log(`   DID: ${did}`);
    console.log(`   DID Document Topic: ${topicId}`);
    console.log(`   Document Hash (SHA-256): ${didDocumentHash}`);
    console.log(`   Transaction ID: ${submitSubmit.transactionId}`);

    console.log(`\n🔗 Explorer Links:`);
    console.log(`   Topic: ${topicExplorerUrl}`);
    console.log(`   Transaction: ${transactionExplorerUrl}`);

    console.log(`\n💾 Update your database with this DID:`);
    console.log(`   UPDATE institutions SET`);
    console.log(`     did = '${did}',`);
    console.log(`     hcs_topic_id = '${topicId}'`);
    console.log(`   WHERE hedera_account_id = '${institutionAccountId}';`);

    console.log(`\n📝 DID Resolution:`);
    console.log(`   To resolve this DID, query HCS topic: ${topicId}`);
    console.log(
      `   Verification: Compare document hash with ${didDocumentHash}`
    );

    return {
      did,
      didDocument,
      didDocumentHash,
      topicId: topicId.toString(),
      transactionId: submitSubmit.transactionId.toString(),
      topicExplorerUrl,
      transactionExplorerUrl,
    };
  } catch (error) {
    console.error("\n❌ Error creating DID:", error);
    throw error;
  } finally {
    client.close();
  }
}

/**
 * Generate a multibase-encoded public key representation
 * In production, this should use the actual public key from the Hedera account
 */
function generatePublicKeyMultibase(accountId) {
  // This is a placeholder. In production, retrieve the actual public key
  // from the Hedera account using the Mirror Node API or account query
  const placeholder = crypto
    .createHash("sha256")
    .update(accountId)
    .digest("base64");

  return `z${placeholder.replace(/[^a-zA-Z0-9]/g, "")}`;
}

// Run the script
if (require.main === module) {
  createDID()
    .then((result) => {
      console.log("\n✅ DID Creation Complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ DID Creation Failed:", error.message);
      process.exit(1);
    });
}

module.exports = { createDID };
