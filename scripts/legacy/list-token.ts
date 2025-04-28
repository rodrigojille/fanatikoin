// scripts/list-token.ts
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // Explicitly load .env.local

async function main() {
  // Debug: Print loaded env variables
  console.log("TEAM_TOKEN_ADDRESS:", process.env.TEAM_TOKEN_ADDRESS);
  console.log("TOKEN_MARKETPLACE_ADDRESS:", process.env.TOKEN_MARKETPLACE_ADDRESS);
  const teamTokenAddress = process.env.TEAM_TOKEN_ADDRESS!;
  const tokenMarketplaceAddress = process.env.TOKEN_MARKETPLACE_ADDRESS!;
  const priceInChz = process.env.LIST_PRICE_CHZ || "100"; // Default price: 100 CHZ
  const decimals = 18;

  if (!teamTokenAddress || !tokenMarketplaceAddress) {
    throw new Error("TEAM_TOKEN_ADDRESS and TOKEN_MARKETPLACE_ADDRESS must be set in .env.local");
  }

  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log("Listing token with deployer:", deployer.address);

  // Approve the marketplace to spend the tokens (set a high allowance for demo)
  const TeamToken = await ethers.getContractAt("TeamToken", teamTokenAddress);
  const amountToApprove = ethers.parseUnits("1000000", decimals); // 1 million tokens
  const approveTx = await TeamToken.approve(tokenMarketplaceAddress, amountToApprove);
  await approveTx.wait();
  console.log("Approved marketplace to spend tokens.");

  // List the token for sale
  const TokenMarketplace = await ethers.getContractAt("TokenMarketplace", tokenMarketplaceAddress);
  const price = ethers.parseUnits(priceInChz.toString(), decimals);
  const listTx = await TokenMarketplace.listToken(teamTokenAddress, price);
  await listTx.wait();
  console.log(`✅ Token listed for sale at price: ${priceInChz} CHZ (${price} wei)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
