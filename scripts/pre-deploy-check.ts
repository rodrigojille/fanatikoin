import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

let hre: HardhatRuntimeEnvironment;

try {
  hre = require("hardhat");
} catch (error) {
  console.error("Failed to load Hardhat runtime environment:", error);
  process.exit(1);
}
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local first, then .env
dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  console.log("Running pre-deployment checks...\n");

  // 1. Check environment variables
  console.log("1. Checking environment variables...");
  const requiredEnvVars = [
    "MONGODB_URI",
    "JWT_SECRET",
    "NEXT_PUBLIC_BICONOMY_API_KEY",
    "NEXT_PUBLIC_BUNDLER_URL",
    "NEXT_PUBLIC_PAYMASTER_URL"
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error("❌ Missing environment variables:", missingVars.join(", "));
    process.exit(1);
  }
  console.log("✅ All required environment variables are present");

  // 2. Check MongoDB connection
  console.log("\n2. Checking MongoDB connection...");
  try {
    const { MongoClient } = require("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    await client.db().command({ ping: 1 });
    console.log("✅ MongoDB connection successful");
    await client.close();
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }

  // 3. Check contract compilation
  console.log("\n3. Checking contract compilation...");
  try {
    const artifactsPath = path.join(__dirname, "../artifacts/src/contracts/solidity");
    const requiredContracts = [
      "TeamTokenFactory.sol/TeamTokenFactory.json",
      "TokenMarketplace.sol/TokenMarketplace.json",
      "TokenAuction.sol/TokenAuction.json"
    ];

    for (const contract of requiredContracts) {
      if (!fs.existsSync(path.join(artifactsPath, contract))) {
        throw new Error(`Missing artifact for ${contract}`);
      }
    }
    console.log("✅ All contract artifacts are present");
  } catch (error) {
    console.error("❌ Contract compilation check failed:", error);
    process.exit(1);
  }

  // 4. Check network configuration
  console.log("\n4. Checking network configuration...");
  try {
    const network = await hre.network.provider.send("eth_chainId", []);
    const chainId = parseInt(network, 16);
    console.log(`Chain ID: ${chainId}`);
    
    if (chainId !== 1001) { // Chiliz Spicy Testnet
      console.warn("⚠️ Warning: Not connected to Chiliz Spicy Testnet");
    } else {
      console.log("✅ Connected to Chiliz Spicy Testnet");
    }
  } catch (error) {
    console.error("❌ Network configuration check failed:", error);
    process.exit(1);
  }

  // 5. Check deployer account
  console.log("\n5. Checking deployer account...");
  try {
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`Deployer address: ${deployer.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} CHZ`);
    
    if (balance < ethers.parseEther("1")) {
      console.warn("⚠️ Warning: Low deployer balance");
    } else {
      console.log("✅ Deployer has sufficient balance");
    }
  } catch (error) {
    console.error("❌ Deployer account check failed:", error);
    process.exit(1);
  }

  // 6. Check test results
  console.log("\n6. Checking test results...");
  try {
    const { execSync } = require("child_process");
    execSync("npm test", { stdio: "inherit" });
    console.log("✅ All tests passed");
  } catch (error) {
    console.error("❌ Tests failed");
    process.exit(1);
  }

  console.log("\n✅ All pre-deployment checks completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
