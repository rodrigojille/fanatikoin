import { ethers } from "hardhat";

async function main() {
  require('dotenv').config({ path: '.env.local' });

  // Replace these with your actual deployed addresses or load from env
  const TEAM_TOKEN_ADDRESS = process.env.TEAM_TOKEN_ADDRESS || "<YOUR_TEAM_TOKEN_ADDRESS>";
  const MOCKCHZ_ADDRESS = process.env.MOCKCHZ_ADDRESS || "<YOUR_MOCKCHZ_ADDRESS>";
  if (TEAM_TOKEN_ADDRESS.startsWith('<') || MOCKCHZ_ADDRESS.startsWith('<')) {
    console.error('Please set TEAM_TOKEN_ADDRESS and MOCKCHZ_ADDRESS in .env.local or directly in this script.');
    process.exit(1);
  }
  // Set your desired reward rate (per token per second, 18 decimals)
  const REWARD_RATE = ethers.parseEther("0.01"); // 0.01 MockCHZ per token per second

  console.log("Preparing to deploy FanStaking with:");
  console.log("TEAM_TOKEN_ADDRESS:", TEAM_TOKEN_ADDRESS);
  console.log("MOCKCHZ_ADDRESS:", MOCKCHZ_ADDRESS);
  console.log("REWARD_RATE:", REWARD_RATE.toString());

  console.log("Getting contract factory...");
  const FanStaking = await ethers.getContractFactory("FanStaking");
  console.log("Deploying FanStaking contract...");
  const [deployer] = await ethers.getSigners();
  const provider = ethers.provider;
  const feeData = await provider.getFeeData();
  const baseGasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
  const adjustedGasPrice = (baseGasPrice * BigInt(120)) / BigInt(100); // Add 20%
  const gasLimit = 7000000;

  const stakingTx = await FanStaking.getDeployTransaction(TEAM_TOKEN_ADDRESS, MOCKCHZ_ADDRESS, REWARD_RATE);
  const tx = await deployer.sendTransaction({
    ...stakingTx,
    gasLimit,
    gasPrice: adjustedGasPrice,
  });
  console.log('Deployment transaction hash:', tx.hash);
  console.log('Waiting for confirmations (this may take a few minutes)...');

  let confirmations = 0;
  const requiredConfirmations = 5;
  while (confirmations < requiredConfirmations) {
    try {
      const receipt = await provider.getTransactionReceipt(tx.hash);
      if (receipt) {
        confirmations = Number(receipt.confirmations || 0);
        console.log(`Transaction confirmed with ${confirmations}/${requiredConfirmations} confirmations`);
        if (confirmations >= requiredConfirmations) break;
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.log('Error checking confirmation status:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  const receipt = await provider.getTransactionReceipt(tx.hash);
  if (!receipt || receipt.status === 0) {
    throw new Error('Transaction failed or was not confirmed');
  }

  // Attach to the deployed contract
  if (!receipt.contractAddress) {
    throw new Error('Deployment failed: contractAddress is null');
  }
  const staking = await FanStaking.attach(receipt.contractAddress);
  console.log('FanStaking deployed to:', receipt.contractAddress);

  // Update config file
  const fs = require('fs');
  const path = require('path');
  const configPath = path.join(__dirname, '../src/contracts/config.ts');
  let configContent = fs.readFileSync(configPath, 'utf8');
  configContent = configContent.replace(/(TokenStaking:\s*")[^"]*(")/, `$1${receipt.contractAddress}$2`);
  fs.writeFileSync(configPath, configContent);
  console.log(`Updated config.ts with TokenStaking address: ${receipt.contractAddress}`);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
