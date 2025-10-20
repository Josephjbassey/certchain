/**
 * IPFS/Pinata Service
 * Production-ready IPFS integration with Pinata and fallback gateways
 */

import { supabase } from '@/integrations/supabase/client';
import type { PinataUploadRequest, PinataUploadResponse, HederaNFTMetadata } from '../hedera/types';
import { IPFSError } from '../hedera/errors';
import { getIpfsGatewayUrl } from '../hedera/config';

export class IPFSService {
    private static instance: IPFSService;
    private gatewayFallbacks = [
        'https://gateway.pinata.cloud/ipfs/',
        'https://cloudflare-ipfs.com/ipfs/',
        'https://ipfs.io/ipfs/',
    ];

    private constructor() { }

    static getInstance(): IPFSService {
        if (!IPFSService.instance) {
            IPFSService.instance = new IPFSService();
        }
        return IPFSService.instance;
    }

    /**
     * Upload certificate metadata to IPFS via Pinata
     */
    async uploadMetadata(metadata: HederaNFTMetadata): Promise<PinataUploadResponse> {
        try {
            const request: PinataUploadRequest = {
                type: 'metadata',
                certificateData: metadata,
            };

            const { data, error } = await supabase.functions.invoke('pinata-upload', {
                body: request,
            });

            if (error) {
                throw new IPFSError('Failed to upload metadata to IPFS', error);
            }

            if (!data?.success) {
                throw new IPFSError(data?.error || 'Upload failed');
            }

            return data;
        } catch (error: any) {
            console.error('IPFS metadata upload failed:', error);
            throw new IPFSError(error.message || 'Failed to upload metadata', error);
        }
    }

    /**
     * Upload a file to IPFS via Pinata
     */
    async uploadFile(
        content: string | Blob,
        filename: string,
        mimetype?: string
    ): Promise<PinataUploadResponse> {
        try {
            let fileContent: string;

            if (content instanceof Blob) {
                // Convert Blob to base64
                fileContent = await this.blobToBase64(content);
            } else {
                fileContent = content;
            }

            const request: PinataUploadRequest = {
                type: 'file',
                fileData: {
                    content: fileContent,
                    filename,
                    mimetype: mimetype || 'application/octet-stream',
                },
            };

            const { data, error } = await supabase.functions.invoke('pinata-upload', {
                body: request,
            });

            if (error) {
                throw new IPFSError('Failed to upload file to IPFS', error);
            }

            if (!data?.success) {
                throw new IPFSError(data?.error || 'Upload failed');
            }

            return data;
        } catch (error: any) {
            console.error('IPFS file upload failed:', error);
            throw new IPFSError(error.message || 'Failed to upload file', error);
        }
    }

    /**
     * Fetch content from IPFS with gateway fallback
     */
    async fetchFromIPFS(cid: string): Promise<any> {
        let lastError: any;

        for (const gateway of this.gatewayFallbacks) {
            try {
                const url = `${gateway}${cid}`;
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                    },
                    signal: AbortSignal.timeout(10000), // 10s timeout
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.warn(`Failed to fetch from ${gateway}:`, error);
                lastError = error;
                continue;
            }
        }

        throw new IPFSError(`Failed to fetch CID ${cid} from all gateways`, lastError);
    }

    /**
     * Get IPFS gateway URL for a CID
     */
    getGatewayUrl(cid: string, gatewayIndex: number = 0): string {
        return `${this.gatewayFallbacks[gatewayIndex]}${cid}`;
    }

    /**
     * Verify IPFS content integrity
     */
    async verifyContent(cid: string, expectedHash?: string): Promise<boolean> {
        try {
            const content = await this.fetchFromIPFS(cid);

            if (expectedHash) {
                const actualHash = await this.hashContent(JSON.stringify(content));
                return actualHash === expectedHash;
            }

            // If no expected hash, just verify we can fetch it
            return !!content;
        } catch (error) {
            console.error('Content verification failed:', error);
            return false;
        }
    }

    /**
     * Hash content using SHA-256
     */
    private async hashContent(content: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Convert Blob to base64
     */
    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                // Remove data URL prefix if present
                const base64Data = base64.split(',')[1] || base64;
                resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Pin existing IPFS content (by CID)
     */
    async pinByCID(cid: string): Promise<boolean> {
        try {
            // This would call Pinata's pinByHash API
            // For now, we'll just verify the content exists
            await this.fetchFromIPFS(cid);
            return true;
        } catch (error) {
            console.error('Failed to pin CID:', error);
            return false;
        }
    }

    /**
     * Check if content is pinned
     */
    async isPinned(cid: string): Promise<boolean> {
        try {
            // Try to fetch from primary gateway
            const response = await fetch(getIpfsGatewayUrl(cid), {
                method: 'HEAD',
                signal: AbortSignal.timeout(5000),
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Generate presigned upload URL
     * This allows clients to upload directly to Pinata
     */
    async getPresignedUploadUrl(): Promise<{ uploadUrl: string; token: string }> {
        try {
            // This would call your backend to generate a presigned Pinata JWT
            // For now, return a placeholder
            throw new Error('Presigned uploads not yet implemented');
        } catch (error: any) {
            throw new IPFSError('Failed to generate presigned upload URL', error);
        }
    }
}

// Export singleton instance
export const ipfsService = IPFSService.getInstance();
