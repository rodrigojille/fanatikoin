export const CONTRACT_ADDRESSES = {
    TeamTokenFactory: "", // To be filled after deployment // TeamTokenFactory
    ChilizToken: "0x0000000000000000000000000000000000001010", // Native CHZ
    TokenMarketplace: "0xdd185Ec5932293bD6F7d4219421C7bcc20A07efB", // Deployed
    TokenAuction: "", // To be filled after deployment
    TokenStaking: "" // To be filled after deployment
};

export const CONTRACT_CONFIG = {
  // Contract configuration values
  platformFeeRate: 250, // 2.5% fee rate (in basis points)
  defaultDuration: 86400, // 24 hours in seconds
  maxSupplyMultiplier: 1000000, // 1 million
  decimals: 18
};

export const NETWORK_CONFIG = {
  chainId: 88882, // Spicy testnet (updated from 1001)
  name: 'spicy',
  blockExplorer: 'https://spicy.chiliscan.com/',
  rpcUrl: 'https://spicy-rpc.chiliz.com/',
};

export const TOKEN_CONFIG = {
  // Default token configuration
  defaultInitialSupply: 10000, // 10,000 tokens
  defaultMaxSupply: 1000000, // 1 million tokens
  defaultInitialPrice: 100, // 100 CHZ
  maxBenefits: 10, // Maximum number of benefits
};

export const STAKING_CONFIG = {
  // Staking configuration
  defaultLockPeriod: 2592000, // 30 days in seconds
  minStakeAmount: 10, // Minimum 10 tokens to stake
  maxStakeAmount: 100000, // Maximum 100,000 tokens can be staked
  rewardBaseRate: 500, // 5% APY (in basis points)
  rewardBoost: {
    tier1: { amount: 1000, boost: 100 }, // 1000 tokens staked = 1% boost
    tier2: { amount: 5000, boost: 300 }, // 5000 tokens staked = 3% boost
    tier3: { amount: 10000, boost: 500 } // 10000 tokens staked = 5% boost
  }
};

export const AUCTION_CONFIG = {
  // Auction configuration
  minDuration: 3600, // 1 hour
  maxDuration: 604800, // 7 days
  minStartingPrice: 1, // 1 CHZ
};
