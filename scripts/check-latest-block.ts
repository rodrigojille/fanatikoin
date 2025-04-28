import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  const provider = (await ethers.getSigners())[0].provider!;
  const latestBlock = await provider.getBlock("latest");
  console.log("Latest block number:", latestBlock.number);
  console.log("Block timestamp:", new Date(latestBlock.timestamp * 1000).toLocaleString());
  console.log("Block hash:", latestBlock.hash);
  console.log("Block transactions count:", latestBlock.transactions.length);
}

main().catch(console.error);
