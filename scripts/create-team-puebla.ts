
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { CONTRACT_ADDRESSES } from "../src/contracts/config";

async function main() {
  // Set up parameters for Puebla FC token
  const name = "Puebla FC";
  const symbol = "PUEBLA";
  const description = "Official fan token for Puebla FC";
  const benefits = [
    "Voting rights for club decisions",
    "Exclusive merchandise",
    "Meet & greet events",
    "VIP match tickets"
  ];
  const maxSupply = ethers.parseUnits("100", 18); // 100 tokens, 18 decimals
  const initialPrice = ethers.parseUnits("10", 18); // 10 CHZ per token

  // Load TeamTokenFactory
  const [deployer] = await ethers.getSigners();
  const factory = await ethers.getContractAt(
    "TeamTokenFactory",
    CONTRACT_ADDRESSES.TeamTokenFactory,
    deployer
  );

  console.log("Deploying Puebla FC token...");
  // Dynamically fetch and buffer the gas price
  const provider = deployer.provider!;
  const feeData = await provider.getFeeData();
  const baseGasPrice = feeData.gasPrice || ethers.parseUnits('10', 'gwei');
  const gasPrice = (baseGasPrice * BigInt(150)) / BigInt(100); // 50% higher
  const gasLimit = 3_000_000; // Reasonable gas limit for token creation
  const nonce = await provider.getTransactionCount(deployer.address, "pending");
  console.log(`Using pending nonce: ${nonce}`);
  console.log(`Base gas price: ${ethers.formatUnits(baseGasPrice, 'gwei')} gwei`);
  console.log(`Buffered gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
  console.log(`Gas limit: ${gasLimit}`);

  const tx = await factory.createToken(
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
  console.log("Transaction sent:", tx.hash);

  // Wait for 2 confirmations
  console.log("Waiting for 2 confirmations...");
  const receipt = await tx.wait(2);
  if (!receipt) {
    console.error("❌ Transaction receipt is null or undefined");
    return;
  }
  console.log(`Transaction confirmed in block ${receipt.blockNumber} with status ${receipt.status}`);
  // Defensive: logs may be undefined
  let event: any = null;
  if (Array.isArray(receipt.logs)) {
    event = (receipt.logs
      .map((log: any) => {
        try {
          return factory.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((parsed: any) => parsed && parsed.name === "TokenCreated")) || null;
  }

  if (event && event.args && ("tokenAddress" in event.args)) {
    const tokenAddress = event.args.tokenAddress;
    console.log(`✅ Puebla FC token deployed at: ${tokenAddress}`);
  } else {
    if (!receipt) {
      console.error("❌ Transaction receipt is null or undefined");
    } else {
      console.error("❌ TokenCreated event not found in receipt");
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
