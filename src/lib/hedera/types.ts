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

export interface HederaNFTMetadata {
    certificateId: string;
    recipientEmail?: string;
    recipientName?: string;
    courseName: string;
    institutionName: string;
    issuerDid: string;
    institutionId: string;
    issuedAt: string;
    expiresAt?: string;
    skills?: string[];
    grade?: string;
    additionalData?: Record<string, any>;
}

export interface MintCertificateRequest {
    recipientAccountId: string;
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
    message: Record<string, any>;
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
    certificateData?: HederaNFTMetadata;
    fileData?: {
        content: string;
        filename: string;
        mimetype?: string;
    };
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
    metadata?: HederaNFTMetadata;
    onChainData?: any;
}
