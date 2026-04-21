import { supabase } from "@/integrations/supabase/client";
import type {
    CreateDIDRequest,
    CreateDIDResponse,
    MintCertificateRequest,
    MintCertificateResponse,
    HCSMessageRequest,
    HCSMessageResponse,
    PinataUploadRequest,
    PinataUploadResponse,
    HederaDID,
    VerificationResult,
} from "./types";
import { getHederaConfig, getExplorerUrl } from "./config";
import { retryOperation, parseHederaError, HederaServiceError } from "./errors";

/**
 * Hedera Service
 * Main service for interacting with Hedera via Supabase Edge Functions
 */

export class HederaService {
    private static instance: HederaService;

    private constructor() { }

    static getInstance(): HederaService {
        if (!HederaService.instance) {
            HederaService.instance = new HederaService();
        }
        return HederaService.instance;
    }

    /**
     * Create a Decentralized Identifier (DID) for a Hedera account
     */
    async createDID(request: CreateDIDRequest): Promise<CreateDIDResponse> {
        return retryOperation(async () => {
            const { network } = getHederaConfig();

            console.log("Creating DID with request:", {
                ...request,
                network: request.network || network,
            });

            const { data, error } = await supabase.functions.invoke(
                "hedera-create-did",
                {
                    body: {
                        ...request,
                        network: request.network || network,
                    },
                }
            );

            console.log("DID creation response:", { data, error });

            if (error) {
                console.error("Supabase function invocation error:", error);
                throw parseHederaError(error);
            }

            if (!data) {
                throw new HederaServiceError(
                    "No response received from DID creation function",
                    "NO_RESPONSE"
                );
            }

            if (!data.success) {
                throw new HederaServiceError(
                    data.error || data.message || "Failed to create DID",
                    "DID_CREATION_FAILED"
                );
            }

            return data;
        });
    }

    /**
     * Mint a certificate NFT on Hedera Token Service
     */
    async mintCertificate(
        request: MintCertificateRequest
    ): Promise<MintCertificateResponse> {
        return retryOperation(async () => {
            const { network } = getHederaConfig();

            console.log("Minting certificate with request:", {
                ...request,
                network: request.network || network,
            });

            const { data, error } = await supabase.functions.invoke(
                "hedera-mint-certificate",
                {
                    body: {
                        ...request,
                        network: request.network || network,
                    },
                }
            );

            console.log("Mint certificate response:", { data, error });

            if (error) {
                console.error("Supabase function invocation error:", error);
                throw parseHederaError(error);
            }

            if (!data) {
                throw new HederaServiceError(
                    "No response received from mint function",
                    "NO_RESPONSE"
                );
            }

            if (!data.success) {
                throw new HederaServiceError(
                    data.error || data.message || "Failed to mint certificate",
                    "MINT_FAILED"
                );
            }

            return data;
        });
    }

    /**
     * Log an event to Hedera Consensus Service
     */
    async logToHCS(request: HCSMessageRequest): Promise<HCSMessageResponse> {
        return retryOperation(async () => {
            const { network } = getHederaConfig();

            console.log("Logging to HCS with request:", {
                ...request,
                network: request.network || network,
            });

            const { data, error } = await supabase.functions.invoke(
                "hedera-hcs-log",
                {
                    body: {
                        ...request,
                        network: request.network || network,
                    },
                }
            );

            console.log("HCS log response:", { data, error });

            if (error) {
                console.error("Supabase function invocation error:", error);
                throw parseHederaError(error);
            }

            if (!data) {
                throw new HederaServiceError(
                    "No response received from HCS log function",
                    "NO_RESPONSE"
                );
            }

            if (!data.success) {
                throw new HederaServiceError(
                    data.error || data.message || "Failed to log to HCS",
                    "HCS_LOG_FAILED"
                );
            }

            return data;
        });
    }

    /**
     * Upload metadata or file to IPFS via Pinata
     */
    async uploadToIPFS(
        request: PinataUploadRequest
    ): Promise<PinataUploadResponse> {
        return retryOperation(async () => {
            const { data, error } = await supabase.functions.invoke("pinata-upload", {
                body: request,
            });

            if (error) {
                throw parseHederaError(error);
            }

            if (!data?.success) {
                throw new HederaServiceError(
                    data?.error || "Failed to upload to IPFS",
                    "IPFS_UPLOAD_FAILED"
                );
            }

            return data;
        });
    }

