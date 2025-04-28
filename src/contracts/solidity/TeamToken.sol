// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TeamToken is ERC20, Ownable {
    string public description;
    string[] public benefits;
    uint256 public maxSupply;
    uint256 public currentPrice;
    address public chilizToken;
    address public teamWallet;
    uint256 public teamPoolCHZ;

    event TeamCHZWithdrawn(address indexed team, uint256 amount);
    event AdminCHZWithdrawn(address indexed admin, uint256 amount);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _description,
        string[] memory _benefitsArray,
        uint256 _maxSupplyValue,
        uint256 _initialPriceValue,
        address _chilizToken,
        address _teamWallet
    ) ERC20(_name, _symbol) {
        description = _description;
        benefits = _benefitsArray;
        maxSupply = _maxSupplyValue;
        currentPrice = _initialPriceValue;
        chilizToken = _chilizToken;
        teamWallet = _teamWallet;
    }

    function getBenefits() public view returns (string[] memory) {
        return benefits;
    }

    function purchaseTokens(uint256 amount) public {
        require(totalSupply() + amount <= maxSupply, "Purchase would exceed max supply");
        
        // Calculate cost with proper precision
        uint256 cost = (amount * currentPrice) / (10**decimals());
        
        // Check if user has enough CHZ allowance
        require(
            IERC20(chilizToken).allowance(msg.sender, address(this)) >= cost,
            "Insufficient CHZ allowance"
        );
        
        // Split CHZ payment: 50% to owner (Fanatikoin), 50% to contract (team/creator)
        uint256 halfCost = cost / 2;
        require(
            IERC20(chilizToken).transferFrom(msg.sender, owner(), halfCost),
            "CHZ transfer to owner failed"
        );
        require(
            IERC20(chilizToken).transferFrom(msg.sender, address(this), cost - halfCost),
            "CHZ transfer to contract failed"
        );
        // Track team pool
        teamPoolCHZ += (cost - halfCost);
        
        // Mint team tokens to buyer
        _mint(msg.sender, amount);
        
        // Update the token price based on new supply
        updatePrice();
    }

    function updatePrice() internal {
        // Simple price function: price increases linearly with supply
        // Price = initialPrice * (1 + currentSupply/maxSupply)
        uint256 currentSupply = totalSupply();
        currentPrice = (currentPrice * (maxSupply + currentSupply)) / maxSupply;
    }

    // Team can withdraw only their pool
    function withdrawTeamCHZ(uint256 amount) external {
        require(msg.sender == teamWallet, "Not team wallet");
        require(amount <= teamPoolCHZ, "Amount exceeds team pool");
        teamPoolCHZ -= amount;
        IERC20(chilizToken).transfer(teamWallet, amount);
        emit TeamCHZWithdrawn(teamWallet, amount);
    }

    // Admin/owner can withdraw any extra CHZ (e.g. accidental transfers, dust)
    function withdrawCHZ(uint256 amount) external onlyOwner {
        uint256 contractBalance = IERC20(chilizToken).balanceOf(address(this));
        require(amount <= contractBalance - teamPoolCHZ, "Amount exceeds admin pool");
        IERC20(chilizToken).transfer(owner(), amount);
        emit AdminCHZWithdrawn(owner(), amount);
    }
}
