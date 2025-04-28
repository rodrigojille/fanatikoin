import React, { useState, useEffect } from 'react';
import { ethers, BrowserProvider } from 'ethers';
import { TeamToken } from '../contracts/interfaces/TeamToken';
import { CONTRACT_ADDRESSES, CONTRACT_CONFIG } from '../contracts/config';
import { hasWeb3Provider, handleWeb3Error } from '../utils/web3ErrorHandler';

interface TokenBenefitsHook {
  addBenefit: (tokenAddress: string, benefit: string) => Promise<void>;
  removeBenefit: (tokenAddress: string, index: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useTokenBenefits = (): TokenBenefitsHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBenefit = async (tokenAddress: string, benefit: string) => {
    try {
      setLoading(true);
      setError(null);

      // Check if Web3 provider exists
      if (!hasWeb3Provider()) {
        throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser');
      }

      // Use non-null assertion with proper type checking
      const provider = new BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      // Initialize token contract
      const token = new TeamToken(tokenAddress, signer);

      // Add benefit
      await token.addBenefit(benefit);
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Failed to add benefit');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeBenefit = async (tokenAddress: string, index: number) => {
    try {
      setLoading(true);
      setError(null);

      // Check if Web3 provider exists
      if (!hasWeb3Provider()) {
        throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser');
      }

      // Use non-null assertion with proper type checking
      const provider = new BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      // Initialize token contract
      const token = new TeamToken(tokenAddress, signer);

      // Remove benefit
      await token.removeBenefit(index);
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Failed to remove benefit');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    addBenefit,
    removeBenefit,
    loading,
    error,
  };
};
