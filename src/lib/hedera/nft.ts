// src/lib/hedera/nft.ts
// ============================================
// HEDERA TOKEN SERVICE (HTS) - NFT OPERATIONS
// ============================================

import {
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenBurnTransaction,
  TokenFreezeTransaction,
  TokenAssociateTransaction,
  TokenType,
  TokenSupplyType,
  Client,
  PrivateKey,
  AccountId,
  TokenId,
  TransactionReceipt,
  Hbar,
} from "@hashgraph/sdk";
import { executeTransaction } from "./client";
import { CertificateNFTMetadata } from "./types";

/**
 * NFT Collection creation options
 */
interface CreateNFTCollectionOptions {
  name: string;
  symbol: string;
  treasury: string; // Account ID
  supplyKey: PrivateKey;
  adminKey?: PrivateKey;
  freezeKey?: PrivateKey;
  wipeKey?: PrivateKey;
  maxSupply?: number;
  customFees?: any[];
  memo?: string;
}

/**
 * Create NFT Collection
 */
export async function createNFTCollection(
  client: Client,
  options: CreateNFTCollectionOptions
): Promise<{ tokenId: string; receipt: TransactionReceipt }> {
  const transaction = new TokenCreateTransaction()
    .setTokenName(options.name)
    .setTokenSymbol(options.symbol)
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(AccountId.fromString(options.treasury))
    .setSupplyKey(options.supplyKey.publicKey)
    .setSupplyType(
      options.maxSupply ? TokenSupplyType.Finite : TokenSupplyType.Infinite
    );

  if (options.maxSupply) {
    transaction.setMaxSupply(options.maxSupply);
  }

  if (options.adminKey) {
    transaction.setAdminKey(options.adminKey.publicKey);
  }

  if (options.freezeKey) {
    transaction.setFreezeKey(options.freezeKey.publicKey);
  }

  if (options.wipeKey) {
    transaction.setWipeKey(options.wipeKey.publicKey);
  }

  if (options.customFees && options.customFees.length > 0) {
    transaction.setCustomFees(options.customFees);
  }

  if (options.memo) {
    transaction.setTokenMemo(options.memo);
  }

  // Set transaction fee
  transaction.setMaxTransactionFee(new Hbar(20));

  const receipt = await executeTransaction(transaction, client);
  const tokenId = receipt.tokenId!.toString();

  return { tokenId, receipt };
}

/**
 * Mint NFT
 */
export async function mintNFT(
  client: Client,
  tokenId: string,
  metadata: string, // IPFS CID or metadata URI
  supplyKey: PrivateKey
): Promise<{ serialNumber: number; receipt: TransactionReceipt }> {
  // Convert metadata to bytes
  const metadataBytes = new TextEncoder().encode(metadata);

  const transaction = new TokenMintTransaction()
    .setTokenId(TokenId.fromString(tokenId))
    .setMetadata([metadataBytes])
    .freezeWith(client);

  // Sign with supply key
  const signedTx = await transaction.sign(supplyKey);

  // Execute
  const response = await signedTx.execute(client);
  const receipt = await response.getReceipt(client);

  const serialNumber = receipt.serials[0].toNumber();

  return { serialNumber, receipt };
}

/**
 * Mint multiple NFTs in batch
 */
export async function mintNFTBatch(
  client: Client,
  tokenId: string,
  metadataArray: string[],
  supplyKey: PrivateKey
): Promise<{ serialNumbers: number[]; receipt: TransactionReceipt }> {
  // Convert all metadata to bytes
  const metadataBytes = metadataArray.map((metadata) =>
    new TextEncoder().encode(metadata)
  );

  const transaction = new TokenMintTransaction()
    .setTokenId(TokenId.fromString(tokenId))
    .setMetadata(metadataBytes)
    .freezeWith(client);

  // Sign with supply key
  const signedTx = await transaction.sign(supplyKey);

  // Execute
  const response = await signedTx.execute(client);
  const receipt = await response.getReceipt(client);

  const serialNumbers = receipt.serials.map((s) => s.toNumber());

  return { serialNumbers, receipt };
}

/**
 * Associate token with account (required before receiving NFT)
 */
export async function associateToken(
  client: Client,
  accountId: string,
  tokenId: string
): Promise<TransactionReceipt> {
  const transaction = new TokenAssociateTransaction()
    .setAccountId(AccountId.fromString(accountId))
    .setTokenIds([TokenId.fromString(tokenId)]);

  return await executeTransaction(transaction, client);
}

/**
 * Freeze NFT (make non-transferable / soulbound)
 */
