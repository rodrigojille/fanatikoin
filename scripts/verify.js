"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    console.log("Starting contract verification...");
    // Get contract addresses from config
    const { CONTRACT_ADDRESSES } = require("../src/contracts/config");
    // Verify TeamTokenFactory
    await hardhat_1.ethers.getContractAt("TeamTokenFactory", CONTRACT_ADDRESSES.TeamTokenFactory);
    console.log("TeamTokenFactory verified");
    // Verify TokenMarketplace
    await hardhat_1.ethers.getContractAt("TokenMarketplace", CONTRACT_ADDRESSES.TokenMarketplace);
    console.log("TokenMarketplace verified");
    // Verify TokenAuction
    await hardhat_1.ethers.getContractAt("TokenAuction", CONTRACT_ADDRESSES.TokenAuction);
    console.log("TokenAuction verified");
    console.log("\nVerification complete!");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
