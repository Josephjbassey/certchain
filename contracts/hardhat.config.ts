import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: '../.env' });

const operatorKey = process.env.VITE_HEDERA_OPERATOR_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hederaTestnet: {
      url: "https://testnet.hashio.io/api",
      accounts: operatorKey ? [operatorKey.replace(/^0x/, '')] : [], // Hedera uses ECDSA or ED25519; ensure it's ECDSA for easy Solidity usage if possible
    },
  },
};

export default config;
