import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "ts-node/register/transpile-only";
import "tsconfig-paths/register";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    spicy: {
      url: process.env.NEXT_PUBLIC_RPC_URL || "https://spicy-rpc.chiliz.com",
      chainId: 88882, // Chiliz Spicy Testnet
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 100000000000, // 100 gwei (very high for urgent mining)
      gas: 7000000, // Increased gas limit
      timeout: 1200000 // 20 minutes
    },
  },
  paths: {
    sources: "./src/contracts/solidity",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
