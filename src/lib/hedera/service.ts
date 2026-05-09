import { supabase } from "@/integrations/supabase/client";
import { getHederaConfig, getIpfsGatewayUrl } from "./config";
import {
  HederaServiceError,
  parseHederaError,
  retryOperation,
} from "./errors";
import type {
  HederaDID,
  MintCertificateRequest,
  MintCertificateResponse,
  HCSMessageRequest,
  HCSMessageResponse,
  CreateDIDRequest,
  CreateDIDResponse,
  PinataUploadRequest,
  PinataUploadResponse,
  VerificationResult,
  CertificateNFTMetadata,
  InstitutionProfile,
  CertificateIssuedEvent,
  CertificateRevokedEvent,
  BatchOperationEvent
} from "./types";
import { createOperatorClient } from "./client";
import {
  createInstitutionTopic,
  submitInstitutionProfile,
  submitCertificateIssued,
  submitCertificateRevoked,
  submitBatchOperation,
  submitMessage,
  createHCSMessage
} from "./hcs";
import {
  createCertificateCollection,
  issueSoulboundCertificate,
  buildCertificateNFTMetadata,
  burnNFT
} from "./nft";
import { PrivateKey } from "@hashgraph/sdk";

/**
 * Hedera Service - Singleton
 * Centralized service for all Hedera-related operations
 */
export class HederaService {
  private static instance: HederaService;

  private constructor() {}

  static getInstance(): HederaService {
    if (!HederaService.instance) {
      HederaService.instance = new HederaService();
    }
    return HederaService.instance;
  }

