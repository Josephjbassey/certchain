/**
 * Hedera Service Types
 * Type definitions for Hedera integration
 */

export type HederaNetwork = 'testnet' | 'mainnet' | 'previewnet';

export interface HederaConfig {
    network: HederaNetwork;
    operatorId?: string;
    operatorKey?: string;
}

export interface HederaAccountId {
    accountId: string;
    network: HederaNetwork;
}

export interface HederaDID {
    did: string;
    accountId: string;
    network: HederaNetwork;
}

export interface HederaTokenInfo {
    tokenId: string;
    name: string;
    symbol: string;
    totalSupply: string;
    decimals: number;
    treasuryAccountId: string;
}

// ============================================
// HCS MESSAGE SCHEMAS
// All data stored as messages on HCS Topics
// ============================================

/**
 * Message Type: INSTITUTION_PROFILE
 */
export interface InstitutionProfile {
  type: "INSTITUTION_PROFILE";
  timestamp: number;
  version: "1.0";
  data: {
    institutionId: string; // Hedera Account ID (0.0.xxxxx)
    name: string;
    domain: string;
    contactEmail: string;
    logoIpfsCid: string; // IPFS CID for logo
    walletAddress: string; // Treasury account
    certificateCollectionId?: string; // NFT Token ID
    metadata: {
      country: string;
      establishedDate?: string;
      website: string;
    };
  };
  signature: string; // Ed25519 signature
}

/**
 * Message Type: AUTHORIZED_ISSUER
 */
export interface AuthorizedIssuer {
  type: "AUTHORIZED_ISSUER";
  timestamp: number;
  action: "ADD" | "REMOVE";
  data: {
    issuerAccountId: string; // 0.0.xxxxx
    name: string;
    email: string;
    role: "ADMIN" | "INSTRUCTOR" | "STAFF";
    permissions: string[]; // ["ISSUE", "REVOKE", "BATCH_UPLOAD"]
    addedBy: string; // Account ID of authorizer
  };
  signature: string;
}

/**
 * Message Type: CERTIFICATE_TEMPLATE
 */
export interface CertificateTemplate {
  type: "CERTIFICATE_TEMPLATE";
  timestamp: number;
  data: {
    templateId: string; // UUID
    name: string;
    category: "COMPLETION" | "ACHIEVEMENT" | "PARTICIPATION";
    ipfsCid: string; // IPFS CID for template file
    fields: {
      recipientName: boolean;
      courseName: boolean;
      issueDate: boolean;
      expiryDate: boolean;
      customFields: Record<string, string>;
    };
    createdBy: string; // Account ID
  };
  signature: string;
}

/**
 * Message Type: CERTIFICATE_ISSUED
 */
export interface CertificateIssuedEvent {
  type: "CERTIFICATE_ISSUED";
  timestamp: number;
  version: "1.0";
  data: {
    certificateId: string; // Token ID (0.0.xxxxx-serialNumber)
    tokenId: string; // NFT Token ID
    serialNumber: number;
    institutionId: string;
    issuerAccountId: string;
    recipientAccountId: string;
    recipientName: string;
    courseName: string;
    courseDescription?: string;
    certificateType: "COMPLETION" | "ACHIEVEMENT" | "PARTICIPATION";
    issueDate: string; // ISO 8601
    expiryDate?: string; // ISO 8601 or null
    fileHash: string; // SHA-256 of certificate file
    ipfsCid: string; // IPFS CID of certificate file
    metadata: {
      grade?: string;
      credits?: number;
      instructor?: string;
      additionalInfo?: Record<string, unknown>;
    };
    isSoulbound: boolean; // Non-transferable flag
    transactionId: string; // Hedera transaction ID
  };
  signature: string; // Issuer's signature
}

/**
 * Message Type: CERTIFICATE_REVOKED
 */
export interface CertificateRevokedEvent {
  type: "CERTIFICATE_REVOKED";
  timestamp: number;
  data: {
    certificateId: string;
    tokenId: string;
    serialNumber: number;
    revokedBy: string; // Account ID
    reason: string;
    revocationDate: string; // ISO 8601
    transactionId: string;
  };
  signature: string;
}

/**
 * Message Type: CERTIFICATE_VERIFIED
 */
export interface CertificateVerifiedEvent {
  type: "CERTIFICATE_VERIFIED";
  timestamp: number;
  data: {
    certificateId: string;
    verifiedBy?: string; // Account ID (optional, could be anonymous)
    verificationMethod: "QR_CODE" | "MANUAL_ENTRY" | "API";
    ipAddress?: string; // Optional, for analytics
    location?: string; // Optional geolocation
    result: "VALID" | "INVALID" | "REVOKED" | "EXPIRED";
  };
  // No signature required for public verifications
}

/**
 * Message Type: BATCH_OPERATION
 */
