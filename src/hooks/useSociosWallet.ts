import { useState, useEffect, useCallback } from 'react';
import { 
  isSociosWalletAvailable, 
  connectSociosWallet, 
  isConnectedToChilizChain,
  switchToChilizChain,
  getFanTokenBalance,
  addFanTokenToWallet
} from '@/utils/sociosWallet';
import { handleWeb3Error } from '@/utils/web3ErrorHandler';

interface UseSociosWalletReturn {
  isAvailable: boolean;
  isConnected: boolean;
  isChilizChain: boolean;
  address: string | null;
  connect: () => Promise<string | null>;
  switchToChiliz: (useTestnet?: boolean) => Promise<boolean>;
  getTokenBalance: (tokenAddress: string) => Promise<string>;
  addTokenToWallet: (tokenAddress: string, tokenSymbol: string, tokenDecimals?: number, tokenImage?: string) => Promise<boolean>;
  error: string | null;
}

/**
 * Hook for integrating with Socios Wallet
 * Based on Chiliz documentation: https://docs.chiliz.com/develop/advanced/how-to-integrate-socios-wallet-in-your-dapp
 */
export function useSociosWallet(): UseSociosWalletReturn {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isChilizChain, setIsChilizChain] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if Socios Wallet is available
  useEffect(() => {
    const checkAvailability = () => {
      try {
        const available = isSociosWalletAvailable();
        setIsAvailable(available);
        
        if (!available) {
          console.log('[Socios] Wallet not available');
        } else {
          console.log('[Socios] Wallet detected');
        }
      } catch (err) {
        console.error('[Socios] Error checking availability:', err);
        setIsAvailable(false);
      }
    };

    checkAvailability();
    
    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      console.log('[Socios] Accounts changed:', accounts);
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
      } else {
        setAddress(null);
        setIsConnected(false);
      }
    };

    // Listen for chain changes
    const handleChainChanged = async () => {
      console.log('[Socios] Chain changed');
      const onChiliz = await isConnectedToChilizChain();
      setIsChilizChain(onChiliz);
    };

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check initial connection state
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            
            // Check if on Chiliz Chain
            isConnectedToChilizChain().then(setIsChilizChain);
          }
        })
        .catch(console.error);
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Connect to Socios Wallet
  const connect = useCallback(async (): Promise<string | null> => {
    try {
      setError(null);
      
      if (!isAvailable) {
        throw new Error('Socios Wallet is not available. Please install the Socios app.');
      }
      
      const accounts = await connectSociosWallet();
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        
        // Check if on Chiliz Chain
        const onChiliz = await isConnectedToChilizChain();
        setIsChilizChain(onChiliz);
        
        if (!onChiliz) {
          console.warn('[Socios] Not connected to Chiliz Chain');
        }
        
        return accounts[0];
      }
      
      return null;
    } catch (err) {
      const errorMessage = handleWeb3Error(err, 'Failed to connect to Socios Wallet');
      setError(errorMessage);
      console.error('[Socios] Connection error:', errorMessage);
      return null;
    }
  }, [isAvailable]);

  // Switch to Chiliz Chain
  const switchToChiliz = useCallback(async (useTestnet = true): Promise<boolean> => {
    try {
      setError(null);
      
      if (!isConnected) {
        await connect();
      }
      
      const success = await switchToChilizChain(useTestnet);
      
      if (success) {
        setIsChilizChain(true);
      }
      
      return success;
    } catch (err) {
      const errorMessage = handleWeb3Error(err, 'Failed to switch to Chiliz Chain');
      setError(errorMessage);
      console.error('[Socios] Switch chain error:', errorMessage);
      return false;
    }
  }, [isConnected, connect]);

  // Get token balance
  const getTokenBalance = useCallback(async (tokenAddress: string): Promise<string> => {
    try {
      setError(null);
      
      if (!isConnected || !address) {
        throw new Error('Not connected to Socios Wallet');
      }
      
      if (!isChilizChain) {
        await switchToChiliz();
      }
      
      return await getFanTokenBalance(tokenAddress, address);
    } catch (err) {
      const errorMessage = handleWeb3Error(err, 'Failed to get token balance');
      setError(errorMessage);
      console.error('[Socios] Get balance error:', errorMessage);
      return '0';
    }
  }, [isConnected, isChilizChain, address, switchToChiliz]);

  // Add token to wallet
  const addTokenToWallet = useCallback(async (
    tokenAddress: string, 
    tokenSymbol: string, 
    tokenDecimals = 18, 
    tokenImage?: string
  ): Promise<boolean> => {
    try {
      setError(null);
      
      if (!isConnected) {
        await connect();
      }
      
      return await addFanTokenToWallet(tokenAddress, tokenSymbol, tokenDecimals, tokenImage);
    } catch (err) {
      const errorMessage = handleWeb3Error(err, 'Failed to add token to wallet');
      setError(errorMessage);
      console.error('[Socios] Add token error:', errorMessage);
      return false;
    }
  }, [isConnected, connect]);

  return {
    isAvailable,
    isConnected,
    isChilizChain,
    address,
    connect,
    switchToChiliz,
    getTokenBalance,
    addTokenToWallet,
    error
  };
}

export default useSociosWallet;
