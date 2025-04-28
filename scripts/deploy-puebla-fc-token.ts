import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { CONTRACT_ADDRESSES } from "../src/contracts/config";

async function main() {
  // === Puebla FC Token Parameters ===
  const name = "Puebla FC";
  const symbol = "PUEBLA";
  const description = "Official fan token for Puebla FC";
  const benefits = [
    "Voting rights for club decisions",
    "Exclusive merchandise",
    "Meet & greet events",
    "VIP match tickets"
  ];
  const maxSupply = ethers.parseUnits("1000000", 18); // 1 million tokens, 18 decimals
  const initialPrice = ethers.parseUnits("10", 18); // 10 CHZ per token

  // === Setup Deployer & Factory ===
  const [deployer] = await ethers.getSigners();
  const factory = await ethers.getContractAt(
    "TeamTokenFactory",
    CONTRACT_ADDRESSES.TeamTokenFactory,
    deployer
  );

  console.log("Deploying Puebla FC token...");

  // === Dynamic Gas & Nonce ===
  const provider = deployer.provider!;
  const feeData = await provider.getFeeData();
  const baseGasPrice = feeData.gasPrice || ethers.parseUnits('10', 'gwei');
  // Force a high gas price for urgent mining
  const gasPrice = ethers.parseUnits('200', 'gwei');
  const gasLimit = 3_000_000;
  console.log(`Forced gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
  const nonce = await provider.getTransactionCount(deployer.address, "pending");
  console.log(`Using pending nonce: ${nonce}`);
  console.log(`Base gas price: ${ethers.formatUnits(baseGasPrice, 'gwei')} gwei`);
  console.log(`Buffered gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
  console.log(`Gas limit: ${gasLimit}`);

  // === Send createToken Transaction ===
  let tx;
  try {
    tx = await factory.createToken(
      name,
      symbol,
      description,
      benefits,
      maxSupply,
      initialPrice,
      {
        gasPrice,
        gasLimit,
        nonce
      }
    );
  } catch (err) {
    console.error("❌ Error sending transaction:", err);
    return;
  }
  console.log("Transaction sent:", tx.hash);

  // === Wait for Confirmations ===
  let receipt;
  try {
    console.log("Waiting for 2 confirmations...");
    receipt = await tx.wait(2);
  } catch (err) {
    console.error("❌ Error waiting for confirmations:", err);
    return;
  }
  if (!receipt) {
    console.error("❌ Transaction receipt is null or undefined");
    return;
  }
  console.log(`Transaction confirmed in block ${receipt.blockNumber} with status ${receipt.status}`);

  // === Extract Token Address from Logs ===
  let tokenAddress = null;
  if (Array.isArray(receipt.logs)) {
    for (const log of receipt.logs) {
      try {
        const parsed = factory.interface.parseLog(log);
        if (parsed && parsed.name === "TokenCreated" && parsed.args.tokenAddress) {
          tokenAddress = parsed.args.tokenAddress;
          break;
        }
      } catch {}
    }
  }
  if (tokenAddress) {
    console.log(`✅ Puebla FC token deployed at: ${tokenAddress}`);
    // === Mint tokens to owner (deployer) ===
    try {
      const chz = await ethers.getContractAt("ERC20", CONTRACT_ADDRESSES.ChilizToken, deployer);
      const teamToken = await ethers.getContractAt("TeamToken", tokenAddress, deployer);
      const amountToMint = ethers.parseUnits("1000", 18); // Mint 1,000 tokens to yourself
      const cost = await teamToken.currentPrice();
      const totalCost = (cost * amountToMint) / ethers.parseUnits("1", 18);
      console.log(`Approving ${totalCost} CHZ to TeamToken contract...`);
      const approveTx = await chz.approve(tokenAddress, totalCost);
      await approveTx.wait(1);
      console.log("CHZ approved.");
      console.log(`Purchasing (minting) ${amountToMint} tokens...`);
      const purchaseTx = await teamToken.purchaseTokens(amountToMint);
      await purchaseTx.wait(2);
      console.log(`✅ Minted ${amountToMint} tokens to ${deployer.address}`);
    } catch (err) {
      console.error("❌ Error minting tokens after deployment:", err);
    }
  } else {
    console.error("❌ TokenCreated event not found in receipt");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
