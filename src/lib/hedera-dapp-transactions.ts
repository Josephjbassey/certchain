// Mock for dApp transactions since Supabase is removed
export const executeHederaDAppTransaction = async (txInfo: unknown) => {
  console.log("Mock executing dApp transaction", txInfo);
  return { success: true, transactionId: "0.0.123@456" };
};
