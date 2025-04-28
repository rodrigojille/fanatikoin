import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TokenMarketplace } from '../contracts/interfaces/TokenMarketplace';
import { TeamToken } from '../contracts/interfaces/TeamToken';
import { CONTRACT_ADDRESSES, CONTRACT_CONFIG } from '../contracts/config';
import { formatChzPrice, formatTokenAmount } from '../utils/tokenUtils';

interface MarketplaceListing {
  address: string;
  name: string;
  symbol: string;
  price: number;
  description: string;
  isListed: boolean;
  isVerified: boolean;
}

interface TokenMarketplaceHook {
  buyTokens: (tokenAddress: string, amount: number) => Promise<void>;
  sellTokens: (tokenAddress: string, amount: number) => Promise<void>;
  getMarketplaceListings: () => Promise<MarketplaceListing[]>;
  tokens: MarketplaceListing[];
  loading: boolean;
  error: string | null;
}

export const useTokenMarketplace = (): TokenMarketplaceHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<MarketplaceListing[]>([]);

  const buyTokens = async (tokenAddress: string, amount: number) => {
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

      // Get token price
      const price = await marketplace.getTokenPrice(tokenAddress);
      const priceAsBigInt = BigInt(price.toString());
      const totalCost = priceAsBigInt * BigInt(amount);

      // Approve CHZ tokens for transfer
      const chilizToken = new ethers.Contract(
        CONTRACT_ADDRESSES.ChilizToken,
        ['function approve(address spender, uint256 amount) external returns (bool)'],
        signer
      );

      await chilizToken.approve(
        CONTRACT_ADDRESSES.TokenMarketplace,
        totalCost
      );

      // Buy tokens
      await marketplace.buyTokens(
        tokenAddress,
        BigInt(amount)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error buying tokens:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sellTokens = async (tokenAddress: string, amount: number) => {
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

      // Get token price
      const price = await marketplace.getTokenPrice(tokenAddress);

      // Sell tokens
      await marketplace.sellTokens(
        tokenAddress,
        BigInt(amount)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error buying tokens:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all marketplace listings
  const getMarketplaceListings = async (): Promise<MarketplaceListing[]> => {
    setLoading(true);
    setError(null);
    try {
      if (!window.ethereum) throw new Error('No Web3 provider found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketplace = new TokenMarketplace(
        CONTRACT_ADDRESSES.TokenMarketplace,
        signer
      );
      // 1. Get all listed token addresses
      let tokenAddresses: string[] = [];
      try {
        tokenAddresses = await marketplace.getAllTokens();
      } catch (err: any) {
        // If BAD_DATA or empty result, fallback to mock
        if (err.code === 'BAD_DATA' || err.message?.includes('could not decode result data')) {
          // Return mock tokens for dev/demo
          const mockTokens = [
            {
              address: '0xmock1',
              name: 'FC Barcelona',
              symbol: 'BAR',
              price: 25,
              description: 'Token limitado con beneficios exclusivos para fans del FC Barcelona',
              isListed: true,
              isVerified: true,
            },
            {
              address: '0xmock2',
              name: 'Manchester United',
              symbol: 'MUN',
              price: 22,
              description: 'Token fundador con beneficios vitalicios para fans del Manchester United',
              isListed: true,
              isVerified: true,
            },
            {
              address: '0xmock3',
              name: 'Paris Saint-Germain',
              symbol: 'PSG',
              price: 30,
              description: 'Token Elite para superfans del PSG con privilegios especiales',
              isListed: true,
              isVerified: true,
            },
          ];
          setTokens(mockTokens);
          return mockTokens;
        }
        throw err;
      }
      // Fallback: if contract returns empty, use mock tokens
      if (!tokenAddresses || tokenAddresses.length === 0) {
        const mockTokens = [
          {
            address: '0xmock1',
            name: 'FC Barcelona',
            symbol: 'BAR',
            price: 25,
            description: 'Token limitado con beneficios exclusivos para fans del FC Barcelona',
            isListed: true,
            isVerified: true,
          },
          {
            address: '0xmock2',
            name: 'Manchester United',
            symbol: 'MUN',
            price: 22,
            description: 'Token fundador con beneficios vitalicios para fans del Manchester United',
            isListed: true,
            isVerified: true,
          },
          {
            address: '0xmock3',
            name: 'Paris Saint-Germain',
            symbol: 'PSG',
            price: 30,
            description: 'Token Elite para superfans del PSG con privilegios especiales',
            isListed: true,
            isVerified: true,
          },
        ];
        setTokens(mockTokens);
        return mockTokens;
      }
      // 2. Fetch info for each token
      const listings = await Promise.all(
        tokenAddresses.map(async (address) => {
          const info = await marketplace.getTokenInfo(address);
          return {
            address,
            name: info.tokenName,
            symbol: info.tokenSymbol,
            price: Number(info.price),
            description: info.tokenDescription,
            isListed: info.isListed,
            isVerified: info.isVerified,
          };
        })
      );
      const filteredListings = listings.filter((l) => l.isListed);
      setTokens(filteredListings);
      return filteredListings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching marketplace listings:', errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    buyTokens,
    sellTokens,
    getMarketplaceListings,
    tokens,
    loading,
    error,
  };
};
