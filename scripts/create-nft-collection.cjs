/**
 * Create HTS NFT Collection Token for CertChain Certificates
 * This script creates a new NFT collection that will be used to mint certificates
 */

const {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  Hbar,
} = require("@hashgraph/sdk");

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function createNFTCollection() {
  console.log("🚀 Creating HTS NFT Collection for CertChain Certificates\n");

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
    console.log("📝 Creating NFT Collection Token...");

    // Create NFT collection
    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName("CertChain Certificates")
      .setTokenSymbol("CERT")
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Infinite)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(operatorId)
      .setSupplyKey(operatorPrivateKey)
      .setAdminKey(operatorPrivateKey)
      .setMaxTransactionFee(new Hbar(50))
      .setTokenMemo("CertChain Certificate NFT Collection - Decentralized certificates on Hedera")
      .freezeWith(client);

    const tokenCreateSign = await tokenCreateTx.sign(operatorPrivateKey);
    const tokenCreateSubmit = await tokenCreateSign.execute(client);
    const tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
    const tokenId = tokenCreateRx.tokenId;

    console.log(`✅ NFT Collection Created!`);
    console.log(`\n📊 Collection Details:`);
    console.log(`   Token ID: ${tokenId}`);
    console.log(`   Name: CertChain Certificates`);
    console.log(`   Symbol: CERT`);
    console.log(`   Type: NFT (Non-Fungible Unique)`);
    console.log(`   Supply: Infinite`);
    console.log(`   Treasury: ${operatorId}`);

    // Get transaction details
    const explorerUrl = network === 'mainnet'
      ? `https://hashscan.io/mainnet/token/${tokenId}`
      : `https://hashscan.io/testnet/token/${tokenId}`;

    console.log(`\n🔗 Explorer Link:`);
    console.log(`   ${explorerUrl}`);

    console.log(`\n💾 Save this Token ID to your .env file:`);
    console.log(`   VITE_COLLECTION_TOKEN_ID=${tokenId}`);

    console.log(`\n📝 Update your institution record in Supabase:`);
    console.log(`   UPDATE institutions SET collection_token_id = '${tokenId}' WHERE id = 'your-institution-id';`);

    return {
      tokenId: tokenId.toString(),
      transactionId: tokenCreateSubmit.transactionId.toString(),
      explorerUrl,
    };
  } catch (error) {
    console.error("\n❌ Error creating NFT collection:", error);
    throw error;
  } finally {
    client.close();
  }
}

// Run if called directly
if (require.main === module) {
  createNFTCollection()
    .then((result) => {
      console.log("\n✨ NFT Collection created successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Failed to create NFT collection:", error.message);
      process.exit(1);
    });
}

module.exports = { createNFTCollection };
