import type { VerificationResult } from "./types";
import { getHederaConfig } from "./config";
import { parseHederaError } from "./errors";
import type { Certificate } from "@/hooks/useCertificates";

// Additional types missing from `./types` context needed by Dashboard
export interface HCSMessage {
  sequenceNumber: number;
  message: string;
  runningHash: string;
  consensusTimestamp: string;
}

export interface AccountBalance {
  balance: number;
  tokens: Array<{ tokenId: string; balance: number }>;
}

export interface TokenInfo {
  tokenId: string;
  name: string;
  symbol: string;
}

// Minimal stub for HederaService without Supabase Edge functions
export class HederaService {
    private static instance: HederaService;

    private constructor() { }

    static getInstance(): HederaService {
        if (!HederaService.instance) {
            HederaService.instance = new HederaService();
        }
        return HederaService.instance;
    }

    async verifyCertificate(certificateId: string): Promise<VerificationResult> {
        // Enforce mock logic via environment variable to prevent fake confirmations in production
        if (import.meta.env.VITE_HEDERA_STUB_ENABLED !== "true") {
            throw new Error("Hedera Service is currently unlinked from backend. Real verification requires Pure dApp indexer logic.");
        }

        // Stub verification
        return {
            verified: true,
            certificateId: certificateId,
            tokenId: "0.0.12345",
            serialNumber: "1",
            issuedBy: "0.0.67890",
            issuedTo: "user_test",
            issuedAt: new Date().toISOString(),
            metadata: { course: "Web3" },
            onChainData: null,
            // @ts-expect-error adding custom field for mock UI
            mock: true,
            mockReason: "Stub enabled via env variable"
        };
    }

    async getCertificatesForAccount(accountId: string): Promise<Certificate[]> {
        return []; // Stub
    }

    async getHCSMessages(topicId: string, limit: number = 50): Promise<HCSMessage[]> {
        return []; // Stub
    }

    async getAccountBalance(accountId: string): Promise<AccountBalance> {
        return { balance: 0, tokens: [] }; // Stub
    }

    async getTokenInfo(tokenId: string): Promise<TokenInfo | null> {
        return null; // Stub
    }
}

export const hederaService = HederaService.getInstance();
