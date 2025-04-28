import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, LoginCredentials, RegisterCredentials, AuthContextType as IAuthContextType } from '../types/auth';
import { authService } from '../services/authService';
import { tokenService } from '../services/tokenService';

const AuthContext = createContext<IAuthContextType | undefined>(undefined);

import { useWeb3 } from '@/context/Web3Context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authType, setAuthType] = useState<'traditional' | 'web3' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Robust isAuthenticated: true only if user is non-null and has walletAddress or email
  const isAuthenticated = !!user && (typeof user === 'object') && ((user.walletAddress && user.walletAddress.length > 0) || (user.email && user.email.length > 0));

  const { address } = useWeb3();

  // Sync wallet connection with auth state
  useEffect(() => {
    // If wallet is connected and no user, auto-login with wallet
    if (address && !user) {
      loginWithWallet().catch((err) => {
        console.error('[AuthContext] Failed to login with wallet:', err);
      });
    }
    // If wallet is disconnected and user exists, logout
    if (!address && user) {
      logout();
    }
    // If user is present and wallet address changes, update user.walletAddress
    if (user && address && user.walletAddress !== address) {
      const updatedUser = { ...user, walletAddress: address };
      setUser(updatedUser);
      // Persist updated user in localStorage
      const auth = authService.getCurrentUser();
      if (auth && auth.user && auth.token) {
        localStorage.setItem('fanatikoin_auth', JSON.stringify({
          ...auth,
          user: updatedUser
        }));
      }
    }
  }, [address, user]);

  // Initialize auth state and schedule token refresh
  useEffect(() => {
    try {
      const auth = authService.getCurrentUser();
      if (auth.user && auth.token) {
        setUser(auth.user);
        setToken(auth.token);
        setAuthType(auth.authType);
        tokenService.scheduleTokenRefresh(auth.token);
      }
    } catch (err) {
      console.error('Error restoring auth state:', err);
      setError('Failed to restore authentication state');
    } finally {
      setLoading(false);
    }

    // Cleanup token refresh on unmount
    return () => {
      tokenService.clearRefreshTimeout();
    };
  }, []);

  // Handle token refresh
  useEffect(() => {
    if (token) {
      tokenService.scheduleTokenRefresh(token);
    }
    return () => {
      tokenService.clearRefreshTimeout();
    };
  }, [token]);

  const login = async (credentials: LoginCredentials, isSocialLogin: boolean = false) => {
    setError(null);
    setLoading(true);
    try {
      if (isSocialLogin) {
        // Handle Web3Auth social login
        // For social login, we need to create a user account if it doesn't exist
        // or just log them in if it does
        try {
          // Try logging in first
          const result = await authService.login({ 
            email: credentials.email,
            password: credentials.password || '' // May be empty for social login
          });
          setUser(result.user);
          setToken(result.token);
          tokenService.scheduleTokenRefresh(result.token);
          setAuthType('web3');
        } catch (error) {
          // If login fails, try to register the user
          if (credentials.email) {
            const result = await authService.register({
              username: credentials.email.split('@')[0], // Create username from email
              email: credentials.email,
              password: Math.random().toString(36).slice(-12), // Generate random password
              confirmPassword: Math.random().toString(36).slice(-12) // This is just for validation, won't be used
            });
            setUser(result.user);
            setToken(result.token);
            tokenService.scheduleTokenRefresh(result.token);
            setAuthType('web3');
          } else {
            throw new Error('Social login requires an email');
          }
        }
      } else {
        // Traditional login
        const result = await authService.login(credentials);
        setUser(result.user);
        setToken(result.token);
        tokenService.scheduleTokenRefresh(result.token);
        setAuthType('traditional');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.register(credentials);
      setUser(result.user);
      setToken(result.token);
      tokenService.scheduleTokenRefresh(result.token);
      setAuthType('traditional');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithWallet = async () => {
    setError(null);
    setLoading(true);
    try {
      const { ethereum } = window as any;
      if (!ethereum) throw new Error('No wallet found');
      
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      const result = await authService.loginWithWallet(address);
      setUser(result.user);
      setToken(result.token);
      tokenService.scheduleTokenRefresh(result.token);
      setAuthType('web3');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wallet login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      authService.logout();
      tokenService.clearRefreshTimeout();
      setUser(null);
      setToken(null);
      setAuthType(null);
      setError(null);
    } catch (err) {
      console.error('Error during logout:', err);
      setError('Logout failed');
    }
  };

  const updateProfile = async (userId: string, updates: Partial<UserProfile>) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.updateProfile(userId, updates);
      if (user && user._id === userId) {
        setUser(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authType,
        loading,
        error,
        isAuthenticated: !!user && !!token,
        isLoading: loading, // Add isLoading property to match AuthContextType interface
        login,
        register,
        loginWithWallet,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
