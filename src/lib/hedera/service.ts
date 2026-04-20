import type { VerificationResult } from "./types";
import { getHederaConfig } from "./config";
import { parseHederaError } from "./errors";

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
        try {
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
            };
        } catch (error) {
            console.error("Certificate verification failed:", error);
            throw parseHederaError(error);
        }
    }

    async getCertificatesForAccount(accountId: string) {
        return []; // Stub
    }

    async getHCSMessages(topicId: string, limit: number = 50) {
        return []; // Stub
    }

    async getAccountBalance(accountId: string) {
        return { balance: 0, tokens: [] }; // Stub
    }

    async getTokenInfo(tokenId: string) {
        return {}; // Stub
    }
}

export const hederaService = HederaService.getInstance();
