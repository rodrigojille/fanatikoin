import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TeamToken } from '../contracts/interfaces/TeamToken';
import { CONTRACT_ADDRESSES, CONTRACT_CONFIG } from '../contracts/config';

interface TokenVerificationHook {
  setTokenVerification: (tokenAddress: string, verified: boolean) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useTokenVerification = (): TokenVerificationHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setTokenVerification = async (tokenAddress: string, verified: boolean) => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) throw new Error('No Web3 provider found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Initialize token contract
      const token = new TeamToken(tokenAddress, signer);

      // Set verification status
      await token.setVerified(verified);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error verifying token:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    setTokenVerification,
    loading,
    error,
  };
};
