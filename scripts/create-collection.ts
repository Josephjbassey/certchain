import { createOperatorClient } from '../src/lib/hedera/client';
import { createNFTCollection } from '../src/lib/hedera/nft';
import { PrivateKey } from '@hashgraph/sdk';

async function createCollection() {
  try {
    const client = createOperatorClient();
    const supplyKey = PrivateKey.generate();

    console.log("Creating NFT collection...");
    const collection = await createNFTCollection(client, {
      name: "CertChain Certificates",
      symbol: "CERT",
      treasury: import.meta.env.VITE_HEDERA_OPERATOR_ID!,
      supplyKey: supplyKey,
      maxSupply: 1000000,
    });

    console.log("Collection Token ID:", collection.tokenId);
    console.log("Supply Key:", supplyKey.toStringDer());

    console.log("\nCollection created! Save the supply key securely.");
  } catch (error) {
    console.error("Collection creation failed:", error);
  }
}

createCollection();
