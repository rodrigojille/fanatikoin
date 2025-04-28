import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  // Use Hardhat's provider and getSigner for consistency
  const [signer] = await ethers.getSigners();
  const provider = signer.provider!;
  const to = signer.address;
  const gasLimit = 21000;
  const stuckNonces = [17];

  // Fetch and log base gas price
  const feeData = await provider.getFeeData();
  const baseGasPrice = feeData.gasPrice ? feeData.gasPrice : ethers.parseUnits('10', 'gwei');
  // Use BigInt math for ethers v6+
  // Set a gas price just above the pending tx (min required: 125060 gwei)
  const gasPrice = ethers.parseUnits('130000', 'gwei');
  console.log(`Base gas price: ${ethers.formatUnits(baseGasPrice, 'gwei')} gwei`);
  console.log(`Cancel tx gas price (manual): ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);

  for (const nonce of stuckNonces) {
    try {
      console.log(`\nSending cancel tx for nonce ${nonce}...`);
      const tx = await signer.sendTransaction({
        to,
        value: 0,
        gasLimit,
        gasPrice,
        nonce
      });
      console.log(`Cancel tx sent for nonce ${nonce}: ${tx.hash}`);
      console.log('Waiting for 2 confirmations...');
      const receipt = await tx.wait(2);
      if (receipt && receipt.status === 1) {
        console.log(`✅ Cancel tx for nonce ${nonce} confirmed in block ${receipt.blockNumber}`);
      } else {
        console.error(`❌ Cancel tx for nonce ${nonce} failed or not confirmed!`);
      }
    } catch (err) {
      console.error(`❌ Error sending cancel tx for nonce ${nonce}:`, err);
      // Continue to next nonce
    }
  }

  console.log('All cancel attempts processed. Check block explorer for status.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
