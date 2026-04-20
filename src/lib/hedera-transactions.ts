// Mock for Hedera transactions
export const executeHederaTransaction = async (txInfo: unknown) => {
  console.log("Mock executing Hedera transaction... (details omitted for privacy)");
  return { success: true, transactionId: "0.0.123@456" };
};
