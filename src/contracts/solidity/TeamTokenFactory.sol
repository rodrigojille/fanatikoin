// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./TeamToken.sol";

contract TeamTokenFactory is Ownable, ReentrancyGuard, Pausable {
    mapping(address => address) public tokenCreators;
    mapping(address => address[]) public creatorTokens;
    address public chilizToken;

    event TokenCreated(
        address indexed creator,
        address indexed tokenAddress,
        string name,
        string symbol
    );

    constructor(address _chilizToken) {
        chilizToken = _chilizToken;
    }

    function createToken(
        string memory name,
        string memory symbol,
        string memory description,
        string[] memory benefits,
        uint256 maxSupply,
        uint256 initialPrice,
        address teamWallet
    ) external whenNotPaused nonReentrant returns (address) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(symbol).length > 0, "Symbol required");
        require(maxSupply > 0, "Max supply must be > 0");
        require(initialPrice > 0, "Initial price must be > 0");
        
        TeamToken newToken = new TeamToken(
            name,
            symbol,
            description,
            benefits,
            maxSupply,
            initialPrice,
            chilizToken,
            teamWallet
        );
        
        tokenCreators[address(newToken)] = msg.sender;
        creatorTokens[msg.sender].push(address(newToken));
        
        emit TokenCreated(
            msg.sender,
            address(newToken),
            name,
            symbol
        );
        
        return address(newToken);
    }
    
    function getCreatorTokens(address creator) public view returns (address[] memory) {
        return creatorTokens[creator];
    }
    
    function getTokenCreator(address tokenAddress) public view returns (address) {
        return tokenCreators[tokenAddress];
    }
}
