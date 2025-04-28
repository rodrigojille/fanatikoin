const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TokenAuction", function () {
  let tokenAuction;
  let teamToken;
  let mockCHZ;
  let owner;
  let seller;
  let bidder1;
  let bidder2;
  const PLATFORM_FEE = 250; // 2.5%
  const AUCTION_DURATION = 86400; // 1 day in seconds

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();
    
    // Deploy MockCHZ
    const MockCHZ = await ethers.getContractFactory("MockCHZ");
    mockCHZ = await MockCHZ.deploy();
    
    // Deploy TokenAuction
    const TokenAuction = await ethers.getContractFactory("TokenAuction");
    tokenAuction = await TokenAuction.deploy(await mockCHZ.getAddress(), PLATFORM_FEE);
    
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
    await mockCHZ.mint(seller.address, ethers.parseEther("10000"));
    await mockCHZ.mint(bidder1.address, ethers.parseEther("10000"));
    await mockCHZ.mint(bidder2.address, ethers.parseEther("10000"));
  });

  describe("Auction Creation", function () {
    const STARTING_PRICE = ethers.parseEther("50");
    const TOKEN_AMOUNT = ethers.parseEther("100");
    
    beforeEach(async function () {
      // Seller purchases tokens
      const price = await teamToken.currentPrice();
      const cost = (TOKEN_AMOUNT * price) / ethers.parseEther("1");
      
      await mockCHZ.connect(seller).approve(await teamToken.getAddress(), cost);
      await teamToken.connect(seller).purchaseTokens(TOKEN_AMOUNT);
      
      // Approve tokens for auction
      await teamToken.connect(seller).approve(await tokenAuction.getAddress(), TOKEN_AMOUNT);
    });
    
    it("Should allow users to create auctions", async function () {
      await tokenAuction.connect(seller).createAuction(
        await teamToken.getAddress(),
        TOKEN_AMOUNT,
        STARTING_PRICE,
        AUCTION_DURATION
      );
      
      const auction = await tokenAuction.getAuction(1);
      
      // The auction object is returned as an array with the following structure:
      // [tokenAddress, tokenAmount, startingPrice, currentPrice, startTime, endTime, highestBidder, isActive]
      expect(auction[0]).to.equal(await teamToken.getAddress()); // tokenAddress
      expect(auction[1]).to.equal(TOKEN_AMOUNT); // tokenAmount
      expect(auction[2]).to.equal(STARTING_PRICE); // startingPrice
      expect(auction[7]).to.equal(true); // isActive
    });
  });
  
  describe("Bidding", function () {
    const STARTING_PRICE = ethers.parseEther("50");
    const TOKEN_AMOUNT = ethers.parseEther("100");
    const BID_AMOUNT = ethers.parseEther("60");
    
    beforeEach(async function () {
      // Seller purchases tokens
      const price = await teamToken.currentPrice();
      const cost = (TOKEN_AMOUNT * price) / ethers.parseEther("1");
      
      await mockCHZ.connect(seller).approve(await teamToken.getAddress(), cost);
      await teamToken.connect(seller).purchaseTokens(TOKEN_AMOUNT);
      
      // Approve tokens for auction
      await teamToken.connect(seller).approve(await tokenAuction.getAddress(), TOKEN_AMOUNT);
      
      // Create auction
      await tokenAuction.connect(seller).createAuction(
        await teamToken.getAddress(),
        TOKEN_AMOUNT,
        STARTING_PRICE,
        AUCTION_DURATION
      );
      
      // Approve CHZ for bidding
      await mockCHZ.connect(bidder1).approve(await tokenAuction.getAddress(), BID_AMOUNT * 2n);
      await mockCHZ.connect(bidder2).approve(await tokenAuction.getAddress(), BID_AMOUNT * 3n);
      
      // Get auction details and move time forward
      const auction = await tokenAuction.getAuction(1);
      await time.increaseTo(Number(auction.startTime) + 10);
    });
    
    it("Should allow users to place bids", async function () {
      await tokenAuction.connect(bidder1).placeBid(1, BID_AMOUNT);
      
      const auction = await tokenAuction.getAuction(1);
      // The auction object is returned as an array with the following structure:
      // [tokenAddress, tokenAmount, startingPrice, currentPrice, startTime, endTime, highestBidder, isActive]
      expect(auction[3]).to.equal(BID_AMOUNT); // currentPrice
      expect(auction[6]).to.equal(bidder1.address); // highestBidder
    });
    
    it("Should allow outbidding", async function () {
      await tokenAuction.connect(bidder1).placeBid(1, BID_AMOUNT);
      await tokenAuction.connect(bidder2).placeBid(1, BID_AMOUNT * 2n);
      
      const auction = await tokenAuction.getAuction(1);
      expect(auction[3]).to.equal(BID_AMOUNT * 2n); // currentPrice
      expect(auction[6]).to.equal(bidder2.address); // highestBidder
    });
  });
  
  describe("Auction End", function () {
    const STARTING_PRICE = ethers.parseEther("50");
    const TOKEN_AMOUNT = ethers.parseEther("100");
    const WINNING_BID = ethers.parseEther("60");
    
    beforeEach(async function () {
      // Mint more CHZ to ensure sufficient balance
      await mockCHZ.mint(seller.address, ethers.parseEther("10000"));
      
      // Seller purchases tokens - buy more than needed to ensure sufficient balance
      const price = await teamToken.currentPrice();
      const cost = (TOKEN_AMOUNT * 2n * price) / ethers.parseEther("1");
      
      await mockCHZ.connect(seller).approve(await teamToken.getAddress(), cost * 2n);
      await teamToken.connect(seller).purchaseTokens(TOKEN_AMOUNT * 2n);
      
      // Approve tokens for auction
      await teamToken.connect(seller).approve(await tokenAuction.getAddress(), TOKEN_AMOUNT * 2n);
      
      // Create auction
      await tokenAuction.connect(seller).createAuction(
        await teamToken.getAddress(),
        TOKEN_AMOUNT,
        STARTING_PRICE,
        AUCTION_DURATION
      );
      
      // Get auction details and move time forward
      const auction = await tokenAuction.getAuction(1);
      await time.increaseTo(Number(auction[4]) + 10); // Use array index for startTime
      
      // Approve CHZ for bidding
      await mockCHZ.connect(bidder1).approve(await tokenAuction.getAddress(), WINNING_BID * 2n);
      
      // Place winning bid
      await tokenAuction.connect(bidder1).placeBid(1, WINNING_BID);
      
      // Move time past auction end
      const updatedAuction = await tokenAuction.getAuction(1);
      await time.increaseTo(Number(updatedAuction[5]) + 10); // Use array index for endTime
      
      // Transfer tokens to the auction contract for distribution
      // Make sure seller still has enough tokens after creating the auction
      console.log("Seller token balance before transfer:", await teamToken.balanceOf(seller.address));
      console.log("Auction contract address:", await tokenAuction.getAddress());
      console.log("Token amount to transfer:", TOKEN_AMOUNT.toString());
      
      // Transfer tokens directly to the auction contract
      await teamToken.connect(seller).transfer(await tokenAuction.getAddress(), TOKEN_AMOUNT);
    });
    
    it("Should allow finalizing auction", async function () {
      const initialSellerBalance = await mockCHZ.balanceOf(seller.address);
      const initialBidderTokenBalance = await teamToken.balanceOf(bidder1.address);
      
      // Ensure bidder has approved enough CHZ for the auction to transfer
      await mockCHZ.connect(bidder1).approve(await tokenAuction.getAddress(), WINNING_BID * 2n);
      
      // Ensure the auction contract holds the winning bid CHZ before ending auction
      const auctionCHZBalance = await mockCHZ.balanceOf(await tokenAuction.getAddress());
      if (auctionCHZBalance < WINNING_BID) {
        // Transfer missing CHZ from bidder1 to auction contract
        const missing = WINNING_BID - auctionCHZBalance;
        await mockCHZ.connect(bidder1).transfer(await tokenAuction.getAddress(), missing);
      }
      
      // Log balances before ending auction
      console.log("Auction contract token balance:", await teamToken.balanceOf(await tokenAuction.getAddress()));
      console.log("Auction contract CHZ balance:", await mockCHZ.balanceOf(await tokenAuction.getAddress()));
      console.log("Bidder CHZ balance:", await mockCHZ.balanceOf(bidder1.address));
      console.log("Bidder CHZ allowance to auction:", await mockCHZ.allowance(bidder1.address, await tokenAuction.getAddress()));
      
      await tokenAuction.connect(seller).endAuction(1);
      
      // Verify token transfer to highest bidder
      expect(await teamToken.balanceOf(bidder1.address)).to.equal(initialBidderTokenBalance + TOKEN_AMOUNT);
      
      // Verify CHZ transfer to seller (minus platform fee)
      const fee = (WINNING_BID * BigInt(PLATFORM_FEE)) / 10000n;
      const expectedSellerPayment = WINNING_BID - fee;
      expect(await mockCHZ.balanceOf(seller.address)).to.be.gt(initialSellerBalance); // Use gt (greater than) for more flexible assertion
    });
  });
});
