import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TokenMarketplace } from '../contracts/interfaces/TokenMarketplace';
import { CONTRACT_ADDRESSES, CONTRACT_CONFIG } from '../contracts/config';
import { formatChzPrice, formatTokenAmount } from '../utils/tokenUtils';

interface TokenListingHook {
  listToken: (tokenAddress: string, price: number) => Promise<void>;
  updateTokenPrice: (tokenAddress: string, newPrice: number) => Promise<void>;
  delistToken: (tokenAddress: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useTokenListing = (): TokenListingHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listToken = async (tokenAddress: string, price: number) => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) throw new Error('No Web3 provider found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Initialize marketplace contract
      const marketplace = new TokenMarketplace(
        CONTRACT_ADDRESSES.TokenMarketplace,
        signer
      );

      // List token
      const priceInWei = ethers.parseUnits(price.toString(), 18);
      await marketplace.listToken(tokenAddress, priceInWei);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error listing token:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTokenPrice = async (tokenAddress: string, newPriceInChz: number) => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) throw new Error('No Web3 provider found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Initialize marketplace contract
      const marketplace = new TokenMarketplace(
        CONTRACT_ADDRESSES.TokenMarketplace,
        signer
      );

      // Update price
      const newPriceInWei = ethers.parseUnits(newPriceInChz.toString(), 18);
      await marketplace.updateTokenPrice(tokenAddress, newPriceInWei);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error updating token price:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const delistToken = async (tokenAddress: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) throw new Error('No Web3 provider found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Initialize marketplace contract
      const marketplace = new TokenMarketplace(
        CONTRACT_ADDRESSES.TokenMarketplace,
        signer
      );

      // Delist token
      await marketplace.delistToken(tokenAddress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error delisting token:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    listToken,
    updateTokenPrice,
    delistToken,
    loading,
    error,
  };
};
