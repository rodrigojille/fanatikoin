// scripts/check-pending-tx.ts
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
console.log("Loaded PRIVATE_KEY:", process.env.PRIVATE_KEY);

async function main() {
  const [deployer] = await ethers.getSigners();
  const provider = deployer.provider!;
  const address = deployer.address;
  const pendingNonce = await provider.getTransactionCount(address, "pending");
  const currentNonce = await provider.getTransactionCount(address, "latest");
  console.log(`Deployer address: ${address}`);
  console.log(`Current nonce: ${currentNonce}`);
  console.log(`Pending nonce: ${pendingNonce}`);

  if (pendingNonce > currentNonce) {
    console.log("You have pending transactions:");
    for (let n = currentNonce; n < pendingNonce; n++) {
      const tx = await provider.getTransaction(n);
      if (tx && !tx.blockNumber) {
        console.log(`  - Pending tx at nonce ${n}: ${tx.hash}`);
      }
    }
  } else {
    console.log("No pending transactions found for this account.");
  }
}

main().catch(console.error);
