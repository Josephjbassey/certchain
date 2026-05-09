// src/lib/hedera/hcs.ts
// ============================================
// HEDERA CONSENSUS SERVICE (HCS) OPERATIONS
// ============================================

import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicInfoQuery,
  TopicId,
  Client,
  PrivateKey,
  PublicKey,
  TransactionReceipt,
} from "@hashgraph/sdk";
import { executeTransaction } from "./client";

/**
 * Topic creation options
 */
interface CreateTopicOptions {
  memo?: string;
  adminKey?: PublicKey | PrivateKey;
  submitKey?: PublicKey | PrivateKey;
  autoRenewAccountId?: string;
  autoRenewPeriod?: number; // seconds
}

/**
 * Create a new HCS topic
 */
export async function createTopic(
  client: Client,
  options: CreateTopicOptions = {}
): Promise<{ topicId: string; receipt: TransactionReceipt }> {
  const transaction = new TopicCreateTransaction();

  if (options.memo) {
    transaction.setTopicMemo(options.memo);
  }

  if (options.adminKey) {
    const key =
      options.adminKey instanceof PrivateKey
        ? options.adminKey.publicKey
        : options.adminKey;
    transaction.setAdminKey(key);
  }

  if (options.submitKey) {
    const key =
      options.submitKey instanceof PrivateKey
        ? options.submitKey.publicKey
        : options.submitKey;
    transaction.setSubmitKey(key);
  }

  if (options.autoRenewAccountId) {
    transaction.setAutoRenewAccountId(options.autoRenewAccountId);
  }

  if (options.autoRenewPeriod) {
    transaction.setAutoRenewPeriod(options.autoRenewPeriod);
  }

  const receipt = await executeTransaction(transaction, client);
  const topicId = receipt.topicId!.toString();

  return { topicId, receipt };
}

/**
 * Submit message to HCS topic
 */
export async function submitMessage(
  client: Client,
  topicId: string,
  message: string | Uint8Array | object
): Promise<{ transactionId: string; receipt: TransactionReceipt }> {
  let messageBytes: Uint8Array;

  if (typeof message === "string") {
    messageBytes = new TextEncoder().encode(message);
  } else if (message instanceof Uint8Array) {
    messageBytes = message;
  } else {
    // JSON object
    const jsonString = JSON.stringify(message);
    messageBytes = new TextEncoder().encode(jsonString);
  }

  const transaction = new TopicMessageSubmitTransaction()
    .setTopicId(TopicId.fromString(topicId))
    .setMessage(messageBytes);

  const receipt = await executeTransaction(transaction, client);
  const transactionId = receipt.transactionId.toString();

  return { transactionId, receipt };
}

/**
 * Submit multiple messages in batch
 */
export async function submitMessageBatch(
  client: Client,
  topicId: string,
  messages: (string | Uint8Array | object)[]
): Promise<{ transactionIds: string[]; receipts: TransactionReceipt[] }> {
  const results = await Promise.all(
    messages.map((message) => submitMessage(client, topicId, message))
  );

  return {
    transactionIds: results.map((r) => r.transactionId),
    receipts: results.map((r) => r.receipt),
  };
}

/**
 * Get topic info
 */
export async function getTopicInfo(client: Client, topicId: string) {
  const query = new TopicInfoQuery().setTopicId(TopicId.fromString(topicId));

  const info = await query.execute(client);

  return {
    topicId: info.topicId.toString(),
    topicMemo: info.topicMemo,
    runningHash: info.runningHash,
    sequenceNumber: info.sequenceNumber,
    expirationTime: info.expirationTime,
    adminKey: info.adminKey?.toString(),
    submitKey: info.submitKey?.toString(),
    autoRenewAccount: info.autoRenewAccount?.toString(),
    autoRenewPeriod: info.autoRenewPeriod,
  };
}

/**
 * HCS Message wrapper for type safety
 */
export interface HCSMessageEnvelope<T = any> {
  type: string;
  timestamp: number;
  version: string;
  data: T;
  signature?: string;
}

