import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: '../.env' });

let operatorKey = process.env.HEDERA_OPERATOR_KEY || "";
if (operatorKey.startsWith("0x")) {
    operatorKey = operatorKey.slice(2);
}
// Ensure key is 32 bytes (64 hex characters) if it's DER-encoded (often 48 or 64 bytes)
// We take the last 64 characters if it's longer
if (operatorKey.length > 64) {
    operatorKey = operatorKey.slice(-64);
}
if (operatorKey) {
    operatorKey = `0x${operatorKey}`;
}

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hederaTestnet: {
      url: "https://testnet.hashio.io/api",
      accounts: operatorKey ? [operatorKey] : [],
    },
  },
};

export default config;
