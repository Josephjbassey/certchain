// Mock for IPFS uploads
export const IPFSService = {
  uploadToIPFS: async (file: File | string) => {
    console.log("Mock uploading to IPFS", file);
    return { hash: "QmMockHash12345" };
  }
};
export const ipfsService = IPFSService;
export const uploadToIPFS = IPFSService.uploadToIPFS;