/**
 * Create typed HCS message
 */
export function createHCSMessage<T>(
  type: string,
  data: T,
  signature?: string
): HCSMessageEnvelope<T> {
  return {
    type,
    timestamp: Date.now(),
    version: "1.0",
    data,
    signature,
  };
}

/**
 * Parse HCS message from bytes
 */
export function parseHCSMessage<T>(
  messageBytes: Uint8Array
): HCSMessageEnvelope<T> {
  const messageString = new TextDecoder().decode(messageBytes);
  return JSON.parse(messageString);
}

/**
 * Institution Profile Message
 */
import { InstitutionProfile } from "./types";

export async function submitInstitutionProfile(
  client: Client,
  topicId: string,
  data: InstitutionProfile["data"],
  signature: string
): Promise<string> {
  const message = createHCSMessage("INSTITUTION_PROFILE", data, signature);
  const result = await submitMessage(client, topicId, message);
  return result.transactionId;
}

/**
 * Authorized Issuer Message
 */
import { AuthorizedIssuer } from "./types";

export async function submitAuthorizedIssuer(
  client: Client,
  topicId: string,
  action: "ADD" | "REMOVE",
  data: Omit<AuthorizedIssuer["data"], "action">,
  signature: string
): Promise<string> {
  const message = createHCSMessage(
    "AUTHORIZED_ISSUER",
    { action, ...data },
    signature
  );
  const result = await submitMessage(client, topicId, message);
  return result.transactionId;
}

/**
 * Certificate Issued Event
 */
import { CertificateIssuedEvent } from "./types";

export async function submitCertificateIssued(
  client: Client,
  topicId: string,
  data: CertificateIssuedEvent["data"],
  signature: string
): Promise<string> {
  const message = createHCSMessage("CERTIFICATE_ISSUED", data, signature);
  const result = await submitMessage(client, topicId, message);
  return result.transactionId;
}

/**
 * Certificate Revoked Event
 */
import { CertificateRevokedEvent } from "./types";

export async function submitCertificateRevoked(
  client: Client,
  topicId: string,
  data: CertificateRevokedEvent["data"],
  signature: string
): Promise<string> {
  const message = createHCSMessage("CERTIFICATE_REVOKED", data, signature);
  const result = await submitMessage(client, topicId, message);
  return result.transactionId;
}

/**
 * Certificate Verified Event (public, no signature)
 */
import { CertificateVerifiedEvent } from "./types";

export async function submitCertificateVerified(
  client: Client,
  topicId: string,
  data: CertificateVerifiedEvent["data"]
): Promise<string> {
  const message = createHCSMessage("CERTIFICATE_VERIFIED", data);
  const result = await submitMessage(client, topicId, message);
  return result.transactionId;
}

/**
 * Batch Operation Event
 */
import { BatchOperationEvent } from "./types";

export async function submitBatchOperation(
  client: Client,
  topicId: string,
  data: BatchOperationEvent["data"],
  signature: string
): Promise<string> {
  const message = createHCSMessage("BATCH_OPERATION", data, signature);
  const result = await submitMessage(client, topicId, message);
  return result.transactionId;
}

/**
 * Helper: Create institution topic with proper configuration
 */
export async function createInstitutionTopic(
  client: Client,
  institutionName: string,
  adminKey: PrivateKey
): Promise<string> {
  const { topicId } = await createTopic(client, {
    memo: `Institution: ${institutionName}`,
    adminKey: adminKey,
    submitKey: adminKey,
  });

  return topicId;
}

/**
 * Helper: Create certificate events topic
 */
export async function createCertificateEventsTopic(
  client: Client,
  adminKey?: PrivateKey
): Promise<string> {
  const { topicId } = await createTopic(client, {
    memo: "Certificate Events",
    adminKey: adminKey,
    // No submitKey = anyone can submit (for public verifications)
  });

  return topicId;
}

export {
  TopicId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicInfoQuery,
};
