"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const fs = require("fs");
const path = require("path");
async function main() {
    console.log("Starting deployment...");
    console.log("Network:", hardhat_1.network.name);
    // Get signers
    const [deployer] = await hardhat_1.ethers.getSigners();
    console.log(`Deploying contracts with account: ${deployer.address}`);
    // Deploy or use CHZ token
    let chilizTokenAddress;
    if (hardhat_1.network.name === "hardhat" || hardhat_1.network.name === "localhost") {
        console.log("Deploying Mock CHZ token...");
        const MockCHZ = await hardhat_1.ethers.getContractFactory("MockCHZ");
        const mockCHZ = await MockCHZ.deploy();
        await mockCHZ.waitForDeployment();
        chilizTokenAddress = await mockCHZ.getAddress();
        console.log("Mock CHZ token deployed to:", chilizTokenAddress);
    }
    else {
        chilizTokenAddress = "0x0000000000000000000000000000000000001010"; // Native CHZ token on Spicy testnet
    }
    // Deploy TeamTokenFactory first
    const TeamTokenFactory = await hardhat_1.ethers.getContractFactory("TeamTokenFactory");
    const teamTokenFactory = await TeamTokenFactory.deploy();
    await teamTokenFactory.waitForDeployment();
    const teamTokenFactoryAddress = await teamTokenFactory.getAddress();
    console.log("TeamTokenFactory deployed to:", teamTokenFactoryAddress);
    // Deploy TokenMarketplace
    const TokenMarketplace = await hardhat_1.ethers.getContractFactory("TokenMarketplace");
    const tokenMarketplace = await TokenMarketplace.deploy(chilizTokenAddress, 250 // 2.5% platform fee
    );
    await tokenMarketplace.waitForDeployment();
    const tokenMarketplaceAddress = await tokenMarketplace.getAddress();
    console.log("TokenMarketplace deployed to:", tokenMarketplaceAddress);
    // Deploy TokenAuction
    const TokenAuction = await hardhat_1.ethers.getContractFactory("TokenAuction");
    const tokenAuction = await TokenAuction.deploy(chilizTokenAddress, 250 // 2.5% platform fee
    );
    await tokenAuction.waitForDeployment();
    const tokenAuctionAddress = await tokenAuction.getAddress();
    console.log("TokenAuction deployed to:", tokenAuctionAddress);
    // Update contract addresses in config
    const configPath = path.join(__dirname, "../src/contracts/config.ts");
    let configContent = fs.readFileSync(configPath, "utf8");
    configContent = configContent.replace(/CONTRACT_ADDRESSES = \{[^}]*\}/, `CONTRACT_ADDRESSES = {
  TeamTokenFactory: "${teamTokenFactoryAddress}",
  TokenMarketplace: "${tokenMarketplaceAddress}",
  TokenAuction: "${tokenAuctionAddress}",
  ChilizToken: "${chilizTokenAddress}"
};`);
    fs.writeFileSync(configPath, configContent);
    console.log("\nDeployment complete!");
    console.log("Contract addresses have been updated in config.ts");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
