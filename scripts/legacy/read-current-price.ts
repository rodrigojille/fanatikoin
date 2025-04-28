// scripts/read-current-price.ts
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const teamTokenAddress = process.env.TEAM_TOKEN_ADDRESS!;
  if (!teamTokenAddress) throw new Error("TEAM_TOKEN_ADDRESS must be set in .env.local");
  const TeamToken = await ethers.getContractAt("TeamToken", teamTokenAddress);
  const price = await TeamToken.currentPrice();
  console.log("Current price is:", price.toString());
}

main().catch(console.error);
