import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TeamToken } from '../contracts/interfaces/TeamToken';
import { CONTRACT_ADDRESSES, CONTRACT_CONFIG } from '../contracts/config';
import { handleWeb3Error, safeWeb3Call, hasWeb3Provider } from '../utils/web3ErrorHandler';

interface TokenTransferHook {
  transferTokens: (tokenAddress: string, to: string, amount: number) => Promise<void>;
  approveTokens: (tokenAddress: string, spender: string, amount: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useTokenTransfer = (): TokenTransferHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transferTokens = async (tokenAddress: string, to: string, amount: number) => {
    try {
      setLoading(true);
      setError(null);

      // Check if window.ethereum exists
      if (!hasWeb3Provider()) {
        throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
      }
      
      // Use the non-null assertion operator since we've checked for existence
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      // Initialize token contract
      const token = new TeamToken(tokenAddress, signer);

      // Transfer tokens
      const tokenAmount = ethers.parseUnits(amount.toString(), 18);
      await token.transfer(to, tokenAmount);
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Failed to transfer tokens');
      setError(errorMessage);
      console.error('Error transferring tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveTokens = async (tokenAddress: string, spender: string, amount: number) => {
    try {
      setLoading(true);
      setError(null);

      // Check if window.ethereum exists
      if (!hasWeb3Provider()) {
        throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
      }
      
      // Use the non-null assertion operator since we've checked for existence
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      // Initialize token contract
      const token = new TeamToken(tokenAddress, signer);

      // Approve tokens
      const tokenAmount = ethers.parseUnits(amount.toString(), 18);
      await token.approve(spender, tokenAmount);
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Failed to approve tokens');
      setError(errorMessage);
      console.error('Error approving tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    transferTokens,
    approveTokens,
    loading,
    error,
  };
};
