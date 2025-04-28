import { ethers } from 'ethers';
import { CONTRACT_CONFIG, TOKEN_CONFIG, AUCTION_CONFIG } from '../contracts/config';

/**
 * Format token amount with decimals
 * @param amount Amount to format
 * @param decimals Number of decimals
 * @returns Formatted string
 */
export const formatTokenAmount = (amount: bigint, decimals: number = CONTRACT_CONFIG.decimals): string => {
  return ethers.formatUnits(amount, decimals);
};

/**
 * Parse token amount from string
 * @param amount Amount as string
 * @param decimals Number of decimals
 * @returns Parsed BigNumber
 */
export const parseTokenAmount = (amount: string, decimals: number = CONTRACT_CONFIG.decimals): bigint => {
  return ethers.parseUnits(amount, decimals);
};

/**
 * Calculate platform fee
 * @param amount Amount to calculate fee for
 * @returns Platform fee amount
 */
export const calculatePlatformFee = (amount: bigint): bigint => {
  const feeRate = CONTRACT_CONFIG.platformFeeRate;
  return (amount * BigInt(feeRate)) / BigInt(10000);
};

/**
 * Calculate seller earnings
 * @param amount Total amount
 * @returns Seller earnings
 */
export const calculateSellerEarnings = (amount: bigint): bigint => {
  const fee = calculatePlatformFee(amount);
  return amount - fee;
};

/**
 * Validate token creation parameters
 * @param params Token creation parameters
 * @returns Validation result
 */
export const validateTokenCreation = (params: {
  initialSupply: number;
  maxSupply: number;
  initialPrice: number;
  benefits: string[];
}): boolean => {
  const { initialSupply, maxSupply, initialPrice, benefits } = params;

  if (initialSupply <= 0 || initialSupply > TOKEN_CONFIG.defaultMaxSupply) {
    return false;
  }

  if (maxSupply <= initialSupply || maxSupply > TOKEN_CONFIG.defaultMaxSupply) {
    return false;
  }

  if (initialPrice < 0) {
    return false;
  }

  if (benefits.length > TOKEN_CONFIG.maxBenefits) {
    return false;
  }

  return true;
};

/**
 * Validate auction parameters
 * @param params Auction parameters
 * @returns Validation result
 */
export const validateAuction = (params: {
  tokenAmount: number;
  startingPrice: number;
  duration: number;
}): boolean => {
  const { tokenAmount, startingPrice, duration } = params;

  if (tokenAmount <= 0) {
    return false;
  }

  if (startingPrice < AUCTION_CONFIG.minStartingPrice) {
    return false;
  }

  if (duration < AUCTION_CONFIG.minDuration || duration > AUCTION_CONFIG.maxDuration) {
    return false;
  }

  return true;
};

/**
 * Format duration in seconds to human-readable string
 * @param seconds Duration in seconds
 * @returns Formatted string
 */
export const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ');
};

/**
 * Calculate time remaining until end
 * @param endTime End time in seconds
 * @returns Time remaining in seconds
 */
export const calculateTimeRemaining = (endTime: number): number => {
  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, endTime - currentTime);
};

/**
 * Format CHZ price
 * @param amount Amount in CHZ
 * @returns Formatted string
 */
export const formatChzPrice = (amount: bigint): string => {
  return formatTokenAmount(amount, CONTRACT_CONFIG.decimals) + ' CHZ';
};
