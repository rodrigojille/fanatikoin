import React, { useState, useEffect } from 'react';
import { web3AuthService } from '@/services/web3auth';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { NETWORK_CONFIG } from '@/contracts/config';

/**
 * Component for testing Web3Auth social login integration
 * This component provides UI for testing various Web3Auth functions
 * and displays detailed error messages
 */
const Web3AuthTest: React.FC = () => {
  const { login, user, authType } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Log configuration for debugging
        console.log('[Web3Auth Test] Configuration:', {
          chainId: NETWORK_CONFIG.chainId,
          rpcUrl: NETWORK_CONFIG.rpcUrl,
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID?.substring(0, 10) + '...',
        });
        
        if (web3AuthService) {
          const initialized = await web3AuthService.initialize();
          setIsInitialized(initialized);
          if (!initialized) {
            setError('Failed to initialize Web3Auth');
          } else {
            console.log('[Web3Auth Test] Successfully initialized');
            // Check if already logged in
            const loggedIn = await web3AuthService.isLoggedIn();
            setIsConnected(loggedIn);
          }
        } else {
          setError('Web3Auth service not available');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Initialization error: ${errorMessage}`);
        console.error('[Web3Auth Test] Initialization error:', err);
        
        // Add more detailed error logging
        if (err instanceof Error) {
          console.error('[Web3Auth Test] Error stack:', err.stack);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      console.log('[Web3Auth Test] Starting connection...');
      
      // Step 1: Connect with Web3Auth
      const connected = await web3AuthService.connect();
      if (!connected) {
        throw new Error('Failed to connect with Web3Auth');
      }
      
      const provider = web3AuthService.getProvider();
      if (!provider) {
        throw new Error('Failed to get provider from Web3Auth');
      }
      
      setIsConnected(true);
      console.log('[Web3Auth Test] Successfully connected to Web3Auth');
      
      // Step 2: Get user info from Web3Auth
      const web3AuthUserInfo = await web3AuthService.getUserInfo();
      setUserInfo(web3AuthUserInfo);
      
      // Step 3: Login with our application using the email from Web3Auth
      if (web3AuthUserInfo && web3AuthUserInfo.email) {
        await login(
          { 
            email: web3AuthUserInfo.email,
            password: '' // Not needed for social login
          }, 
          true // isSocialLogin = true
        );
        setResult('Social login successful');
      } else {
        throw new Error('Failed to get email from Web3Auth');
      }
    } catch (err) {
      setError(`Login error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Web3Auth login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      setUserInfo(null);
      
      await web3AuthService.disconnect();
      setIsConnected(false);
      
      console.log('[Web3Auth Test] Logged out successfully');
    } catch (err) {
      setError(`Logout error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('[Web3Auth Test] Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getChainId = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const chainId = await web3AuthService.getChainId();
      setResult(`Chain ID: ${chainId}`);
    } catch (err) {
      setError(`Chain ID error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Web3Auth chain ID error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getBalance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const balance = await web3AuthService.getBalance();
      setResult(`Balance: ${balance} CHZ`);
    } catch (err) {
      setError(`Balance error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Web3Auth balance error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const accounts = await web3AuthService.getAccounts();
      setResult(`Account: ${accounts[0] || 'No account found'}`);
    } catch (err) {
      setError(`Account error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Web3Auth account error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Web3Auth Integration Test</h2>
      
      <div className="mb-4">
        <p className="mb-2">
          <strong>Status:</strong> {isInitialized ? 'Initialized' : 'Not initialized'}
        </p>
        <p className="mb-2">
          <strong>Auth Type:</strong> {authType || 'Not authenticated'}
        </p>
        {user && (
          <div className="mb-2">
            <p><strong>User:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        )}
      </div>
      
      <div className="space-y-2 mb-4">
        <Button 
          onClick={handleLogin} 
          disabled={isLoading || !isInitialized}
          className="w-full"
        >
          {isLoading ? 'Processing...' : 'Login with Web3Auth'}
        </Button>
        
        <Button 
          onClick={handleLogout} 
          disabled={isLoading || !isConnected}
          variant="secondary"
          className="w-full"
        >
          Logout from Web3Auth
        </Button>
        
        <Button 
          onClick={getChainId} 
          disabled={isLoading || !isConnected}
          variant="secondary"
          className="w-full mt-2"
        >
          Get Chain ID
        </Button>
        
        <Button 
          onClick={getBalance} 
          disabled={isLoading || !isConnected}
          variant="secondary"
          className="w-full mt-2"
        >
          Get Balance
        </Button>
        
        <Button 
          onClick={getAccount} 
          disabled={isLoading || !isConnected}
          variant="secondary"
          className="w-full mt-2"
        >
          Get Account
        </Button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded mb-4">
          <p className="font-bold">Result:</p>
          <p>{result}</p>
        </div>
      )}
      
      {userInfo && (
        <div className="mt-4">
          <pre>{JSON.stringify(userInfo, null, 2)}</pre>
        </div>
      )}
    </Card>
  );
};

// DEPRECATED: Web3Auth test component removed. This file is now unused.
