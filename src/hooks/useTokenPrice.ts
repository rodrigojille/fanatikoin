import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { getTokenPrice, formatTokenPrice, calculateTokenValue, formatTokenValue } from '@/utils/tokenPriceUtil';

interface TokenPriceData {
  symbol: string;
  address: string;
  priceUsd: number;
  timestamp: number;
  source: string;
}

interface UseTokenPriceReturn {
  price: TokenPriceData | null;
  loading: boolean;
  error: string | null;
  refreshPrice: () => Promise<void>;
  formatPrice: (options?: FormatOptions) => string;
  calculateValue: (amount: number | string) => number | null;
  formatValue: (amount: number | string, options?: FormatOptions) => string;
}

interface FormatOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Hook for getting and formatting token prices
 * @param tokenAddress The token contract address
 * @param refreshInterval Refresh interval in milliseconds (default: 60000 - 1 minute)
 * @returns Token price data and utility functions
 */
export function useTokenPrice(
  tokenAddress: string, 
  refreshInterval = 60000
): UseTokenPriceReturn {
  const { provider } = useWeb3();
  const [price, setPrice] = useState<TokenPriceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch token price
  const fetchPrice = useCallback(async () => {
    if (!tokenAddress) {
      setError('Token address is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const priceData = await getTokenPrice(tokenAddress, provider);
      
      if (priceData) {
        setPrice(priceData);
      } else {
        setError('Price not available');
      }
    } catch (err) {
      console.error('[TokenPrice] Error fetching price:', err);
      setError('Failed to fetch token price');
    } finally {
      setLoading(false);
    }
  }, [tokenAddress, provider]);

  // Refresh price data
  const refreshPrice = useCallback(async () => {
    await fetchPrice();
  }, [fetchPrice]);

  // Format price for display
  const formatPrice = useCallback((options: FormatOptions = {}) => {
    return formatTokenPrice(price?.priceUsd, options);
  }, [price]);

  // Calculate token value in USD
  const calculateValue = useCallback((amount: number | string) => {
    return calculateTokenValue(amount, price?.priceUsd);
  }, [price]);

  // Format token value for display
  const formatValue = useCallback((amount: number | string, options: FormatOptions = {}) => {
    return formatTokenValue(amount, price?.priceUsd, options);
  }, [price]);

  // Initial fetch and refresh interval
  useEffect(() => {
    fetchPrice();

    // Set up refresh interval
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchPrice, refreshInterval);
      
      return () => clearInterval(intervalId);
    }
  }, [fetchPrice, refreshInterval]);

  return {
    price,
    loading,
    error,
    refreshPrice,
    formatPrice,
    calculateValue,
    formatValue
  };
}

export default useTokenPrice;
