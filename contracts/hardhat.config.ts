import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: '../.env' });

// Ensure we are reading the correct environment variable and format it properly
let operatorKey = process.env.HEDERA_OPERATOR_KEY || "";
if (operatorKey && !operatorKey.startsWith("0x")) {
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