export interface BatchOperationEvent {
  type: "BATCH_OPERATION";
  timestamp: number;
  data: {
    batchId: string; // UUID
    operationType: "ISSUE" | "REVOKE";
    institutionId: string;
    initiatedBy: string; // Account ID
    totalCount: number;
    successCount: number;
    failureCount: number;
    certificateIds: string[]; // Array of certificate IDs
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
    startTime: string;
    endTime?: string;
  };
  signature: string;
}

/**
 * Message Type: USER_PREFERENCES
 */
export interface UserPreferences {
  type: "USER_PREFERENCES";
  timestamp: number;
  data: {
    accountId: string;
    displayName?: string;
    email?: string; // Encrypted
    notificationSettings: {
      emailOnIssue: boolean;
      emailOnRevoke: boolean;
      emailOnVerification: boolean;
    };
    privacySettings: {
      publicProfile: boolean;
      showCertificatesPublicly: boolean;
    };
  };
  encrypted: boolean; // Flag if data is encrypted
  signature: string;
}

/**
 * Message Type: DAILY_METRICS
 */
export interface DailyMetrics {
  type: "DAILY_METRICS";
  timestamp: number;
  date: string; // YYYY-MM-DD
  data: {
    totalCertificatesIssued: number;
    totalVerifications: number;
    activeInstitutions: number;
    totalRevocations: number;
    topInstitutions: Array<{
      institutionId: string;
      count: number;
    }>;
  };
}

// Generic HCS Message Wrapper
export interface HCSMessage {
  topicId: string; // 0.0.xxxxx
  consensusTimestamp: string;
  sequenceNumber: number;
  runningHash: string;
  message: string; // Base64 encoded JSON
  payerAccountId: string;
}

// Query Response from Mirror Node
export interface MirrorNodeTopicMessagesResponse {
  messages: HCSMessage[];
  links: {
    next: string | null;
  };
}

// NFT Metadata (stored on-chain)
export interface CertificateNFTMetadata {
  name: string; // e.g., "Web3 Fundamentals Certificate - John Doe"
  description: string;
  image: string; // IPFS URL (ipfs://CID)
  type: "certificate";
  properties: {
    certificateId: string;
    recipientName: string;
    courseName: string;
    institutionName: string;
    issueDate: string;
    expiryDate?: string;
    fileHash: string;
    hcsTopicId: string; // Link to HCS topic
    hcsSequenceNumber?: number; // Specific message in topic
  };
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

/**
 * SIGNATURE UTILITIES
 */
export interface SignaturePayload {
  message: unknown; // The message object to sign
  publicKey: string; // Ed25519 public key
  signature: string; // Hex-encoded signature
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface MintCertificateRequest {
    recipientAccountId: string;
    institutionId?: string;
    institutionTokenId: string;
    metadataCid: string;
    certificateData: {
        courseName: string;
        institutionName: string;
        recipientName?: string;
    };
    network?: HederaNetwork;
}

export interface MintCertificateResponse {
    success: boolean;
    tokenId: string;
    serialNumber: number;
    transactionId: string;
    explorerUrl: string;
    metadataCid: string;
    error?: string;
}

export interface HCSMessageRequest {
    topicId: string;
    messageType: string;
    message: Record<string, unknown>;
    network?: HederaNetwork;
}

export interface HCSMessageResponse {
    success: boolean;
    topicId: string;
    transactionId: string;
    sequenceNumber: string;
    consensusTimestamp?: string;
    explorerUrl: string;
    error?: string;
}

export interface CreateDIDRequest {
    userAccountId: string;
    network?: HederaNetwork;
}

export interface CreateDIDResponse {
    success: boolean;
    did: string;
    accountId: string;
    network: HederaNetwork;
    error?: string;
}

export interface PinataUploadRequest {
    type: 'metadata' | 'file';
    certificateData?: CertificateNFTMetadata;
    fileData?: {
        content: string;
        filename: string;
        mimetype?: string;
    };
    file?: File;
}

export interface PinataUploadResponse {
    success: boolean;
    ipfsHash: string;
    cid: string;
    gatewayUrl: string;
    error?: string;
}

export interface HederaTransactionError {
    code: string;
    message: string;
    transactionId?: string;
    status?: string;
}

export interface HederaTransactionReceipt {
    status: string;
    transactionId: string;
    tokenId?: string;
    serialNumbers?: number[];
    topicSequenceNumber?: string;
}

export interface TokenCreateParams {
    name: string;
    symbol: string;
    treasuryAccountId: string;
    initialSupply?: number;
    decimals?: number;
    tokenType: 'FUNGIBLE_COMMON' | 'NON_FUNGIBLE_UNIQUE';
    supplyType: 'INFINITE' | 'FINITE';
    maxSupply?: number;
    memo?: string;
    freezeDefault?: boolean;
}

export interface TopicCreateParams {
    memo: string;
    adminKey?: string;
    submitKey?: string;
}

export interface VerificationResult {
    verified: boolean;
    certificateId: string;
    tokenId?: string;
    serialNumber?: number;
    issuedBy?: string;
    issuedTo?: string;
    issuedAt?: string;
    revokedAt?: string | null;
    metadata?: CertificateNFTMetadata;
    onChainData?: unknown;
}
