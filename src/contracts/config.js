"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUCTION_CONFIG = exports.TOKEN_CONFIG = exports.NETWORK_CONFIG = exports.CONTRACT_CONFIG = exports.CONTRACT_ADDRESSES = void 0;
exports.CONTRACT_ADDRESSES = {
    TeamTokenFactory: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    TokenMarketplace: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    TokenAuction: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    ChilizToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
};
;
;
;
exports.CONTRACT_CONFIG = {
    // Contract configuration values
    platformFeeRate: 250, // 2.5% fee rate (in basis points)
    defaultDuration: 86400, // 24 hours in seconds
    maxSupplyMultiplier: 1000000, // 1 million
    decimals: 18,
};
exports.NETWORK_CONFIG = {
    chainId: 88882, // Spicy testnet
    name: 'spicy',
    blockExplorer: 'https://spicy.chiliscan.com/',
rpcUrl: 'https://spicy-rpc.chiliz.com/',
};
exports.TOKEN_CONFIG = {
    // Default token configuration
    defaultInitialSupply: 10000, // 10,000 tokens
    defaultMaxSupply: 1000000, // 1 million tokens
    defaultInitialPrice: 100, // 100 CHZ
    maxBenefits: 10, // Maximum number of benefits
};
exports.AUCTION_CONFIG = {
    // Auction configuration
    minDuration: 3600, // 1 hour
    maxDuration: 604800, // 7 days
    minStartingPrice: 1, // 1 CHZ
};
