import { JsonRpcProvider } from "ethers";

async function main() {
  const rpcUrl = "https://spicy-rpc.chiliz.com/";
  const provider = new JsonRpcProvider(rpcUrl);
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log(`Connected to Chiliz Spicy Testnet. Latest block: ${blockNumber}`);
  } catch (err) {
    console.error("Failed to fetch block number from RPC:", err);
  }
}

main();
