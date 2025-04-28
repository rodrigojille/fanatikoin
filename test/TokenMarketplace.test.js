const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenMarketplace", function () {
  let tokenMarketplace;
  let teamToken;
  let mockCHZ;
  let owner;
  let seller;
  let buyer;
  const PLATFORM_FEE = 250; // 2.5%

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();
    
    // Deploy MockCHZ
    const MockCHZ = await ethers.getContractFactory("MockCHZ");
    mockCHZ = await MockCHZ.deploy();
    
    // Deploy TokenMarketplace
    const TokenMarketplace = await ethers.getContractFactory("TokenMarketplace");
    tokenMarketplace = await TokenMarketplace.deploy(await mockCHZ.getAddress(), PLATFORM_FEE);
    
    // Deploy TeamToken
    const TeamToken = await ethers.getContractFactory("TeamToken");
    teamToken = await TeamToken.deploy(
      "Test Token",
      "TEST",
      "Test Description",
      ["Benefit 1", "Benefit 2"],
      ethers.parseEther("1000000"), // maxSupply
      ethers.parseEther("10"), // initialPrice
      await mockCHZ.getAddress(),
      seller.address // teamWallet for tests
    );
    
    // Mint CHZ to all accounts
    await mockCHZ.mint(owner.address, ethers.parseEther("10000"));
    await mockCHZ.mint(seller.address, ethers.parseEther("10000"));
    await mockCHZ.mint(buyer.address, ethers.parseEther("10000"));
  });

  describe("Listing", function () {
    const LISTING_PRICE = ethers.parseEther("50");
    const LISTING_AMOUNT = ethers.parseEther("100");
    
    beforeEach(async function () {
      // Seller purchases tokens
      const price = await teamToken.currentPrice();
      const cost = (LISTING_AMOUNT * price) / ethers.parseEther("1");
      
      await mockCHZ.connect(seller).approve(await teamToken.getAddress(), cost);
      await teamToken.connect(seller).purchaseTokens(LISTING_AMOUNT);
    });
    
    it("Should allow users to list tokens", async function () {
      await teamToken.connect(seller).approve(await tokenMarketplace.getAddress(), LISTING_AMOUNT);
      await tokenMarketplace.connect(seller).listToken(await teamToken.getAddress(), LISTING_PRICE);
      
      expect(await tokenMarketplace.listedTokens(await teamToken.getAddress())).to.equal(true);
      expect(await tokenMarketplace.tokenPrices(await teamToken.getAddress())).to.equal(LISTING_PRICE);
      expect(await tokenMarketplace.tokenSellers(await teamToken.getAddress())).to.equal(seller.address);
    });
  });
  
  describe("Purchase", function () {
    const LISTING_PRICE = ethers.parseEther("50");
    const PURCHASE_AMOUNT = ethers.parseEther("10");
    
    beforeEach(async function () {
      // Seller purchases tokens - buy more than needed to ensure sufficient balance
      const price = await teamToken.currentPrice();
      const cost = (PURCHASE_AMOUNT * 10n * price) / ethers.parseEther("1");
      
      await mockCHZ.connect(seller).approve(await teamToken.getAddress(), cost);
      await teamToken.connect(seller).purchaseTokens(PURCHASE_AMOUNT * 10n);
      
      // List tokens - ensure the seller approves enough tokens for the marketplace
      await teamToken.connect(seller).approve(await tokenMarketplace.getAddress(), PURCHASE_AMOUNT * 10n);
      await tokenMarketplace.connect(seller).listToken(await teamToken.getAddress(), LISTING_PRICE);
      
      // Approve CHZ for token purchase - ensure buyer approves enough CHZ
      const purchaseCost = LISTING_PRICE * PURCHASE_AMOUNT * 2n; // Double to be safe
      await mockCHZ.connect(buyer).approve(await tokenMarketplace.getAddress(), purchaseCost);
      
      // Make sure buyer has enough CHZ
      await mockCHZ.mint(buyer.address, purchaseCost * 2n);
    });
    
    it("Should allow users to purchase listed tokens", async function () {
      // Get initial balances
      const initialSellerBalance = await mockCHZ.balanceOf(seller.address);
      const initialBuyerTokens = await teamToken.balanceOf(buyer.address);
      
      // Log balances and approvals for debugging
      console.log("Buyer CHZ balance:", await mockCHZ.balanceOf(buyer.address));
      console.log("Seller token balance:", await teamToken.balanceOf(seller.address));
      console.log("Marketplace token allowance from seller:", 
                 await teamToken.allowance(seller.address, await tokenMarketplace.getAddress()));
      console.log("Marketplace CHZ allowance from buyer:", 
                 await mockCHZ.allowance(buyer.address, await tokenMarketplace.getAddress()));
      
      // Execute purchase
      await tokenMarketplace.connect(buyer).buyTokens(await teamToken.getAddress(), PURCHASE_AMOUNT);
      
      // Verify token transfer
      expect(await teamToken.balanceOf(buyer.address)).to.equal(initialBuyerTokens + PURCHASE_AMOUNT);
      
      // Verify CHZ transfer
      expect(await mockCHZ.balanceOf(seller.address)).to.be.gt(initialSellerBalance);
    });
  });
});
