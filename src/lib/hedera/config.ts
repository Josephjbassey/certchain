import { z } from 'zod';
import type { HederaNetwork } from './types';

/**
 * Hedera Configuration & Environment Validation
 * Production-ready configuration with Zod validation
 */

const HederaNetworkSchema = z.enum(['testnet', 'mainnet', 'previewnet']);

const HederaConfigSchema = z.object({
    network: HederaNetworkSchema.default('testnet'),
    operatorId: z.string().optional(),
    operatorKey: z.string().optional(),
    mirrorNodeUrl: z.string().url().optional(),
});

export const HederaEnvSchema = z.object({
    VITE_HEDERA_NETWORK: HederaNetworkSchema.default('testnet'),
    VITE_WALLETCONNECT_PROJECT_ID: z.string().optional(),
    VITE_SUPABASE_URL: z.string().url(),
    VITE_SUPABASE_ANON_KEY: z.string(),
});

export type HederaEnv = z.infer<typeof HederaEnvSchema>;

/**
 * Validate and get Hedera environment variables
 */
export function getHederaEnv(): HederaEnv {
    try {
        return HederaEnvSchema.parse({
            VITE_HEDERA_NETWORK: import.meta.env.VITE_HEDERA_NETWORK,
            VITE_WALLETCONNECT_PROJECT_ID: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
            VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
            VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
        });
    } catch (error) {
        console.error('Invalid Hedera environment configuration:', error);
        throw new Error('Missing or invalid Hedera environment variables. Check your .env file.');
    }
}

/**
 * Get Hedera network configuration
 */
export function getHederaConfig(): { network: HederaNetwork; mirrorNodeUrl: string } {
    const env = getHederaEnv();
    const network = env.VITE_HEDERA_NETWORK;

    const mirrorNodeUrls: Record<HederaNetwork, string> = {
        testnet: 'https://testnet.mirrornode.hedera.com',
        mainnet: 'https://mainnet-public.mirrornode.hedera.com',
        previewnet: 'https://previewnet.mirrornode.hedera.com',
    };

    return {
        network,
        mirrorNodeUrl: mirrorNodeUrls[network],
    };
}

/**
 * Get Hashscan explorer URL for transaction/account/token
 */
export function getExplorerUrl(
    type: 'transaction' | 'account' | 'token' | 'topic',
    id: string,
    network?: HederaNetwork
): string {
    const net = network || getHederaConfig().network;
    const baseUrl = net === 'mainnet' ? 'https://hashscan.io' : `https://hashscan.io/${net}`;

    return `${baseUrl}/${type}/${id}`;
}

/**
 * Get IPFS gateway URL
 */
export function getIpfsGatewayUrl(cid: string): string {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

/**
 * Network-specific constants
 */
export const HEDERA_CONSTANTS = {
    testnet: {
        maxTransactionFee: 100_000_000, // 1 HBAR in tinybars
        maxQueryPayment: 1_000_000, // 0.01 HBAR in tinybars
    },
    mainnet: {
        maxTransactionFee: 100_000_000,
        maxQueryPayment: 1_000_000,
    },
    previewnet: {
        maxTransactionFee: 100_000_000,
        maxQueryPayment: 1_000_000,
    },
} as const;

/**
 * Get constants for current network
 */
export function getNetworkConstants() {
    const { network } = getHederaConfig();
    return HEDERA_CONSTANTS[network];
}
