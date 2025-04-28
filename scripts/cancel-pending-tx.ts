// scripts/cancel-pending-tx.ts
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

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
    console.log(`Attempting to cancel nonces ${currentNonce} to ${pendingNonce - 1}`);
    for (let n = currentNonce; n < pendingNonce; n++) {
      try {
        // Fetch the stuck transaction for this nonce
        let stuckTx;
        try {
          stuckTx = await provider.getTransaction(n);
        } catch (err) {
          console.error(`Could not fetch transaction for nonce ${n}:`, err);
          continue;
        }
        if (!stuckTx || stuckTx.blockNumber) {
          console.log(`Nonce ${n} is not pending, skipping...`);
          continue;
        }
        // Calculate new gas price (+100 gwei)
        let stuckGasPrice;
        try {
          stuckGasPrice = stuckTx.gasPrice ? stuckTx.gasPrice : ethers.parseUnits('10', 'gwei');
        } catch (err) {
          stuckGasPrice = ethers.parseUnits('10', 'gwei');
        }
        const newGasPrice = stuckGasPrice + ethers.parseUnits('100', 'gwei');
        console.log(`Nonce ${n}: stuck gas price = ${ethers.formatUnits(stuckGasPrice, 'gwei')} gwei, new gas price = ${ethers.formatUnits(newGasPrice, 'gwei')} gwei`);
        const tx = await deployer.sendTransaction({
          to: address,
          value: 0,
          gasLimit: 21000,
          gasPrice: newGasPrice,
          nonce: n,
        });
        console.log(`Cancel tx sent for nonce ${n}: ${tx.hash}`);
        await tx.wait(1);
        console.log(`Cancel tx for nonce ${n} confirmed.`);
      } catch (err) {
        console.error(`Error sending cancel tx for nonce ${n}:`, err);
      }
    }
  } else {
    console.log("No pending transactions to cancel.");
  }
}

main().catch(console.error);
