// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TeamToken.sol";

/**
 * @title TokenMarketplace
 * @dev Marketplace contract for buying and selling team tokens
 */
contract TokenMarketplace is Ownable, ReentrancyGuard, Pausable {
    // Mapping of token addresses to their prices
    mapping(address => uint256) public tokenPrices;
    
    // Mapping of token addresses to their listing status
    mapping(address => bool) public listedTokens;
    // Mapping of token addresses to their sellers
    mapping(address => address) public tokenSellers;
    // Array to store all currently listed token addresses
    address[] private listedTokensArray;
    // Mapping to store the index of each token in the array (for efficient removal)
    mapping(address => uint256) private tokenIndex;
    
    // Platform fee rate (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeeRate;
    
    // Chiliz token address
    IERC20 public chilizToken;
    
    // Events
    /**
     * @dev Return all currently listed tokens (empty array if none)
     */
    function getAllTokens() public view returns (address[] memory) {
        return listedTokensArray;
    }
    /**
     * @dev Get the number of listed tokens
     */
    function listedTokensCount() public view returns (uint256) {
        return listedTokensArray.length;
    }
    event TokenListed(address indexed tokenAddress, uint256 price);
    event TokenDelisted(address indexed tokenAddress);
    event TokenPriceUpdated(address indexed tokenAddress, uint256 newPrice);
    event TokenPurchased(
        address indexed buyer,
        address indexed tokenAddress,
        uint256 amount,
        uint256 price
    );
    event TokenSold(
        address indexed seller,
        address indexed tokenAddress,
        uint256 amount,
        uint256 price
    );
    event PlatformFeeUpdated(uint256 newFeeRate);
    
    /**
     * @dev Constructor to create the marketplace
     * @param _chilizToken Address of the CHZ token
     * @param _platformFeeRate Platform fee rate (in basis points)
     */
    constructor(address _chilizToken, uint256 _platformFeeRate) {
        require(_platformFeeRate <= 10000, "Fee rate must be <= 100%");
        require(_chilizToken != address(0), "Invalid CHZ token address");
        
        chilizToken = IERC20(_chilizToken);
        platformFeeRate = _platformFeeRate;
    }
    
    /**
     * @dev List a token for sale
     * @param tokenAddress Address of the token to list
     * @param price Price per token in CHZ
     */
    function listToken(address tokenAddress, uint256 price) public whenNotPaused nonReentrant {
        require(tokenAddress != address(0), "Invalid token address");
        require(price > 0, "Price must be > 0");
        require(!listedTokens[tokenAddress], "Token already listed");
        // Add token to listed tokens
        listedTokens[tokenAddress] = true;
        tokenPrices[tokenAddress] = price;
        tokenSellers[tokenAddress] = msg.sender;
        // Robust: Track in array for enumeration
        tokenIndex[tokenAddress] = listedTokensArray.length;
        listedTokensArray.push(tokenAddress);
        emit TokenListed(tokenAddress, price);
    }
    
    /**
     * @dev Delist a token from sale
     * @param tokenAddress Address of the token to delist
     */
    function delistToken(address tokenAddress) public whenNotPaused nonReentrant {
        require(listedTokens[tokenAddress], "Token not listed");
        delete tokenPrices[tokenAddress];
        listedTokens[tokenAddress] = false;
        // Robust: Remove from array efficiently
        uint256 idx = tokenIndex[tokenAddress];
        uint256 lastIdx = listedTokensArray.length - 1;
        if (idx != lastIdx) {
            address lastToken = listedTokensArray[lastIdx];
            listedTokensArray[idx] = lastToken;
            tokenIndex[lastToken] = idx;
        }
        listedTokensArray.pop();
        delete tokenIndex[tokenAddress];
        emit TokenDelisted(tokenAddress);
    }
    
    /**
     * @dev Update token price
     * @param tokenAddress Address of the token
     * @param newPrice New price per token in CHZ
     */
    function updateTokenPrice(address tokenAddress, uint256 newPrice) public {
        require(listedTokens[tokenAddress], "Token not listed");
        require(newPrice > 0, "Price must be > 0");
        
        tokenPrices[tokenAddress] = newPrice;
        emit TokenPriceUpdated(tokenAddress, newPrice);
    }
    
    /**
     * @dev Buy tokens from the marketplace
     * @param tokenAddress Address of the token to buy
     * @param amount Amount of tokens to buy
     */
    function buyTokens(address tokenAddress, uint256 amount) public whenNotPaused nonReentrant {
        require(tokenAddress != address(0), "Invalid token address");
        require(listedTokens[tokenAddress], "Token not listed");
        require(amount > 0, "Amount must be > 0");
        
        uint256 price = tokenPrices[tokenAddress];
        uint256 totalCost = price * amount;
        
        // Calculate platform fee (2.5%)
        uint256 platformFee = (totalCost * 250) / 10000;
        uint256 sellerEarnings = totalCost - platformFee;
        
        // Check CHZ allowance before transfer
        require(
            chilizToken.allowance(msg.sender, address(this)) >= totalCost,
            "Insufficient CHZ allowance"
        );
        
        // Check token allowance before transfer
        IERC20 token = IERC20(tokenAddress);
        address seller = tokenSellers[tokenAddress];
        require(
            token.allowance(seller, address(this)) >= amount,
            "Insufficient token allowance"
        );
        // Checks-effects-interactions pattern
        // Effects: none for this function
        // Interactions:
        // Send platform fee to owner (Fanatikoin)
        require(
            chilizToken.transferFrom(msg.sender, owner(), platformFee),
            "Platform fee transfer failed"
        );
        require(
            chilizToken.transferFrom(msg.sender, seller, sellerEarnings),
            "Seller payment failed"
        );
        require(
            token.transferFrom(seller, msg.sender, amount),
            "Token transfer failed"
        );
        
        emit TokenPurchased(msg.sender, tokenAddress, amount, price);
    }
    
    /**
     * @dev Sell tokens to the marketplace
     * @param tokenAddress Address of the token to sell
     * @param amount Amount of tokens to sell
     */
    function sellTokens(address tokenAddress, uint256 amount) public whenNotPaused nonReentrant {
        require(tokenAddress != address(0), "Invalid token address");
        require(listedTokens[tokenAddress], "Token not listed");
        require(amount > 0, "Amount must be > 0");
        
        uint256 price = tokenPrices[tokenAddress];
        uint256 totalEarnings = price * amount;
        
        // Checks-effects-interactions pattern
        IERC20 token = IERC20(tokenAddress);
        token.transferFrom(msg.sender, address(this), amount);
        require(
            chilizToken.transfer(msg.sender, totalEarnings),
            "CHZ transfer failed"
        );
        
        emit TokenSold(msg.sender, tokenAddress, amount, price);
    }
    

    
    /**
     * @dev Get token information
     * @param tokenAddress Address of the token
     * @return isListed Whether the token is listed
     * @return price Token price in CHZ
     * @return tokenName Name of the token
     * @return tokenSymbol Symbol of the token
     * @return tokenDescription Description of the token
     */
    function getTokenInfo(address tokenAddress)
        public
        view
        returns (
            bool isListed,
            uint256 price,
            string memory tokenName,
            string memory tokenSymbol,
            string memory tokenDescription
        )
    {
        isListed = listedTokens[tokenAddress];
        price = tokenPrices[tokenAddress];
        
        // Get TeamToken-specific information
        TeamToken teamToken = TeamToken(tokenAddress);
        tokenName = teamToken.name();
        tokenSymbol = teamToken.symbol();
        tokenDescription = teamToken.description();
    }
    
    /**
     * @dev Update platform fee rate
     * @param newFeeRate New fee rate (in basis points)
     */
    function updatePlatformFee(uint256 newFeeRate) public onlyOwner whenNotPaused nonReentrant {
        require(newFeeRate <= 10000, "Fee rate must be <= 100%");
        
        platformFeeRate = newFeeRate;
        emit PlatformFeeUpdated(newFeeRate);
    }
}
