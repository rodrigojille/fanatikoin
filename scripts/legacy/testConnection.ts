import { ethers, JsonRpcProvider } from "ethers";
import hre from "hardhat";
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from "../src/contracts/config";

async function main() {
  console.log("Testing connection to Chiliz testnet...");

  try {
    // Get network provider
    const provider = new JsonRpcProvider("https://spicy-rpc.chiliz.com/");
    
    // Get block number
    const blockNumber = await provider.getBlockNumber();
    console.log(`Connected to block number: ${blockNumber}`);

    // Get network information
    const [signer] = await hre.ethers.getSigners();
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name}`);
    console.log(`Chain ID: ${network.chainId}`);

    // Get CHZ token address from Chiliz testnet
    const chzTokenAddress = "0x0000000000000000000000000000000000001010"; // Native CHZ token on Spicy testnet
    console.log(`CHZ token address: ${chzTokenAddress}`);

    console.log("\nConnection test successful!");
  } catch (error) {
    console.error("Connection test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