  /**
   * Create a new DID on Hedera
   */
  async createDID(request: CreateDIDRequest): Promise<CreateDIDResponse> {
    return retryOperation(async () => {
      const { network } = getHederaConfig();

      console.log("Creating DID for account:", request.userAccountId);

      const { data, error } = await supabase.functions.invoke(
        "hedera-create-did",
        {
          body: {
            ...request,
            network: request.network || network,
          },
        }
      );

      if (error) {
        console.error("Supabase function invocation error:", error);
        throw parseHederaError(error);
      }

      if (!data?.success) {
        throw new HederaServiceError(
          data?.error || "Failed to create DID",
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
          network: getHederaConfig().network,
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
   * OPERATION 1: INITIALIZE INSTITUTION
   * Sets up a new institution on the network
   */
  async initializeInstitution(institutionData: Record<string, unknown>, adminPrivateKey: string) {
    return retryOperation(async () => {
      const client = createOperatorClient();
      const privateKey = PrivateKey.fromString(adminPrivateKey);

      // STEP 1: Create Institution HCS Topic
      const topicId = await createInstitutionTopic(client, institutionData.name, privateKey);

      // STEP 2: Create NFT Collection for Certificates
      const tokenId = await createCertificateCollection(
        client,
        institutionData.name,
        institutionData.accountId,
        privateKey,
        privateKey
      );

      // STEP 3: Upload Institution Logo to IPFS (handled by frontend usually, but here for completeness)
      let logoCID = institutionData.logoCID;
      if (institutionData.logoFile) {
        const uploadRes = await this.uploadToIPFS({
          type: 'file',
          file: institutionData.logoFile
        });
        logoCID = uploadRes.cid;
      }

      // STEP 4: Create Institution Profile Message
      const profileData: InstitutionProfile["data"] = {
        institutionId: institutionData.accountId,
        name: institutionData.name,
        domain: institutionData.domain,
        contactEmail: institutionData.email,
        logoIpfsCid: logoCID,
        walletAddress: institutionData.accountId,
        certificateCollectionId: tokenId,
        metadata: {
          country: institutionData.country,
          website: institutionData.website
        }
      };

      // In a real app, signature would be created using the private key
      const signature = "signed-profile-data";

      // STEP 5: Submit to HCS Topic
      await submitInstitutionProfile(client, topicId, profileData, signature);

      return {
        topicId,
        collectionId: tokenId,
        logoCID
      };
    });
  }

  /**
   * OPERATION 2: ISSUE CERTIFICATE (Single)
   * Issues a certificate as an NFT to a recipient
   */
  async issueCertificate(certificateData: Record<string, unknown>, issuerPrivateKey: string) {
    return retryOperation(async () => {
      const client = createOperatorClient();
      const privateKey = PrivateKey.fromString(issuerPrivateKey);

      // STEP 1: Upload to IPFS
      const metadataRes = await this.uploadToIPFS({
        type: 'metadata',
        certificateData: certificateData.nftMetadata
      });

      // STEP 2: Mint Soulbound NFT
      const mintResult = await issueSoulboundCertificate(
        client,
        certificateData.collectionId,
        certificateData.recipientAccountId,
        metadataRes.cid,
        privateKey,
        privateKey
      );

      // STEP 3: Create Certificate Issued Event
      const issuedEventData: CertificateIssuedEvent["data"] = {
        certificateId: certificateData.nftMetadata.properties.certificateId,
        tokenId: certificateData.collectionId,
        serialNumber: mintResult.serialNumber,
        institutionId: certificateData.institutionId,
        issuerAccountId: certificateData.issuerAccountId,
        recipientAccountId: certificateData.recipientAccountId,
        recipientName: certificateData.nftMetadata.properties.recipientName,
        courseName: certificateData.nftMetadata.properties.courseName,
        certificateType: "COMPLETION",
        issueDate: certificateData.nftMetadata.properties.issueDate,
        fileHash: certificateData.nftMetadata.properties.fileHash,
        ipfsCid: metadataRes.cid,
        metadata: {},
        isSoulbound: true,
        transactionId: mintResult.transactionId
      };

      const signature = "signed-issue-event";

      // STEP 4: Submit Event to HCS
      await submitCertificateIssued(client, certificateData.eventTopicId, issuedEventData, signature);

      return {
        certificateId: issuedEventData.certificateId,
        tokenId: issuedEventData.tokenId,
        serialNumber: issuedEventData.serialNumber,
        transactionId: mintResult.transactionId,
        ipfsCid: metadataRes.cid
      };
    });
  }

  /**
   * OPERATION 3: VERIFY CERTIFICATE
   * Verifies authenticity of a certificate
   */
  async verifyCertificate(certificateId: string): Promise<VerificationResult> {
    try {
      // For this decentralized architecture, we query on-chain data
      // In a real implementation, we would parse the certificateId to get tokenId and serialNumber
      // Assuming format: TOKEN_ID-SERIAL
      const parts = certificateId.split('-');
      if (parts.length < 2) {
         // Fallback to cache for legacy support
         return this.verifyCertificateLegacy(certificateId);
      }

      const tokenId = parts[0];
      const serialNumber = parseInt(parts[1]);

      const { mirrorNodeUrl } = getHederaConfig();

      // STEP 1: Query NFT from Mirror Node
      const nftResponse = await fetch(`${mirrorNodeUrl}/api/v1/tokens/${tokenId}/nfts/${serialNumber}`);
      if (!nftResponse.ok) {
        return { verified: false, certificateId };
      }
      const nftData = await nftResponse.json();

      // STEP 2: Fetch NFT Metadata from IPFS
      const metadataUrl = getIpfsGatewayUrl(new TextDecoder().decode(Uint8Array.from(atob(nftData.metadata), (c) => c.charCodeAt(0))));
      const metadataRes = await fetch(metadataUrl);
      const metadata: CertificateNFTMetadata = await metadataRes.json();

      // STEP 3: Query HCS Topic for Issue Event
      const hcsTopicId = metadata.properties.hcsTopicId;
      const messages = await this.getHCSMessages(hcsTopicId, 100);

      const issueEvent = messages.find((msg: { message: string }) => {
        const decoded = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(msg.message), (c) => c.charCodeAt(0))));
        return decoded.type === "CERTIFICATE_ISSUED" && decoded.data.certificateId === certificateId;
      });

      if (!issueEvent) {
        return { verified: false, certificateId, status: "INVALID" } as VerificationResult;
      }

      // STEP 4: Check for Revocation
      const revocationEvent = messages.find((msg: { message: string }) => {
        const decoded = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(msg.message), (c) => c.charCodeAt(0))));
        return decoded.type === "CERTIFICATE_REVOKED" && decoded.data.certificateId === certificateId;
      });

      if (revocationEvent) {
        const decodedRevoke = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(revocationEvent.message), (c) => c.charCodeAt(0))));
        return {
          verified: false,
          certificateId,
          revokedAt: decodedRevoke.data.revocationDate,
          tokenId,
          serialNumber
        };
      }

      return {
        verified: true,
        certificateId,
        tokenId,
        serialNumber,
        issuedBy: metadata.properties.institutionName,
        issuedTo: metadata.properties.recipientName,
        issuedAt: metadata.properties.issueDate,
        metadata,
        onChainData: nftData
      };
    } catch (error) {
      console.error("Certificate verification failed:", error);
      throw parseHederaError(error);
    }
  }

  private async verifyCertificateLegacy(certificateId: string): Promise<VerificationResult> {
      // Original implementation using database cache
      const { data: cert, error } = await supabase
          .from("certificate_cache")
          .select("*")
          .eq("certificate_id", certificateId)
          .maybeSingle();

      if (error || !cert) {
          return { verified: false, certificateId };
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
          metadata: cert.metadata as CertificateNFTMetadata,
      };
  }

  /**
   * OPERATION 4: REVOKE CERTIFICATE
   * Revokes an issued certificate
   */
  async revokeCertificate(certificateId: string, reason: string, revokerPrivateKey: string) {
    return retryOperation(async () => {
      const client = createOperatorClient();
      const privateKey = PrivateKey.fromString(revokerPrivateKey);

      // STEP 1: Get Certificate Details (from on-chain or cache)
      const cert = await this.verifyCertificate(certificateId);
      if (!cert.verified || !cert.tokenId || !cert.serialNumber) {
        throw new Error("Certificate not found or already invalid");
      }

      // STEP 2: Create Revocation Event
      const revocationEventData: CertificateRevokedEvent["data"] = {
        certificateId,
        tokenId: cert.tokenId,
        serialNumber: cert.serialNumber,
        revokedBy: client.operatorAccountId?.toString() || "",
        reason,
        revocationDate: new Date().toISOString(),
        transactionId: "" // Filled below
      };

      const signature = "signed-revocation-event";

      // STEP 3: Submit to HCS
      const hcsMsg = createHCSMessage("CERTIFICATE_REVOKED", revocationEventData, signature);
      const hcsResult = await submitMessage(client, cert.metadata?.properties.hcsTopicId || "", hcsMsg);

      revocationEventData.transactionId = hcsResult.transactionId;

      // STEP 4: Burn NFT (or Freeze)
      await burnNFT(client, cert.tokenId, cert.serialNumber, privateKey);

      return {
        success: true,
        transactionId: hcsResult.transactionId
      };
    });
  }

  /**
   * OPERATION 5: BATCH ISSUE CERTIFICATES
   * Issues multiple certificates in batch
   */
  async batchIssueCertificates(certificatesArray: Record<string, unknown>[], issuerPrivateKey: string) {
    return retryOperation(async () => {
      const client = createOperatorClient();
      const privateKey = PrivateKey.fromString(issuerPrivateKey);
      const results = [];

      for (const certData of certificatesArray) {
        try {
          const result = await this.issueCertificate(certData, issuerPrivateKey);
          results.push({ success: true, ...result });
        } catch (error: Error) {
          results.push({ success: false, error: error.message });
        }
      }

      return {
        total: certificatesArray.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    });
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
