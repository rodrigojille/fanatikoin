// scripts/brute-force-cancel-tx.ts
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

/**
 * This script will brute-force send 0-value cancel transactions to self for a range of nonces.
 * Adjust NONCE_START and NONCE_END as needed.
 */

const NONCE_START = 1; // Inclusive
const NONCE_END = 12;  // Inclusive
const EXTRA_GAS_GWEI = 500; // Add this to network gas price to prioritize

async function main() {
  const [deployer] = await ethers.getSigners();
  const provider = deployer.provider!;
  const address = deployer.address;
  const feeData = await provider.getFeeData();
  const networkGasPrice = feeData.gasPrice ? feeData.gasPrice : ethers.parseUnits('10', 'gwei');
  const gasLimit = 21000;
  const cancelGasPrice = networkGasPrice + ethers.parseUnits(EXTRA_GAS_GWEI.toString(), 'gwei');

  console.log(`Brute-force cancelling nonces ${NONCE_START} to ${NONCE_END} for address: ${address}`);
  for (let n = NONCE_START; n <= NONCE_END; n++) {
    try {
      console.log(`Sending cancel tx for nonce ${n} with gas price ${ethers.formatUnits(cancelGasPrice, 'gwei')} gwei...`);
      const tx = await deployer.sendTransaction({
        to: address,
        value: 0,
        gasLimit,
        gasPrice: cancelGasPrice,
        nonce: n,
      });
      console.log(`Cancel tx sent for nonce ${n}: ${tx.hash}`);
      await tx.wait(1);
      console.log(`Cancel tx for nonce ${n} confirmed.`);
    } catch (err) {
      console.error(`Error sending cancel tx for nonce ${n}:`, err);
    }
  }
  console.log('Brute-force cancel attempts complete.');
}

main().catch(console.error);
