import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    const chilizToken = process.env.CHILIZ_TOKEN_ADDRESS!;
    const platformFeeRate = 250; // 2.5% in basis points

    console.log("[INFO] Deployer address:", deployer.address);
    console.log("[INFO] Using CHZ token:", chilizToken);
    console.log("[INFO] Platform fee rate:", platformFeeRate.toString());

    console.log("[INFO] Getting TokenMarketplace contract factory...");
    const TokenMarketplace = await ethers.getContractFactory("TokenMarketplace");
    console.log("[INFO] Contract factory obtained.");

    const gasPrice = ethers.parseUnits('1500', 'gwei'); // Higher gas price for priority
    const gasLimit = 2500000;
    const provider = deployer.provider!;
    const pendingNonce = await provider.getTransactionCount(deployer.address, "pending");
    console.log("About to deploy TokenMarketplace with params:", { chilizToken, platformFeeRate, gasPrice: gasPrice.toString(), gasLimit, nonce: pendingNonce });
    const tx = await TokenMarketplace.getDeployTransaction(chilizToken, platformFeeRate, { gasPrice, gasLimit, nonce: pendingNonce });
    console.log("Raw deployment transaction:", tx);
    const marketplace = await TokenMarketplace.deploy(chilizToken, platformFeeRate, { gasPrice, gasLimit, nonce: pendingNonce });

    console.log(`[INFO] Deploying contract with gasPrice: ${ethers.formatUnits(gasPrice, 'gwei')} gwei, gasLimit: ${gasLimit}, nonce: ${pendingNonce}`);
    console.log("[INFO] Used nonce:", pendingNonce);

    const deploymentTx = marketplace.deploymentTransaction();
    if (deploymentTx) {
      console.log("[INFO] Deployment transaction hash:", deploymentTx.hash);
    } else {
      console.log("[WARN] No deployment transaction hash available (deploymentTransaction() returned null).");
    }

    console.log("[INFO] Waiting for deployment...");
    await marketplace.waitForDeployment();
    const address = await marketplace.getAddress();
    console.log("[SUCCESS] TokenMarketplace deployed to:", address);
    console.log("[INFO] Used gas price:", ethers.formatUnits(gasPrice, 'gwei'), "gwei");

    // Update config file
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, '../src/contracts/config.ts');
    let configContent = fs.readFileSync(configPath, 'utf8');
    configContent = configContent.replace(/(TokenMarketplace:\s*")[^"]*(")/, `$1${address}$2`);
    fs.writeFileSync(configPath, configContent);
    console.log(`[SUCCESS] Updated config.ts with TokenMarketplace address: ${address}`);
  } catch (error) {
    console.error("[ERROR] Deployment failed:", error);
    if (error instanceof Error && error.stack) {
      console.error("[STACK TRACE]", error.stack);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