export async function freezeNFT(
  client: Client,
  tokenId: string,
  accountId: string,
  freezeKey: PrivateKey
): Promise<TransactionReceipt> {
  const transaction = new TokenFreezeTransaction()
    .setTokenId(TokenId.fromString(tokenId))
    .setAccountId(AccountId.fromString(accountId))
    .freezeWith(client);

  // Sign with freeze key
  const signedTx = await transaction.sign(freezeKey);

  // Execute
  const response = await signedTx.execute(client);
  return await response.getReceipt(client);
}

/**
 * Burn NFT (revoke certificate)
 */
export async function burnNFT(
  client: Client,
  tokenId: string,
  serialNumber: number,
  supplyKey: PrivateKey
): Promise<TransactionReceipt> {
  const transaction = new TokenBurnTransaction()
    .setTokenId(TokenId.fromString(tokenId))
    .setSerials([serialNumber])
    .freezeWith(client);

  // Sign with supply key
  const signedTx = await transaction.sign(supplyKey);

  // Execute
  const response = await signedTx.execute(client);
  return await response.getReceipt(client);
}

/**
 * Certificate NFT Metadata Builder
 */
export interface CertificateMetadata {
  certificateId: string;
  recipientName: string;
  courseName: string;
  institutionName: string;
  issueDate: string;
  expiryDate?: string;
  fileHash: string;
  ipfsCid: string;
  hcsTopicId: string;
  hcsSequenceNumber?: number;
  additionalAttributes?: Record<string, string>;
}

export function buildCertificateNFTMetadata(
  data: CertificateMetadata
): CertificateNFTMetadata {
  const metadata: CertificateNFTMetadata = {
    name: `${data.courseName} - ${data.recipientName}`,
    description: `Certificate issued by ${data.institutionName}`,
    image: `ipfs://${data.ipfsCid}`,
    type: "certificate",
    properties: {
      certificateId: data.certificateId,
      recipientName: data.recipientName,
      courseName: data.courseName,
      institutionName: data.institutionName,
      issueDate: data.issueDate,
      expiryDate: data.expiryDate || undefined,
      fileHash: data.fileHash,
      hcsTopicId: data.hcsTopicId,
      hcsSequenceNumber: data.hcsSequenceNumber || undefined,
    },
    attributes: [
      { trait_type: "Institution", value: data.institutionName },
      { trait_type: "Course", value: data.courseName },
      { trait_type: "Issue Year", value: new Date(data.issueDate).getFullYear().toString() },
      { trait_type: "Certificate Type", value: "Completion" },
    ],
  };

  // Add additional attributes
  if (data.additionalAttributes) {
    for (const [key, value] of Object.entries(data.additionalAttributes)) {
      metadata.attributes.push({ trait_type: key, value });
    }
  }

  return metadata;
}

/**
 * Helper: Create certificate collection for institution
 */
export async function createCertificateCollection(
  client: Client,
  institutionName: string,
  treasuryAccount: string,
  supplyKey: PrivateKey,
  freezeKey?: PrivateKey
): Promise<string> {
  const { tokenId } = await createNFTCollection(client, {
    name: `${institutionName} Certificates`,
    symbol: "CERT",
    treasury: treasuryAccount,
    supplyKey: supplyKey,
    freezeKey: freezeKey,
    maxSupply: 1000000, // Or infinite
    memo: `Certificate collection for ${institutionName}`,
  });

  return tokenId;
}

/**
 * Helper: Issue soulbound certificate
 */
export async function issueSoulboundCertificate(
  client: Client,
  tokenId: string,
  recipientAccountId: string,
  metadata: string,
  supplyKey: PrivateKey,
  freezeKey?: PrivateKey
): Promise<{ serialNumber: number; transactionId: string }> {
  // Step 1: Mint NFT
  const { serialNumber, receipt } = await mintNFT(
    client,
    tokenId,
    metadata,
    supplyKey
  );

  const transactionId = receipt.transactionId.toString();

  // Step 2: Make soulbound (freeze if freeze key provided)
  if (freezeKey) {
    await freezeNFT(client, tokenId, recipientAccountId, freezeKey);
  }

  return { serialNumber, transactionId };
}

/**
 * Helper: Batch issue certificates
 */
export async function batchIssueCertificates(
  client: Client,
  tokenId: string,
  metadataArray: string[],
  supplyKey: PrivateKey
): Promise<{ serialNumbers: number[]; transactionId: string }> {
  const { serialNumbers, receipt } = await mintNFTBatch(
    client,
    tokenId,
    metadataArray,
    supplyKey
  );

  return {
    serialNumbers,
    transactionId: receipt.transactionId.toString(),
  };
}

export {
  TokenId,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenType,
  TokenSupplyType,
};
