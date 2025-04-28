import { expect } from "chai";
import { ethers } from "hardhat";
import type { IERC20, ITeamToken, IMockCHZ } from "./types";

describe("TeamToken", function () {
  let teamToken: ITeamToken;
  let mockCHZ: IMockCHZ;
  let owner: any;
  let buyer: any;
  let beneficiary: any;

  const TOKEN_NAME = "Barcelona Fan Token";
  const TOKEN_SYMBOL = "BAR";
  const DESCRIPTION = "Official Barcelona Fan Token";
  const BENEFITS = ["VIP Access", "Voting Rights"];
  const MAX_SUPPLY = ethers.parseEther("1000000");
  const INITIAL_PRICE = ethers.parseEther("25");
  const PURCHASE_AMOUNT = ethers.parseEther("100");
  const TRANSFER_AMOUNT = ethers.parseEther("50");

  beforeEach(async function () {
    [owner, buyer, beneficiary] = await ethers.getSigners();

    // Deploy MockCHZ
    const mockCHZFactory = await ethers.getContractFactory("MockCHZ");
    const mockCHZContract = await mockCHZFactory.deploy();
    await mockCHZContract.waitForDeployment();
    mockCHZ = mockCHZContract as unknown as IMockCHZ & { deploymentTransaction(): any };
    await mockCHZ.waitForDeployment();

    // Deploy TeamToken
    const teamTokenFactory = await ethers.getContractFactory("TeamToken");
    const teamTokenContract = await teamTokenFactory.deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      DESCRIPTION,
      BENEFITS,
      MAX_SUPPLY,
      INITIAL_PRICE,
      await mockCHZ.getAddress(),
      beneficiary.address // Use beneficiary as teamWallet for tests
    );
    await teamTokenContract.waitForDeployment();
    teamToken = teamTokenContract as unknown as ITeamToken & { deploymentTransaction(): any };

    // Mint some CHZ tokens for testing
    await mockCHZ.mint(await owner.getAddress(), ethers.parseEther("10000"));
    await mockCHZ.connect(owner).transfer(await buyer.getAddress(), ethers.parseEther("10000"));
    await mockCHZ.connect(buyer).approve(
      await teamToken.getAddress(),
      ethers.parseEther("10000")
    );
  });

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      expect(await teamToken.name()).to.equal(TOKEN_NAME);
      expect(await teamToken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should set the correct description and benefits", async function () {
      expect(await teamToken.description()).to.equal(DESCRIPTION);
      const benefits = await teamToken.getBenefits();
      expect(benefits).to.deep.equal(BENEFITS);
    });

    it("Should set the correct max supply and initial price", async function () {
      expect(await teamToken.maxSupply()).to.equal(MAX_SUPPLY);
      expect(await teamToken.currentPrice()).to.equal(INITIAL_PRICE);
    });
  });

  describe("Token Purchase", function () {
    const PURCHASE_AMOUNT = ethers.parseEther("100");

    it("Should allow users to purchase tokens", async function () {
      const initialBuyerBalance = await mockCHZ.balanceOf(buyer.address);
      const initialTeamTokenBalance = await teamToken.balanceOf(buyer.address);
      const initialTeamTokenSupply = await teamToken.totalSupply();

      const price = await teamToken.currentPrice();
      // Calculate cost as the contract does: (amount * currentPrice) / (10**18)
      const cost = (PURCHASE_AMOUNT * price) / ethers.parseEther("1");

      // First ensure we have a clean allowance state
      await mockCHZ.connect(buyer).approve(await teamToken.getAddress(), 0);
      
      // Then approve with a large enough allowance
      await mockCHZ.connect(buyer).approve(
        await teamToken.getAddress(),
        cost * 2n // Ensure we have more than enough allowance
      );
      
      // Verify the allowance is set correctly
      const mockCHZAsERC20 = await ethers.getContractAt("IERC20", await mockCHZ.getAddress());
      const allowance = await mockCHZAsERC20.allowance(buyer.address, await teamToken.getAddress());
      expect(allowance).to.be.gte(cost, "Allowance should be sufficient");

      const ownerBalanceBefore = await mockCHZ.balanceOf(owner.address);
      await teamToken.connect(buyer).purchaseTokens(PURCHASE_AMOUNT);

      expect(await teamToken.balanceOf(buyer.address)).to.equal(
        initialTeamTokenBalance + PURCHASE_AMOUNT
      );

      expect(await teamToken.totalSupply()).to.equal(
        initialTeamTokenSupply + PURCHASE_AMOUNT
      );

      expect(await mockCHZ.balanceOf(buyer.address)).to.equal(
        initialBuyerBalance - cost
      );

      // Only 50% of cost goes to contract
      expect(await mockCHZ.balanceOf(await teamToken.getAddress())).to.equal(cost / 2n);
      // 50% of cost goes to owner
      const ownerBalanceAfter = await mockCHZ.balanceOf(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(cost / 2n);
    });

    it("Should fail if user has insufficient CHZ allowance", async function () {
      // Set a very small allowance
      await mockCHZ.connect(buyer).approve(
        await teamToken.getAddress(),
        ethers.parseEther("0.1") // Much less than needed for purchase
      );

      await expect(
        teamToken.connect(buyer).purchaseTokens(PURCHASE_AMOUNT)
      ).to.be.revertedWith("Insufficient CHZ allowance");
    });

    it("Should fail if purchase would exceed max supply", async function () {
      const tooMuch = MAX_SUPPLY + 1n;
      await expect(
        teamToken.connect(buyer).purchaseTokens(tooMuch)
      ).to.be.revertedWith("Purchase would exceed max supply");
    });
  });

  describe("Price Updates", function () {
    it("Should update price based on supply", async function () {
      const initialPrice = await teamToken.currentPrice();
      // Use a much smaller purchase amount to avoid issues
      const purchaseAmount = ethers.parseEther("10");
      
      // Calculate cost
      const price = await teamToken.currentPrice();
      const cost = (purchaseAmount * price) / ethers.parseEther("1");
      
      // Check buyer's CHZ balance
      const buyerCHZBalance = await mockCHZ.balanceOf(buyer.address);
      console.log("Buyer CHZ balance:", buyerCHZBalance.toString());
      console.log("Required cost:", cost.toString());
      
      // If buyer doesn't have enough CHZ, transfer some from owner
      if (buyerCHZBalance < cost) {
        // Transfer enough CHZ to cover the cost
        await mockCHZ.connect(owner).transfer(buyer.address, cost * 2n);
        console.log("Transferred CHZ to buyer");
      }
      
      // Approve CHZ tokens
      await mockCHZ.connect(buyer).approve(await teamToken.getAddress(), 0); // Reset allowance
      await mockCHZ.connect(buyer).approve(await teamToken.getAddress(), cost * 2n);
      
      // Verify the allowance is set correctly
      const mockCHZAsERC20 = await ethers.getContractAt("IERC20", await mockCHZ.getAddress());
      const allowance = await mockCHZAsERC20.allowance(buyer.address, await teamToken.getAddress());
      expect(allowance).to.be.gte(cost, "Allowance should be sufficient");
      
      // Verify buyer has enough CHZ balance now
      const updatedBuyerCHZBalance = await mockCHZ.balanceOf(buyer.address);
      expect(updatedBuyerCHZBalance).to.be.gte(cost, "Buyer should have enough CHZ balance");
      
      // Check current supply to ensure we don't exceed max supply
      const currentSupply = await teamToken.totalSupply();
      const maxSupply = await teamToken.maxSupply();
      expect(currentSupply + purchaseAmount).to.be.lte(maxSupply, "Purchase would exceed max supply");
      
      await teamToken.connect(buyer).purchaseTokens(purchaseAmount);
      
      const newPrice = await teamToken.currentPrice();
      expect(newPrice).to.be.gt(initialPrice);
    });
  });

  describe("Token Transfer", function () {
    const TRANSFER_AMOUNT = ethers.parseEther("50");
    let buyerTokenBalance: bigint;

    beforeEach(async function () {
      // Buy some tokens first
      const price = await teamToken.currentPrice();
      const cost = (TRANSFER_AMOUNT * price) / ethers.parseEther("1");
      
      // Approve CHZ tokens
      await mockCHZ.connect(buyer).approve(await teamToken.getAddress(), 0); // Reset allowance
      await mockCHZ.connect(buyer).approve(await teamToken.getAddress(), cost * 2n);
      
      // Verify the allowance is set correctly
      const mockCHZAsERC20 = await ethers.getContractAt("IERC20", await mockCHZ.getAddress());
      const allowance = await mockCHZAsERC20.allowance(buyer.address, await teamToken.getAddress());
      expect(allowance).to.be.gte(cost, "Allowance should be sufficient");
      
      await teamToken.connect(buyer).purchaseTokens(TRANSFER_AMOUNT);
      
      // Verify buyer has the tokens
      buyerTokenBalance = await teamToken.balanceOf(buyer.address);
      expect(buyerTokenBalance).to.equal(TRANSFER_AMOUNT, "Buyer should have tokens to transfer");
    });

    it("Should allow token transfers", async function () {
      // Check buyer's balance before transfer
      const buyerBalanceBefore = await teamToken.balanceOf(buyer.address);
      console.log("Buyer balance before transfer:", buyerBalanceBefore.toString());
      
      // Transfer a smaller amount to avoid issues
      const transferAmount = ethers.parseEther("10");
      
      // Make sure buyer has enough tokens
      expect(buyerBalanceBefore).to.be.gte(transferAmount, "Buyer should have enough tokens to transfer");
      
      await teamToken.connect(buyer).transfer(owner.address, transferAmount);
      
      // Check balances after transfer
      const ownerBalance = await teamToken.balanceOf(owner.address);
      const buyerBalanceAfter = await teamToken.balanceOf(buyer.address);
      
      console.log("Owner balance after transfer:", ownerBalance.toString());
      console.log("Buyer balance after transfer:", buyerBalanceAfter.toString());
      
      expect(ownerBalance).to.equal(transferAmount);
      expect(buyerBalanceAfter).to.equal(buyerBalanceBefore - transferAmount);
    });
  });

  describe("Withdrawals", function () {
    it("Should allow the team to withdraw only their pool", async function () {
      // Buyer purchases tokens to fund team pool
      const price = await teamToken.currentPrice();
      const cost = (PURCHASE_AMOUNT * price) / ethers.parseEther("1");
      await mockCHZ.connect(buyer).approve(await teamToken.getAddress(), cost * 2n);
      await teamToken.connect(buyer).purchaseTokens(PURCHASE_AMOUNT);

      // Team pool should be funded
      const teamPool = await teamToken.teamPoolCHZ();
      expect(teamPool).to.equal(cost / 2n);

      // Team wallet can withdraw their pool
      const before = await mockCHZ.balanceOf(beneficiary.address);
      await expect(teamToken.connect(beneficiary).withdrawTeamCHZ(teamPool))
        .to.emit(teamToken, "TeamCHZWithdrawn").withArgs(beneficiary.address, teamPool);
      const after = await mockCHZ.balanceOf(beneficiary.address);
      expect(after - before).to.equal(teamPool);

      // Team cannot withdraw more than their pool
      await expect(teamToken.connect(beneficiary).withdrawTeamCHZ(1)).to.be.revertedWith("Amount exceeds team pool");
    });

    it("Should not allow non-team wallet to withdraw team pool", async function () {
      await expect(teamToken.connect(buyer).withdrawTeamCHZ(1)).to.be.revertedWith("Not team wallet");
    });

    it("Should allow the owner to withdraw only admin pool (dust)", async function () {
      // Buyer purchases tokens to fund team pool
      const price = await teamToken.currentPrice();
      const cost = (PURCHASE_AMOUNT * price) / ethers.parseEther("1");
      await mockCHZ.connect(buyer).approve(await teamToken.getAddress(), cost * 2n);
      await teamToken.connect(buyer).purchaseTokens(PURCHASE_AMOUNT);

      // Send extra CHZ to contract (simulate dust)
      await mockCHZ.connect(owner).transfer(await teamToken.getAddress(), 1000n);
      const contractBalance = await mockCHZ.balanceOf(await teamToken.getAddress());
      const teamPool = await teamToken.teamPoolCHZ();
      const adminPool = contractBalance - teamPool;
      expect(adminPool).to.be.gt(0);

      // Owner can withdraw admin pool
      const before = await mockCHZ.balanceOf(owner.address);
      await expect(teamToken.connect(owner).withdrawCHZ(adminPool))
        .to.emit(teamToken, "AdminCHZWithdrawn").withArgs(owner.address, adminPool);
      const after = await mockCHZ.balanceOf(owner.address);
      expect(after - before).to.equal(adminPool);

      // Owner cannot withdraw team pool
      await expect(teamToken.connect(owner).withdrawCHZ(teamPool)).to.be.revertedWith("Amount exceeds admin pool");
    });

    it("Should not allow non-owner to withdraw admin pool", async function () {
      await expect(teamToken.connect(buyer).withdrawCHZ(1)).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
