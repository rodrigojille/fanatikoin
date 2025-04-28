import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  const [deployer] = await ethers.getSigners();
  const chilizToken = process.env.CHILIZ_TOKEN_ADDRESS!;

  console.log("Deploying TeamTokenFactory with deployer:", deployer.address);
  console.log("Using CHZ token:", chilizToken);

  const TeamTokenFactory = await ethers.getContractFactory("TeamTokenFactory");
  const provider = deployer.provider!;
  const networkGasPrice = (await provider.getFeeData()).gasPrice;
  const gasPrice = ethers.parseUnits('500', 'gwei');
  const gasLimit = 2500000;
  const pendingNonce = await provider.getTransactionCount(deployer.address, "pending");
  console.log("About to deploy TeamTokenFactory with params:", { chilizToken, gasPrice: gasPrice.toString(), gasLimit, nonce: pendingNonce });
  const tx = await TeamTokenFactory.getDeployTransaction(chilizToken, { gasPrice, gasLimit, nonce: pendingNonce });
  console.log("Raw deployment transaction:", tx);
  const factory = await TeamTokenFactory.deploy(chilizToken, { gasPrice, gasLimit, nonce: pendingNonce });
  console.log("Used nonce:", pendingNonce);
  console.log("Deployment transaction sent, waiting for confirmation...");
  await Promise.race([
    factory.waitForDeployment(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Deployment timed out after 5 minutes')), 300000))
  ]);
  const address = await factory.getAddress();
  console.log("TeamTokenFactory deployed to:", address);
  console.log("Used gas price:", ethers.formatUnits(gasPrice, 'gwei'), "gwei");
  console.log("Used gas limit:", gasLimit);

  // Update config file
  const fs = require('fs');
  const path = require('path');
  const configPath = path.join(__dirname, '../src/contracts/config.ts');
  let configContent = fs.readFileSync(configPath, 'utf8');
  configContent = configContent.replace(/(TeamTokenFactory:\s*")[^"]*(")/, `$1${address}$2`);
  fs.writeFileSync(configPath, configContent);
  console.log(`Updated config.ts with TeamTokenFactory address: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
