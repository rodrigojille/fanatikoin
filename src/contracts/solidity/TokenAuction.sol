// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TokenAuction
 * @dev Contract for managing token auctions
 */
contract TokenAuction is Ownable, ReentrancyGuard, Pausable {
    // Auction structure
    struct Auction {
        address tokenAddress;
        uint256 tokenAmount;
        uint256 startingPrice;
        uint256 currentPrice;
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
        address seller;
        bool isActive;
    }
    
    // Mapping of auction IDs to auctions
    mapping(uint256 => Auction) public auctions;
    
    // Next auction ID
    uint256 public nextAuctionId;
    
    // Pull-over-push refund mapping
    mapping(address => uint256) public pendingReturns;

    // Platform fee rate (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeeRate;
    
    // Chiliz token address
    IERC20 public chilizToken;
    
    // Events
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed tokenAddress,
        uint256 tokenAmount,
        uint256 startingPrice,
        uint256 duration
    );
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 finalPrice
    );
    event PlatformFeeUpdated(uint256 newFeeRate);
    
    /**
     * @dev Constructor to create the auction contract
     * @param _chilizToken Address of the CHZ token
     * @param _platformFeeRate Platform fee rate (in basis points)
     */
    constructor(address _chilizToken, uint256 _platformFeeRate) {
        require(_platformFeeRate <= 10000, "Fee rate must be <= 100%");
        require(_chilizToken != address(0), "Invalid CHZ token address");
        
        chilizToken = IERC20(_chilizToken);
        platformFeeRate = _platformFeeRate;
        nextAuctionId = 1;
    }
    
    /**
     * @dev Create a new auction
     * @param tokenAddress Address of the token to auction
     * @param tokenAmount Amount of tokens to auction
     * @param startingPrice Starting price in CHZ
     * @param duration Duration of the auction in seconds
     */
    function createAuction(
        address tokenAddress,
        uint256 tokenAmount,
        uint256 startingPrice,
        uint256 duration
    ) public whenNotPaused nonReentrant {
        require(tokenAddress != address(0), "Invalid token address");
        require(tokenAmount > 0, "Token amount must be > 0");
        require(startingPrice > 0, "Starting price must be > 0");
        require(duration > 0, "Duration must be > 0");
        
        // Transfer tokens from seller to contract
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokenAmount);
        
        // Create new auction
        auctions[nextAuctionId] = Auction(
            tokenAddress,
            tokenAmount,
            startingPrice,
            startingPrice,
            block.timestamp,
            block.timestamp + duration,
            address(0),
            msg.sender,
            true
        );
        
        emit AuctionCreated(
            nextAuctionId,
            tokenAddress,
            tokenAmount,
            startingPrice,
            duration
        );
        
        nextAuctionId++;
    }
    
    /**
     * @dev Place a bid on an auction
     * @param auctionId ID of the auction
     * @param amount Amount of CHZ to bid
     */
    function placeBid(uint256 auctionId, uint256 amount) public whenNotPaused nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(amount > auction.currentPrice, "Bid must be higher than current price");
        
        // Pull-over-push: credit refund to previous bidder
        if (auction.highestBidder != address(0)) {
            pendingReturns[auction.highestBidder] += auction.currentPrice;
        }
        
        // Update auction state
        auction.currentPrice = amount;
        auction.highestBidder = msg.sender;
        
        emit BidPlaced(auctionId, msg.sender, amount);
    }
    
    /**
     * @dev End an auction
     * @param auctionId ID of the auction
     */
    function endAuction(uint256 auctionId) public whenNotPaused nonReentrant {
        require(auctions[auctionId].isActive, "Auction not active");
        require(block.timestamp >= auctions[auctionId].endTime, "Auction not ended");
        
        Auction storage auction = auctions[auctionId];
        auction.isActive = false;
        
        // Check CHZ allowance before transfer
        require(
            chilizToken.allowance(auction.highestBidder, address(this)) >= auction.currentPrice,
            "Insufficient CHZ allowance"
        );
        
        // Check token allowance before transfer
        IERC20 token = IERC20(auction.tokenAddress);
        require(
            token.allowance(auction.seller, address(this)) >= auction.tokenAmount,
            "Insufficient token allowance"
        );
        
        // Calculate platform fee
        uint256 platformFee = (auction.currentPrice * platformFeeRate) / 10000;
        
        // Transfer CHZ to owner (platform fee) from contract balance
        require(
            chilizToken.transfer(owner(), platformFee),
            "CHZ transfer failed"
        );
        // Transfer remaining CHZ to seller from contract balance
        uint256 sellerEarnings = auction.currentPrice - platformFee;
        require(
            chilizToken.transfer(auction.seller, sellerEarnings),
            "CHZ transfer failed"
        );
        // Transfer tokens to highest bidder
        require(
            token.transfer(auction.highestBidder, auction.tokenAmount),
            "Token transfer failed"
        );
        
        emit AuctionEnded(
            auctionId,
            auction.highestBidder,
            auction.currentPrice
        );
    }
    
    /**
     * @dev Update platform fee rate
     * @param newFeeRate New fee rate (in basis points)
     */
    function updatePlatformFee(uint256 newFeeRate) public onlyOwner {
        require(newFeeRate <= 10000, "Fee rate must be <= 100%");
        
        platformFeeRate = newFeeRate;
        emit PlatformFeeUpdated(newFeeRate);
    }
    
    /**
     * @dev Get auction information
     * @param auctionId ID of the auction
     * @return tokenAddress Address of the token being auctioned
     * @return tokenAmount Amount of tokens being auctioned
     * @return startingPrice Initial price of the auction
     * @return currentPrice Current highest bid
     * @return startTime Start time of the auction
     * @return endTime End time of the auction
     * @return highestBidder Address of the highest bidder
     * @return isActive Whether the auction is still active
     */
    function getAuction(uint256 auctionId)
        public
        view
        returns (
            address tokenAddress,
            uint256 tokenAmount,
            uint256 startingPrice,
            uint256 currentPrice,
            uint256 startTime,
            uint256 endTime,
            address highestBidder,
            bool isActive
        )
    {
        Auction storage auction = auctions[auctionId];
        
        return (
            auction.tokenAddress,
            auction.tokenAmount,
            auction.startingPrice,
            auction.currentPrice,
            auction.startTime,
            auction.endTime,
            auction.highestBidder,
            auction.isActive
        );
    }
    
    /**
     * @dev Get all active auctions
     * @return Array of auction IDs
     */
    function getAllActiveAuctions() public view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i < nextAuctionId; i++) {
            if (auctions[i].isActive) count++;
        }
        
        uint256[] memory auctionIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < nextAuctionId; i++) {
            if (auctions[i].isActive) {
                auctionIds[index] = i;
                index++;
            }
        }
        
        return auctionIds;
    }
}