    /**
     * Get DID for a Hedera account
     */
    async getDID(accountId: string): Promise<HederaDID | null> {
        try {
            const { network } = getHederaConfig();

            // Check if DID exists in profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("did, hedera_account_id")
                .eq("hedera_account_id", accountId)
                .maybeSingle();

            if (profile?.did) {
                return {
                    did: profile.did,
                    accountId: accountId,
                    network: getHederaConfig().network as any,
                };
            }

            // Create new DID if not exists
            const response = await this.createDID({ userAccountId: accountId });

            if (response.success) {
                // Store in profile
                await supabase
                    .from("profiles")
                    .update({
                        did: response.did,
                        hedera_account_id: accountId,
                    })
                    .eq("hedera_account_id", accountId);

                return {
                    did: response.did,
                    accountId: response.accountId,
                    network: response.network,
                };
            }

            return null;
        } catch (error) {
            console.error("Failed to get or create DID:", error);
            return null;
        }
    }

    /**
     * Verify a certificate by ID
     */
    async verifyCertificate(certificateId: string): Promise<VerificationResult> {
        try {
            // Get certificate from database
            const { data: cert, error } = await supabase
                .from("certificate_cache")
                .select("*")
                .eq("certificate_id", certificateId)
                .maybeSingle();

            if (error || !cert) {
                return {
                    verified: false,
                    certificateId,
                };
            }

            // Check if revoked
            if (cert.revoked_at) {
                return {
                    verified: false,
                    certificateId,
                    revokedAt: cert.revoked_at,
                    tokenId: cert.token_id,
                    serialNumber: cert.serial_number,
                };
            }

            // Fetch on-chain data if available
            let onChainData = null;
            if (cert.token_id && cert.serial_number) {
                try {
                    const { network, mirrorNodeUrl } = getHederaConfig();
                    const response = await fetch(
                        `${mirrorNodeUrl}/api/v1/tokens/${cert.token_id}/nfts/${cert.serial_number}`
                    );
                    if (response.ok) {
                        onChainData = await response.json();
                    }
                } catch (err) {
                    console.warn("Failed to fetch on-chain data:", err);
                }
            }

            return {
                verified: true,
                certificateId: cert.certificate_id,
                tokenId: cert.token_id,
                serialNumber: cert.serial_number,
                issuedBy: cert.issuer_did,
                issuedTo: cert.recipient_account_id || cert.recipient_email,
                issuedAt: cert.issued_at,
                revokedAt: cert.revoked_at,
                metadata: cert.metadata as any,
                onChainData,
            };
        } catch (error) {
            console.error("Certificate verification failed:", error);
            throw parseHederaError(error);
        }
    }

    /**
     * Get certificates for an account
     */
    async getCertificatesForAccount(accountId: string) {
        try {
            const { data, error } = await supabase
                .from("certificate_cache")
                .select("*")
                .eq("recipient_account_id", accountId)
                .order("issued_at", { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error("Failed to get certificates:", error);
            throw parseHederaError(error);
        }
    }

    /**
     * Get HCS messages for a topic
     */
    async getHCSMessages(topicId: string, limit: number = 50) {
        try {
            const { mirrorNodeUrl } = getHederaConfig();

            const response = await fetch(
                `${mirrorNodeUrl}/api/v1/topics/${topicId}/messages?limit=${limit}&order=desc`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch HCS messages");
            }

            const data = await response.json();
            return data.messages || [];
        } catch (error) {
            console.error("Failed to get HCS messages:", error);
            throw parseHederaError(error);
        }
    }

    /**
     * Get account balance from mirror node
     */
    async getAccountBalance(accountId: string) {
        try {
            const { mirrorNodeUrl } = getHederaConfig();

            const response = await fetch(
                `${mirrorNodeUrl}/api/v1/accounts/${accountId}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch account balance");
            }

            const data = await response.json();
            return {
                balance: data.balance?.balance || 0,
                tokens: data.balance?.tokens || [],
            };
        } catch (error) {
            console.error("Failed to get account balance:", error);
            throw parseHederaError(error);
        }
    }

    /**
     * Get token info from mirror node
     */
    async getTokenInfo(tokenId: string) {
        try {
            const { mirrorNodeUrl } = getHederaConfig();

            const response = await fetch(`${mirrorNodeUrl}/api/v1/tokens/${tokenId}`);

            if (!response.ok) {
                throw new Error("Failed to fetch token info");
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to get token info:", error);
            throw parseHederaError(error);
        }
    }
}

// Export singleton instance
export const hederaService = HederaService.getInstance();
