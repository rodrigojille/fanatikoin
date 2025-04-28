import React, { useState, useEffect } from 'react';
import { ethers, BrowserProvider, parseUnits } from 'ethers';
import { TeamTokenFactory } from '../contracts/interfaces/TeamTokenFactory';
import { CONTRACT_ADDRESSES, CONTRACT_CONFIG } from '../contracts/config';
import { validateTokenCreation } from '../utils/tokenUtils';
import { hasWeb3Provider, handleWeb3Error } from '../utils/web3ErrorHandler';

interface TokenCreationHook {
  createToken: (
    name: string,
    symbol: string,
    description: string,
    benefits: string[],
    initialSupply: number,
    maxSupply: number,
    initialPrice: number
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
  isValid: boolean;
}

export const useTokenCreation = (): TokenCreationHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const createToken = async (
    name: string,
    symbol: string,
    description: string,
    benefits: string[],
    initialSupply: number,
    maxSupply: number,
    initialPrice: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Validate input
      if (!validateTokenCreation({
        initialSupply,
        maxSupply,
        initialPrice,
        benefits,
      })) {
        throw new Error('Invalid token creation parameters');
      }

      // Check if Web3 provider exists
      if (!hasWeb3Provider()) {
        throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser');
      }

      // Use non-null assertion with proper type checking
      const provider = new BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      // Initialize factory contract
      const factory = new TeamTokenFactory(
        CONTRACT_ADDRESSES.TeamTokenFactory,
        signer
      );

      // Create token
      await factory.createToken(
        name,
        symbol,
        description,
        benefits,
        BigInt(initialSupply),
        BigInt(maxSupply),
        parseUnits(initialPrice.toString(), CONTRACT_CONFIG.decimals)
      );
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Failed to create token');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Validate token creation parameters
  useEffect(() => {
    setIsValid(validateTokenCreation({
      initialSupply: 10000,
      maxSupply: 1000000,
      initialPrice: 100,
      benefits: [],
    }));
  }, []);

  return {
    createToken,
    loading,
    error,
    isValid,
  };
};
