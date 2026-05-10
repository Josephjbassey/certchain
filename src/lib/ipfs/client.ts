import { getIpfsGatewayUrl } from '../hedera/config';

/**
 * IPFS Client for interacting with Pinata/IPFS
 */
export class IPFSClient {
  private static instance: IPFSClient;
  private apiKey: string;
  private secretKey: string;

  private constructor() {
    this.apiKey = import.meta.env.VITE_PINATA_API_KEY || '';
    this.secretKey = import.meta.env.VITE_PINATA_SECRET || '';
  }

  static getInstance(): IPFSClient {
    if (!IPFSClient.instance) {
      IPFSClient.instance = new IPFSClient();
    }
    return IPFSClient.instance;
  }

  /**
   * Upload file to IPFS via Pinata (using edge function as proxy to avoid exposing keys)
   */
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to IPFS');
    }

    const data = await response.json();
    return data.cid;
  }

  /**
   * Upload JSON to IPFS
   */
  async uploadJSON(data: object): Promise<string> {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'metadata', data }),
    });

    if (!response.ok) {
      throw new Error('Failed to upload JSON to IPFS');
    }

    const resData = await response.json();
    return resData.cid;
  }

  /**
   * Fetch JSON from IPFS
   */
  async fetchJSON<T>(cid: string): Promise<T> {
    const url = getIpfsGatewayUrl(cid);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch from IPFS');
    }

    return await response.json();
  }

  /**
   * Get IPFS URL
   */
  getIPFSUrl(cid: string): string {
    return getIpfsGatewayUrl(cid);
  }
}

export async function fetchCertificateMetadata(cid: string) {
    return IPFSClient.getInstance().fetchJSON(cid);
}
