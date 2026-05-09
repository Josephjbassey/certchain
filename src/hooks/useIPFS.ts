import { useState, useCallback } from "react";
import { IPFSClient } from "@/lib/ipfs/client";
import { computeFileHash } from "@/lib/crypto/hash";

export function useIPFS() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const ipfsClient = IPFSClient.getInstance();

  /**
   * Upload file to IPFS
   */
  const uploadFile = useCallback(
    async (file: File): Promise<{ cid: string; hash: string } | null> => {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      try {
        const hash = await computeFileHash(file);
        setUploadProgress(30);

        const cid = await ipfsClient.uploadFile(file);
        setUploadProgress(100);

        return { cid, hash };
      } catch (err) {
        setUploadError((err as Error).message);
        console.error("IPFS upload error:", err);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [ipfsClient]
  );

  return {
    isUploading,
    uploadError,
    uploadProgress,
    uploadFile,
    getIPFSUrl: (cid: string) => ipfsClient.getIPFSUrl(cid),
  };
}
