import React, { useState, useEffect } from 'react';
import { ethers, JsonRpcProvider } from 'ethers';
import { TeamToken } from '../contracts/interfaces/TeamToken';
import { CONTRACT_ADDRESSES, CONTRACT_CONFIG } from '../contracts/config';
import { formatTokenAmount } from '../utils/tokenUtils';
import { handleWeb3Error, safeWeb3Call } from '../utils/web3ErrorHandler';
import { metamaskService } from '../services/metamask';

interface TokenBalanceHook {
  getTokenBalance: (tokenAddress: string, address: string) => Promise<string>;
  getAllowance: (tokenAddress: string, owner: string, spender: string) => Promise<string>;
  loading: boolean;
  error: string | null;
}

export const useTokenBalance = (): TokenBalanceHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTokenBalance = async (tokenAddress: string, address: string): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      // Check if window.ethereum exists
      if (!metamaskService.isMetaMaskAvailable()) {
        throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
      }
      
      // Use the non-null assertion operator since we've checked for existence
      const provider = metamaskService.getProvider();
if (!provider) {
  throw new Error('No provider available. Please connect your wallet.');
}

      // Initialize token contract
      const token = new TeamToken(tokenAddress, provider);

      // Get balance
      const balance = await token.balanceOf(address);
      return formatTokenAmount(BigInt(balance.toString()));
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Failed to get token balance');
      setError(errorMessage);
      console.error('Get token balance error:', err);
      return '0';
    } finally {
      setLoading(false);
    }
  };

  const getAllowance = async (tokenAddress: string, owner: string, spender: string): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      // Check if window.ethereum exists
      if (!metamaskService.isMetaMaskAvailable()) {
        throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
      }
      
      // Use the non-null assertion operator since we've checked for existence
      const provider = metamaskService.getProvider();
if (!provider) {
  throw new Error('No provider available. Please connect your wallet.');
}

      // Initialize token contract
      const token = new TeamToken(tokenAddress, provider);

      // Get allowance
      const allowance = await token.allowance(owner, spender);
      return formatTokenAmount(BigInt(allowance.toString()));
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Failed to get token allowance');
      setError(errorMessage);
      console.error('Get token allowance error:', err);
      return '0';
    } finally {
      setLoading(false);
    }
  };

  return {
    getTokenBalance,
    getAllowance,
    loading,
    error,
  };
};
