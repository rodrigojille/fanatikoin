/**
 * Token Price Utility
 * Based on Chiliz documentation: https://docs.chiliz.com/develop/advanced/how-to-get-the-usd-price-of-fan-tokens
 * 
 * This utility provides functions to get the USD price of Fan Tokens
 * using various price oracles and APIs.
 */

import axios from 'axios';
import { ethers } from 'ethers';

// Interface for price data
interface TokenPriceData {
  symbol: string;
  address: string;
  priceUsd: number;
  timestamp: number;
  source: string;
}

// Price sources
const PRICE_SOURCES = {
  CHILIZ_PRICE_API: 'Chiliz Price API',
  COINGECKO: 'CoinGecko',
  CHAINLINK: 'Chainlink Oracle',
  FALLBACK: 'Fallback Estimation'
};

/**
 * Get token price from Chiliz Price API
 * @param tokenAddress The token contract address
 * @returns Price data or null if not available
 */
export async function getTokenPriceFromChiliz(tokenAddress: string): Promise<TokenPriceData | null> {
  try {
    // Chiliz Price API endpoint (replace with actual endpoint when available)
    const response = await axios.get(`https://api.chiliz.com/v1/tokens/${tokenAddress}/price`);
    
    if (response.data && response.data.priceUsd) {
      return {
        symbol: response.data.symbol || 'UNKNOWN',
        address: tokenAddress,
        priceUsd: parseFloat(response.data.priceUsd),
        timestamp: Date.now(),
        source: PRICE_SOURCES.CHILIZ_PRICE_API
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Price API] Error fetching price from Chiliz API:', error);
    return null;
  }
}

/**
 * Get token price from CoinGecko
 * @param tokenAddress The token contract address
 * @param chainId The chain ID (default: 88882 for Chiliz Spicy Testnet)
 * @returns Price data or null if not available
 */
export async function getTokenPriceFromCoinGecko(
  tokenAddress: string, 
  chainId: number = 88882
): Promise<TokenPriceData | null> {
  try {
    // Map chain ID to CoinGecko platform ID
    const platformId = chainId === 88888 ? 'chiliz' : 'chiliz-testnet';
    
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/token_price/${platformId}`, {
        params: {
          contract_addresses: tokenAddress,
          vs_currencies: 'usd',
          include_24hr_change: true
        }
      }
    );
    
    // CoinGecko response format: { "0x123...": { "usd": 1.23, "usd_24h_change": 5.67 } }
    if (response.data && response.data[tokenAddress.toLowerCase()] && 
        response.data[tokenAddress.toLowerCase()].usd) {
      
      return {
        symbol: 'UNKNOWN', // CoinGecko doesn't return symbol in this endpoint
        address: tokenAddress,
        priceUsd: response.data[tokenAddress.toLowerCase()].usd,
        timestamp: Date.now(),
        source: PRICE_SOURCES.COINGECKO
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Price API] Error fetching price from CoinGecko:', error);
    return null;
  }
}

/**
 * Get token price from Chainlink Oracle (if available)
 * @param tokenAddress The token contract address
 * @param provider Ethers provider
 * @returns Price data or null if not available
 */
export async function getTokenPriceFromChainlink(
  tokenAddress: string,
  provider: any
): Promise<TokenPriceData | null> {
  try {
    // This is a simplified implementation
    // In a real implementation, you would:
    // 1. Look up the Chainlink price feed address for this token
    // 2. Create a contract instance for the price feed
    // 3. Call the latestRoundData() function to get the price
    
    // Example ABI for Chainlink Price Feed
    const priceFeedAbi = [
      "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
    ];
    
    // This is a placeholder - in a real implementation you would have a mapping of token addresses to price feed addresses
    const priceFeedAddress = getPriceFeedAddressForToken(tokenAddress);
    
    if (!priceFeedAddress) {
      return null;
    }
    
    // Create contract instance
    const priceFeedContract = new ethers.Contract(priceFeedAddress, priceFeedAbi, provider);
    
    // Get latest price data
    const [roundId, answer, startedAt, updatedAt, answeredInRound] = await priceFeedContract.latestRoundData();
    
    // Chainlink prices are typically with 8 decimals
    const priceUsd = parseFloat(ethers.formatUnits(answer, 8));
    
    return {
      symbol: 'UNKNOWN', // We don't get symbol from Chainlink
      address: tokenAddress,
      priceUsd,
      timestamp: updatedAt.toNumber() * 1000, // Convert to milliseconds
      source: PRICE_SOURCES.CHAINLINK
    };
  } catch (error) {
    console.error('[Price API] Error fetching price from Chainlink:', error);
    return null;
  }
}

/**
 * Placeholder function to get price feed address for a token
 * In a real implementation, this would be a mapping or API call
 */
function getPriceFeedAddressForToken(tokenAddress: string): string | null {
  // This is a placeholder - in a real implementation you would have a mapping or API call
  return null;
}

/**
 * Get token price from multiple sources with fallbacks
 * @param tokenAddress The token contract address
 * @param provider Ethers provider (optional, required for Chainlink)
 * @returns Price data or null if not available from any source
 */
export async function getTokenPrice(
  tokenAddress: string,
  provider?: any
): Promise<TokenPriceData | null> {
  // Try Chiliz Price API first
  const chilizPrice = await getTokenPriceFromChiliz(tokenAddress);
  if (chilizPrice) return chilizPrice;
  
  // Try CoinGecko as fallback
  const coingeckoPrice = await getTokenPriceFromCoinGecko(tokenAddress);
  if (coingeckoPrice) return coingeckoPrice;
  
  // Try Chainlink if provider is available
  if (provider) {
    const chainlinkPrice = await getTokenPriceFromChainlink(tokenAddress, provider);
    if (chainlinkPrice) return chainlinkPrice;
  }
  
  // If all else fails, return null
  return null;
}

/**
 * Format token price for display
 * @param priceUsd Price in USD
 * @param options Formatting options
 * @returns Formatted price string
 */
export function formatTokenPrice(
  priceUsd: number | null | undefined,
  options: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  if (priceUsd === null || priceUsd === undefined) {
    return 'N/A';
  }
  
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 6
  } = options;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(priceUsd);
}

/**
 * Calculate token value in USD
 * @param tokenAmount Amount of tokens
 * @param priceUsd Price per token in USD
 * @returns Value in USD
 */
export function calculateTokenValue(
  tokenAmount: number | string,
  priceUsd: number | null | undefined
): number | null {
  if (priceUsd === null || priceUsd === undefined) {
    return null;
  }
  
  const amount = typeof tokenAmount === 'string' ? parseFloat(tokenAmount) : tokenAmount;
  
  if (isNaN(amount)) {
    return null;
  }
  
  return amount * priceUsd;
}

/**
 * Format token value for display
 * @param tokenAmount Amount of tokens
 * @param priceUsd Price per token in USD
 * @param options Formatting options
 * @returns Formatted value string
 */
export function formatTokenValue(
  tokenAmount: number | string,
  priceUsd: number | null | undefined,
  options: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const value = calculateTokenValue(tokenAmount, priceUsd);
  
  if (value === null) {
    return 'N/A';
  }
  
  return formatTokenPrice(value, options);
}
