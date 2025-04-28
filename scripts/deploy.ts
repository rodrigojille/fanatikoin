import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CONTRACT_CONFIG } from "../src/contracts/config";

// Get the Hardhat Runtime Environment
const hre: HardhatRuntimeEnvironment = require("hardhat");

async function main() {
  try {
    // Function to wait for transaction with retries
    async function waitForTransaction(tx: any, maxAttempts = 5) {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`Attempt ${attempt}/${maxAttempts} to confirm transaction...`);
          await tx.wait(2); // Wait for 2 confirmations
          return true;
        } catch (error: any) {
          if (attempt === maxAttempts) throw error;
          console.log(`Attempt ${attempt} failed, retrying in 15 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 15000));
        }
      }
    }
    // Log network info
    const provider = hre.ethers.provider;
    console.log('Network name:', network.name);
    console.log('Network chain ID:', (await provider.getNetwork()).chainId);
    
    // Get and log gas price
    const gasPrice = await provider.getFeeData();
    console.log('Current gas price:', ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'), 'gwei');
    console.log("Starting deployment...");
    console.log("Network:", network.name);

    // Get signers
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Deploying contracts with account: ${deployer.address}`);

    // Deploy or use CHZ token
    let chilizTokenAddress: string;
    if (network.name === "hardhat" || network.name === "localhost") {
      console.log("Deploying Mock CHZ token...");
      const mockCHZFactory = await hre.ethers.getContractFactory("MockCHZ");
      const mockCHZ = await mockCHZFactory.deploy();
      await mockCHZ.waitForDeployment();
      chilizTokenAddress = await mockCHZ.getAddress();
      console.log("Mock CHZ token deployed to:", chilizTokenAddress);
    } else {
      chilizTokenAddress = "0x0000000000000000000000000000000000001010"; // Native CHZ token on Spicy testnet
      console.log("Using native CHZ token at:", chilizTokenAddress);
    }

    // Deploy TeamTokenFactory first as a test
    console.log('Deploying TeamTokenFactory...');
    const teamTokenFactoryFactory = await hre.ethers.getContractFactory("TeamTokenFactory");
    console.log('Contract factory created, attempting deployment...');
    // Get current gas price and add 20% for faster confirmation
    const feeData = await provider.getFeeData();
    const baseGasPrice = feeData.gasPrice || ethers.parseUnits('10', 'gwei');
    const adjustedGasPrice = (baseGasPrice * BigInt(120)) / BigInt(100); // Add 20%

    console.log('Using gas price:', ethers.formatUnits(adjustedGasPrice, 'gwei'), 'gwei');

    const deployTx = await teamTokenFactoryFactory.deploy(chilizTokenAddress, {
      gasLimit: 5000000,
      gasPrice: adjustedGasPrice,
      nonce: await provider.getTransactionCount(deployer.address)
    });
    const txHash = deployTx.deploymentTransaction()?.hash;
    console.log('Deployment transaction hash:', txHash);
    console.log('Waiting for confirmation (this may take a few minutes)...');
    
    // Monitor transaction status (removed buggy receipt.confirmations log)
    // Confirmation check handled below in deployment loop.
    // Wait for deployment with multiple confirmation checks
    let confirmations = 0;
    const requiredConfirmations = 5;
    let receipt = null;

    while (confirmations < requiredConfirmations) {
      try {
        const txReceipt = await provider.getTransactionReceipt(txHash!);
        if (txReceipt) {
          const latestBlock = await provider.getBlockNumber();
          confirmations = latestBlock - txReceipt.blockNumber + 1;
          console.log(`TeamTokenFactory confirmed with ${confirmations}/${requiredConfirmations} confirmations`);
          if (confirmations >= requiredConfirmations) break;
        }
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between checks
      } catch (error) {
        console.log('Error checking confirmation status:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    const finalReceipt = await provider.getTransactionReceipt(txHash!);
    if (!finalReceipt || finalReceipt.status === 0) {
      throw new Error('Transaction failed or was not confirmed');
    }

    await deployTx.waitForDeployment();
    const teamTokenFactoryAddress = await deployTx.getAddress();
    console.log("TeamTokenFactory deployed to:", teamTokenFactoryAddress);

    // Deploy TokenMarketplace
    console.log('Deploying TokenMarketplace...');
    const tokenMarketplaceFactory = await hre.ethers.getContractFactory("TokenMarketplace");
    const tokenMarketplaceNonce = await provider.getTransactionCount(deployer.address, "pending");
    const tokenMarketplaceGasPrice = ethers.parseUnits('1500', 'gwei');
    console.log(`TokenMarketplace nonce: ${tokenMarketplaceNonce}, gas price: ${ethers.formatUnits(tokenMarketplaceGasPrice, 'gwei')} gwei`);
    const tokenMarketplaceDeployTx = await tokenMarketplaceFactory.deploy(chilizTokenAddress, CONTRACT_CONFIG.platformFeeRate, {
      gasLimit: 2500000,
      gasPrice: tokenMarketplaceGasPrice,
      nonce: tokenMarketplaceNonce
    });
    const tokenMarketplaceTxHash = tokenMarketplaceDeployTx.deploymentTransaction()?.hash;
    console.log('Deployment transaction hash (TokenMarketplace):', tokenMarketplaceTxHash);
    console.log('Waiting for confirmation (this may take a few minutes)...');
    let tmConfirmations = 0;
    const tmStartTime = Date.now();
    const tmTimeout = 10 * 60 * 1000; // 10 minutes
    while (tmConfirmations < requiredConfirmations) {
      if (Date.now() - tmStartTime > tmTimeout) {
        console.error('ERROR: TokenMarketplace confirmation timed out after 10 minutes. Exiting.');
        process.exit(1);
      }
      try {
        const tmReceipt = await provider.getTransactionReceipt(tokenMarketplaceTxHash!);
        if (tmReceipt) {
          const latestBlock = await provider.getBlockNumber();
          tmConfirmations = latestBlock - tmReceipt.blockNumber + 1;
          console.log(`TokenMarketplace confirmed with ${tmConfirmations}/${requiredConfirmations} confirmations`);
          if (tmConfirmations >= requiredConfirmations) break;
        } else {
          console.warn('TokenMarketplace receipt not found yet. Waiting...');
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.log('Error checking TokenMarketplace confirmation status:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    await tokenMarketplaceDeployTx.waitForDeployment();
    const tokenMarketplaceAddress = await tokenMarketplaceDeployTx.getAddress();
    console.log("TokenMarketplace deployed to:", tokenMarketplaceAddress);

    // Deploy TokenAuction
    console.log('Deploying TokenAuction...');
    const tokenAuctionFactory = await hre.ethers.getContractFactory("TokenAuction");
    const tokenAuctionNonce = await provider.getTransactionCount(deployer.address, "pending");
    const tokenAuctionGasPrice = ethers.parseUnits('2000', 'gwei');
    console.log(`TokenAuction nonce: ${tokenAuctionNonce}, gas price: ${ethers.formatUnits(tokenAuctionGasPrice, 'gwei')} gwei`);
    const tokenAuctionDeployTx = await tokenAuctionFactory.deploy(chilizTokenAddress, CONTRACT_CONFIG.platformFeeRate, {
      gasLimit: 2500000,
      gasPrice: tokenAuctionGasPrice,
      nonce: tokenAuctionNonce
    });
    const tokenAuctionTxHash = tokenAuctionDeployTx.deploymentTransaction()?.hash;
    console.log('Deployment transaction hash (TokenAuction):', tokenAuctionTxHash);
    console.log('Waiting for confirmation (this may take a few minutes)...');
    let taConfirmations = 0;
    const taStartTime = Date.now();
    const taTimeout = 10 * 60 * 1000; // 10 minutes
    while (taConfirmations < requiredConfirmations) {
      if (Date.now() - taStartTime > taTimeout) {
        console.error('ERROR: TokenAuction confirmation timed out after 10 minutes. Exiting.');
        process.exit(1);
      }
      try {
        const taReceipt = await provider.getTransactionReceipt(tokenAuctionTxHash!);
        if (taReceipt) {
          const latestBlock = await provider.getBlockNumber();
          taConfirmations = latestBlock - taReceipt.blockNumber + 1;
          console.log(`TokenAuction confirmed with ${taConfirmations}/${requiredConfirmations} confirmations`);
          if (taConfirmations >= requiredConfirmations) break;
        } else {
          console.warn('TokenAuction receipt not found yet. Waiting...');
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.log('Error checking TokenAuction confirmation status:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    await tokenAuctionDeployTx.waitForDeployment();
    const tokenAuctionAddress = await tokenAuctionDeployTx.getAddress();
    console.log("TokenAuction deployed to:", tokenAuctionAddress);

    // Deploy FanStaking
    console.log('Deploying FanStaking...');
    require('dotenv').config({ path: '.env.local' });
    const TEAM_TOKEN_ADDRESS = process.env.TEAM_TOKEN_ADDRESS || teamTokenFactoryAddress; // fallback to deployed factory
    const MOCKCHZ_ADDRESS = process.env.MOCKCHZ_ADDRESS || chilizTokenAddress;
    const REWARD_RATE = ethers.parseEther("0.01"); // Example rate, adjust as needed

    const fanStakingFactory = await hre.ethers.getContractFactory("FanStaking");
    const fanStakingNonce = await provider.getTransactionCount(deployer.address, "pending");
    const fanStakingGasPrice = ethers.parseUnits('2000', 'gwei');
    console.log(`FanStaking nonce: ${fanStakingNonce}, gas price: ${ethers.formatUnits(fanStakingGasPrice, 'gwei')} gwei`);
    const fanStakingDeployTx = await fanStakingFactory.deploy(TEAM_TOKEN_ADDRESS, MOCKCHZ_ADDRESS, REWARD_RATE, {
      gasLimit: 7000000,
      gasPrice: fanStakingGasPrice,
      nonce: fanStakingNonce
    });
    const fanStakingTxHash = fanStakingDeployTx.deploymentTransaction()?.hash;
    console.log('Deployment transaction hash (FanStaking):', fanStakingTxHash);
    console.log('Waiting for confirmation (this may take a few minutes)...');
    let fsConfirmations = 0;
    const fsStartTime = Date.now();
    const fsTimeout = 10 * 60 * 1000; // 10 minutes
    while (fsConfirmations < requiredConfirmations) {
      if (Date.now() - fsStartTime > fsTimeout) {
        console.error('ERROR: FanStaking confirmation timed out after 10 minutes. Exiting.');
        process.exit(1);
      }
      try {
        const fsReceipt = await provider.getTransactionReceipt(fanStakingTxHash!);
        if (fsReceipt) {
          const latestBlock = await provider.getBlockNumber();
          fsConfirmations = latestBlock - fsReceipt.blockNumber + 1;
          console.log(`FanStaking confirmed with ${fsConfirmations}/${requiredConfirmations} confirmations`);
          if (fsConfirmations >= requiredConfirmations) break;
        } else {
          console.warn('FanStaking receipt not found yet. Waiting...');
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.log('Error checking FanStaking confirmation status:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    await fanStakingDeployTx.waitForDeployment();
    const fanStakingAddress = await fanStakingDeployTx.getAddress();
    console.log("FanStaking deployed to:", fanStakingAddress);

    // Update contract addresses in config
    const configPath = path.join(__dirname, "../src/contracts/config.ts");

    let configContent = fs.readFileSync(configPath, "utf8");
    configContent = configContent.replace(
      /CONTRACT_ADDRESSES = \{[^}]*\}/,
      `CONTRACT_ADDRESSES = {
    TeamTokenFactory: "${teamTokenFactoryAddress}",
    ChilizToken: "${chilizTokenAddress}",
    TokenMarketplace: "${tokenMarketplaceAddress}",
    TokenAuction: "${tokenAuctionAddress}",
    TokenStaking: "${fanStakingAddress}"
};`
    );

    fs.writeFileSync(configPath, configContent);

    // Mint initial tokens for testing
    if (network.name === "hardhat" || network.name === "localhost") {
      const mockCHZ = await hre.ethers.getContractAt("MockCHZ", chilizTokenAddress);
      await mockCHZ.mint(deployer.address, ethers.parseEther("1000000"));
      console.log("Minted initial supply of CHZ tokens to deployer");
    }

    console.log("\nDeployment complete!");
    console.log("Contract addresses have been updated in config.ts");

  } catch (error: any) {
    console.error('Deployment failed with error:', error);
    throw error;
  }
}

// Run the deployment
void main().catch((error: any) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
