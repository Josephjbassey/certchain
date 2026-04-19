import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment on Hedera...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer?.address);

  // Deploy Registry
  const Registry = await ethers.getContractFactory("CertChainRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();

  console.log(`✅ CertChainRegistry deployed to: ${registryAddress}`);

  // Deploy Factory
  const Factory = await ethers.getContractFactory("CertChainFactory");
  const factory = await Factory.deploy(registryAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log(`✅ CertChainFactory deployed to: ${factoryAddress}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
