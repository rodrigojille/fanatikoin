import { ethers } from "hardhat";

async function main() {
  console.log("Starting contract verification...");

  // Get contract addresses from config
  const { CONTRACT_ADDRESSES } = require("../src/contracts/config");

  // Verify TeamTokenFactory
  await ethers.getContractAt("TeamTokenFactory", CONTRACT_ADDRESSES.TeamTokenFactory);
  console.log("TeamTokenFactory verified");

  // Verify TokenMarketplace
  await ethers.getContractAt("TokenMarketplace", CONTRACT_ADDRESSES.TokenMarketplace);
  console.log("TokenMarketplace verified");

  // Verify TokenAuction
  await ethers.getContractAt("TokenAuction", CONTRACT_ADDRESSES.TokenAuction);
  console.log("TokenAuction verified");

  console.log("\nVerification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
