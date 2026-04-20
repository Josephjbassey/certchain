// Mock for IPFS uploads
export const IPFSService = {
  uploadToIPFS: async (file: File | string) => {
    console.log("Mock uploading to IPFS (payload omitted)");
    return { hash: "QmMockHash12345" };
  },
  fetchFromIPFS: async (hash: string) => {
    console.log("Mock fetching from IPFS for hash:", hash);
    return { data: { message: "Mock IPFS Content" } };
  }
};

export const ipfsService = IPFSService;
export const uploadToIPFS = IPFSService.uploadToIPFS;
export const fetchFromIPFS = IPFSService.fetchFromIPFS;
