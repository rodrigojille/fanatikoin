// scripts/deploy-team-token.ts
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying TeamToken with address:", deployer.address);

  // Set your desired parameters here
  const name = process.env.NEW_TEAM_TOKEN_NAME || "Puebla FC";
  const symbol = process.env.NEW_TEAM_TOKEN_SYMBOL || "PUE";
  const description = process.env.NEW_TEAM_TOKEN_DESCRIPTION || "Puebla FC Official Fan Token";
  const benefits = [
    "Voting rights",
    "Exclusive content",
    "Merch discounts"
  ];
  const maxSupply = ethers.parseUnits("1000000", 18); // 1 million tokens
  const initialPrice = ethers.parseUnits("1", 18); // 1 CHZ per token
  const chilizToken = process.env.CHILIZ_TOKEN_ADDRESS!;

  const TeamToken = await ethers.getContractFactory("TeamToken");
  const gasPrice = ethers.parseUnits('6000', 'gwei');
  const gasLimit = 7000000;
  const provider = deployer.provider!;
  console.log("About to deploy TeamToken with:", { name, symbol, description, benefits, maxSupply: maxSupply.toString(), initialPrice: initialPrice.toString(), chilizToken, gasPrice: gasPrice.toString(), gasLimit });
  const pendingNonce = await provider.getTransactionCount(deployer.address, "pending");
  const teamToken = await TeamToken.deploy(
    name,
    symbol,
    description,
    benefits,
    maxSupply,
    initialPrice,
    chilizToken,
    { gasPrice, gasLimit, nonce: pendingNonce }
  );
  console.log("Deployment transaction sent, waiting for confirmation...");
  await teamToken.waitForDeployment();
  const address = await teamToken.getAddress();
  console.log("TeamToken deployed to:", address);
  console.log("Used gas price:", ethers.formatUnits(gasPrice, 'gwei'), "gwei");
  console.log("Used gas limit:", gasLimit);
  console.log("Used nonce:", pendingNonce);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
