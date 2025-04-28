import React, { createContext, useContext, useState, useEffect } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { formatEther } from '@ethersproject/units';
import { authService } from '@/services/authService';
import { AuthContextType, LoginCredentials, RegisterCredentials, UserProfile } from '@/types/auth';

// Define the ethereum provider interface locally to ensure TypeScript compatibility
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  isMetaMask?: boolean;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
}

// Type definition for window.ethereum is now in src/types/ethereum.d.ts

const UserContext = createContext<AuthContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  // Define AuthState type with all required properties
  type AuthState = Omit<AuthContextType, 'login' | 'loginWithWallet' | 'register' | 'logout' | 'updateProfile'>;

  const [state, setState] = useState<AuthState>(() => {
    const { user, token, authType } = authService.getCurrentUser();
    return {
      isAuthenticated: !!user,
      user,
      token,
      authType,
      loading: false,
      isLoading: false, // Add isLoading property to match AuthContextType
      error: null
    };
  });
  const [balance, setBalance] = useState<string>('0');

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));
    try {
      const { user, token } = await authService.login(credentials);
      setState(prev => ({
        isAuthenticated: true,
        user,
        token,
        authType: 'traditional',
        loading: false,
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to login'
      }));
      throw error;
    }
  };

  const loginWithWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Please install MetaMask to use this feature');
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];

      // Get user's CHZ balance
      const provider = new Web3Provider(window.ethereum);
      const balance = await provider.getBalance(userAddress);
      setBalance(formatEther(balance));

      // Login or create user with wallet
      const { user, token } = await authService.loginWithWallet(userAddress);
      setState(prev => ({
        isAuthenticated: true,
        user,
        token,
        authType: 'web3',
        loading: false,
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to connect wallet'
      }));
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
      authType: null,
      loading: false,
      isLoading: false,
      error: null
    });
    setBalance('0');
  };

  const register = async (credentials: RegisterCredentials) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));
    try {
      const { user, token } = await authService.register(credentials);
      setState(prev => ({
        isAuthenticated: true,
        user,
        token,
        authType: 'traditional',
        loading: false,
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to register'
      }));
      throw error;
    }
  };

  const updateProfile = async (userId: string, updates: Partial<UserProfile>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const updatedUser = await authService.updateProfile(userId, updates);
      setState(prev => ({
        ...prev,
        user: updatedUser,
        loading: false,
        error: null
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to update profile'
      }));
      throw error;
    }
  };

  // Listen for account changes when using Web3
  useEffect(() => {
    // We need to ensure window.ethereum exists and authType is web3
    if (typeof window === 'undefined' || !window.ethereum || state.authType !== 'web3') {
      return;
    }

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        logout();
      } else if (state.user?.walletAddress && accounts[0].toLowerCase() !== state.user.walletAddress.toLowerCase()) {
        // Only re-login if the wallet address has actually changed
        await loginWithWallet();
      }
    };

    // Safe access with the ethereum provider (guaranteed to exist at this point)
    // Use type assertion to tell TypeScript that our ethereum object has these methods
    const provider = window.ethereum as unknown as EthereumProvider;
    provider.on('accountsChanged', handleAccountsChanged);
    
    // Clean up event listener
    return () => {
      if (provider) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [state.authType]); // Only re-run when auth type changes

  return (
    <UserContext.Provider
      value={{
        ...state,
        balance,
        login,
        loginWithWallet,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
