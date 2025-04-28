import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { Web3Provider as EthersWeb3Provider } from '@ethersproject/providers';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'next-i18next';

import { NETWORK_CONFIG } from '@/contracts/config';
import { hasWeb3Provider, validateChilizNetwork } from '@/utils/web3ErrorHandler';
import { 
  saveLastConnectedWallet, 
  getLastConnectedWallet, 
  saveLastNetwork, 
  getLastNetwork,
  saveUserPreferences
} from '@/utils/sessionStorage';
import useWeb3Loading from '@/hooks/useWeb3Loading';

interface Web3ContextType {
  userInfo?: { email?: string } | null;
  isSocialLogin?: boolean;

  provider: EthersWeb3Provider | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  address: string | null;
  isConnecting: boolean;
  chainId: number | null;
  isCorrectChain: boolean;
  isConnected: boolean;
  account: string | null;
  isChilizChain: boolean;
  isInitializing: boolean;
  loading: {
    isLoading: boolean;
    operation: string;
    message: string;
  };
  hasPreviousSession: boolean;
  reconnectLastWallet: () => Promise<void>;
  walletError: string | null;
  setWalletError: (err: string | null) => void;
}

const Web3Context = createContext<Web3ContextType>({
  userInfo: null,
  isSocialLogin: false,
  provider: null,
  connect: async () => {},
  disconnect: () => {},
  address: null,
  isConnecting: false,
  chainId: null,
  isCorrectChain: false,
  isConnected: false,
  account: null,
  isChilizChain: false,
  isInitializing: true,
  loading: {
    isLoading: false,
    operation: '',
    message: ''
  },
  hasPreviousSession: false,
  reconnectLastWallet: async () => {},
  walletError: null,
  setWalletError: () => {}
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

// Chain ID for Chiliz Spicy Testnet from our config
const SUPPORTED_CHAIN_ID = NETWORK_CONFIG.chainId; // 88882 for Spicy Testnet

export const Web3ContextProvider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [walletError, setWalletError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ email?: string } | null>(null);
  const [isSocialLogin, setIsSocialLogin] = useState(false);
  // Add fallback for translations to prevent i18next errors
  const { t = (key: string, defaultValue: string) => defaultValue } = useTranslation('common', {
    useSuspense: false
  });
  const [provider, setProvider] = useState<EthersWeb3Provider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [chainId, setChainId] = useState<number | null>(null);

  const [hasPreviousSession, setHasPreviousSession] = useState(false);
  
  // Use the Web3Loading hook for loading states
  const { loading, startLoading, stopLoading, withLoading } = useWeb3Loading();

  const isCorrectChain = chainId === SUPPORTED_CHAIN_ID;

  const switchNetwork = async () => {
    if (!provider) return;
    try {
      // When using Web3Auth, network switching is handled via their configuration
      toast.success(t('network.usingChiliz', 'Using Chiliz Spicy Testnet'));
    } catch (error: any) {
      toast.error(t('network.switchError', 'Failed to switch network'));
      console.error('Network switching error:', error);
    }
  };

  const connect = async () => {
    try {
      setWalletError(null);
      console.log('[Web3Auth] Starting connection');
      setIsConnecting(true);
      startLoading('connect', t('connect.connecting', 'Connecting to wallet...'));
      
      if (!(window as any).ethereum) {
        throw new Error('MetaMask is not installed');
      }
      const ethProvider = (window as any).ethereum;
      let accounts = await ethProvider.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        // Prompt user to connect if not already authorized
        accounts = await ethProvider.request({ method: 'eth_requestAccounts' });
      }
      if (!accounts || accounts.length === 0) {
        setWalletError('No wallet accounts found. Please unlock MetaMask and ensure you have at least one account.');
        throw new Error('No accounts found');
      }
      const ethersProvider = new EthersWeb3Provider(ethProvider);
      const network = await ethersProvider.getNetwork();
      setProvider(ethersProvider);
      setAddress(accounts[0]);
      setChainId(Number(network.chainId));
      
      const networkValidation = await validateChilizNetwork(ethersProvider);
      if (!networkValidation.isValid) {
        console.warn(`Network validation failed: ${networkValidation.error}`);
        toast.error(t('network.wrongNetwork', 'Please use Chiliz Spicy Testnet (Chain ID: 88882)'));
      }
      
      toast.success(t('connect.success', 'Connected to wallet'));
    } catch (error) {
      if (error instanceof Error && error.message === 'No accounts found') {
        setWalletError('No wallet accounts found. Please unlock MetaMask and ensure you have at least one account.');
      }
      console.error('Error connecting to wallet:', error);
      toast.error(t('connect.error', 'Failed to connect to wallet'));
    } finally {
      setIsConnecting(false);
      stopLoading();
    }
  };

  const disconnect = async () => {
    try {
      startLoading('disconnect', t('connect.disconnecting', 'Disconnecting wallet...'));
      setProvider(null);
      setAddress(null);
      setChainId(null);
      
      saveLastConnectedWallet(''); // Clear by saving empty string
      toast.success(t('connect.disconnected', 'Disconnected from wallet'));
    } catch (error) {
      console.error('Error disconnecting from wallet:', error);
      toast.error(t('connect.disconnectError', 'Failed to disconnect wallet'));
    } finally {
      stopLoading();
    }
  };
  
  /**
   * Attempt to reconnect to the last used wallet
   */
  const reconnectLastWallet = async () => {
    const lastWallet = getLastConnectedWallet();
    if (!lastWallet) {
      console.log('[MetaMask] No previous wallet connection found');
      return;
    }
    try {
      startLoading('reconnect', t('connect.reconnecting', 'Reconnecting to wallet...'));
      if (!(window as any).ethereum) {
        throw new Error('MetaMask is not installed');
      }
      const ethProvider = (window as any).ethereum;
      const accounts = await ethProvider.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === lastWallet.toLowerCase()) {
        const ethersProvider = new EthersWeb3Provider(ethProvider);
        const network = await ethersProvider.getNetwork();
        setProvider(ethersProvider);
        setAddress(accounts[0]);
        setChainId(Number(network.chainId));
        toast.success(t('connect.reconnectSuccess', 'Reconnected to wallet'));
      } else {
        await connect();
      }
    } catch (error) {
      console.error('[MetaMask] Failed to reconnect:', error);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Check for previous wallet connection and auto-reconnect
          const lastWallet = getLastConnectedWallet();
          if (lastWallet) {
            setHasPreviousSession(true);
            if (!address) {
              await reconnectLastWallet();
            }
          }
        }
      } catch (error) {
        console.error('[MetaMask] Initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const isChilizChain = chainId === SUPPORTED_CHAIN_ID;

  return (
    <Web3Context.Provider
      value={{
        provider,
        connect,
        disconnect,
        address,
        isConnecting,
        chainId,
        isCorrectChain,
        isConnected: !!address,
        account: address,
        isChilizChain,
        isInitializing,
        loading,
        hasPreviousSession,
        reconnectLastWallet,
        userInfo,
        isSocialLogin,
        walletError,
        setWalletError
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3ContextProvider;
