// scripts/mint-team-token.ts
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const teamTokenAddress = process.env.TEAM_TOKEN_ADDRESS!;
  const deployer = (await ethers.getSigners())[0];
  const mintAmount = process.env.MINT_AMOUNT || "1000"; // Default: 1,000 tokens
  const decimals = 18;

  if (!teamTokenAddress) {
    throw new Error("TEAM_TOKEN_ADDRESS must be set in .env.local");
  }

  const TeamToken = await ethers.getContractAt("TeamToken", teamTokenAddress, deployer);

  // Check if contract has a mint or purchaseTokens function
  if (typeof TeamToken.purchaseTokens === "function") {
    // If contract uses purchaseTokens (e.g., payable in CHZ)
    const pricePerToken = await TeamToken.currentPrice();
    const totalCost = pricePerToken * BigInt(mintAmount);
    const tx = await TeamToken.purchaseTokens(BigInt(mintAmount));
    await tx.wait();
    console.log(`Minted ${mintAmount} tokens to ${deployer.address} using purchaseTokens.`);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
