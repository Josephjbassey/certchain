// Mock for Hedera transactions
export const executeHederaTransaction = async (txInfo: unknown) => {
  console.log("Mock executing Hedera transaction", txInfo);
  return { success: true, transactionId: "0.0.123@456" };
};
