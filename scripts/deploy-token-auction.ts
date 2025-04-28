import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying TokenAuction contract with address:", deployer.address);

  // Read CHZ token address and platform fee rate from env/config
  const chzToken = process.env.CHILIZ_TOKEN_ADDRESS!;
  const platformFeeRate = 250; // 2.5% (adjust if needed)

  // Dynamic gas price and gas limit for testnet reliability
  const provider = deployer.provider!;
  const feeData = await provider.getFeeData();
  const gasPrice = ethers.parseUnits('2000', 'gwei');
  const gasLimit = 2500000;

  const TokenAuction = await ethers.getContractFactory("TokenAuction");
  const pendingNonce = await provider.getTransactionCount(deployer.address, "pending");
  const auction = await TokenAuction.deploy(chzToken, platformFeeRate, {
    gasPrice,
    gasLimit,
    nonce: pendingNonce
  });
  await auction.waitForDeployment();

  const auctionAddress = await auction.getAddress();
  console.log("✅ TokenAuction deployed at:", auctionAddress);

  // Update config file
  const fs = require('fs');
  const path = require('path');
  const configPath = path.join(__dirname, '../src/contracts/config.ts');
  let configContent = fs.readFileSync(configPath, 'utf8');
  configContent = configContent.replace(/(TokenAuction:\s*")[^"]*(")/, `$1${auctionAddress}$2`);
  fs.writeFileSync(configPath, configContent);
  console.log(`Updated config.ts with TokenAuction address: ${auctionAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
