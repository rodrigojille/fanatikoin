import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  const [signer] = await ethers.getSigners();
  const address = signer.address;
  const provider = signer.provider!;
  const balance = await provider.getBalance(address);
  console.log(`Account: ${address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} CHZ`);

  // Check for pending transactions
  const pendingBlock = await provider.getBlock("pending");
  let pendingCount = 0;
  if (pendingBlock && pendingBlock.transactions) {
    for (const txHash of pendingBlock.transactions) {
      const tx = await provider.getTransaction(txHash);
      if (tx && tx.from.toLowerCase() === address.toLowerCase()) {
        console.log(`Pending transaction: ${txHash}`);
        pendingCount++;
      }
    }
  }
  if (pendingCount === 0) {
    console.log("No pending transactions for this account.");
  }
}

main().catch(console.error);
