import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// Use dynamic import with no SSR for Layout to avoid hydration issues
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });
import { web3AuthService } from '@/services/web3auth';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '@/contracts/config';

/**
 * Web3Auth Debug Page
 * This page helps diagnose Web3Auth integration issues
 */
const Web3DebugPage: React.FC = () => {
  // Add error boundary
  const [hasError, setHasError] = useState(false);
  
  // Reset error state if needed
  useEffect(() => {
    if (hasError) {
      const timer = setTimeout(() => setHasError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [hasError]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [chainId, setChainId] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        addLog('Starting initialization...');
        setIsInitializing(true);
        
        // Log environment variables
        addLog(`Environment variables:`);
        addLog(`NEXT_PUBLIC_CHAIN_ID: ${process.env.NEXT_PUBLIC_CHAIN_ID || 'Not set'}`);
        addLog(`NEXT_PUBLIC_RPC_URL: ${process.env.NEXT_PUBLIC_RPC_URL || 'Not set'}`);
        addLog(`NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: ${process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ? 
          process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID.substring(0, 10) + '...' : 'Not set'}`);
        
        // Log network config from config.ts
        addLog(`Network config from config.ts:`);
        addLog(`chainId: ${NETWORK_CONFIG.chainId}`);
        addLog(`name: ${NETWORK_CONFIG.name}`);
        addLog(`rpcUrl: ${NETWORK_CONFIG.rpcUrl}`);
        addLog(`blockExplorer: ${NETWORK_CONFIG.blockExplorer}`);
        
        // Initialize Web3Auth
        addLog('Initializing Web3Auth...');
        const initialized = await web3AuthService.initialize();
        
        if (initialized) {
          addLog('Web3Auth initialized successfully');
          
          // Check if already connected
          const isLoggedIn = await web3AuthService.isLoggedIn();
          if (isLoggedIn) {
            addLog('User is already logged in');
            setConnectionStatus('connected');
            
            // Get chain ID
            try {
              const chainId = await web3AuthService.getChainId();
              setChainId(chainId);
              addLog(`Connected to chain ID: ${chainId}`);
              
              // Get account
              const accounts = await web3AuthService.getAccounts();
              if (accounts.length > 0) {
                setAddress(accounts[0]);
                addLog(`Connected account: ${accounts[0]}`);
              }
            } catch (err) {
              addLog(`Error getting chain info: ${err instanceof Error ? err.message : String(err)}`);
            }
          } else {
            addLog('User is not logged in');
            setConnectionStatus('disconnected');
          }
        } else {
          addLog('Web3Auth initialization failed');
          setError('Failed to initialize Web3Auth');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        addLog(`Initialization error: ${errorMessage}`);
        setError(`Initialization error: ${errorMessage}`);
        
        if (err instanceof Error && err.stack) {
          addLog(`Error stack: ${err.stack}`);
        }
      } finally {
        setIsInitializing(false);
      }
    };
    
    initialize();
  }, []);
  
  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      setError(null);
      addLog('Attempting to connect...');
      
      // Connect to Web3Auth
      const connected = await web3AuthService.connect();
      
      if (connected) {
        addLog('Connected successfully');
        setConnectionStatus('connected');
        
        // Get chain ID
        try {
          const chainId = await web3AuthService.getChainId();
          setChainId(chainId);
          addLog(`Connected to chain ID: ${chainId}`);
          
          // Get account
          const accounts = await web3AuthService.getAccounts();
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            addLog(`Connected account: ${accounts[0]}`);
          }
        } catch (err) {
          addLog(`Error getting chain info: ${err instanceof Error ? err.message : String(err)}`);
        }
      } else {
        addLog('Connection failed');
        setConnectionStatus('disconnected');
        setError('Failed to connect to Web3Auth');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addLog(`Connection error: ${errorMessage}`);
      setError(`Connection error: ${errorMessage}`);
      setConnectionStatus('disconnected');
      
      if (err instanceof Error && err.stack) {
        addLog(`Error stack: ${err.stack}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      addLog('Disconnecting...');
      await web3AuthService.disconnect();
      addLog('Disconnected successfully');
      setConnectionStatus('disconnected');
      setChainId(null);
      setAddress(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addLog(`Disconnect error: ${errorMessage}`);
      setError(`Disconnect error: ${errorMessage}`);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Web3Auth Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Connection Status</h2>
            <div className="mb-4">
              <p className="mb-2">
                <strong>Status:</strong> {isInitializing ? 'Initializing...' : 
                  connectionStatus === 'connected' ? 'Connected' : 
                  connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </p>
              
              {chainId !== null && (
                <p className="mb-2">
                  <strong>Chain ID:</strong> {chainId}
                  {chainId === NETWORK_CONFIG.chainId ? 
                    ' ✅ (Correct network)' : 
                    ` ❌ (Wrong network, should be ${NETWORK_CONFIG.chainId})`}
                </p>
              )}
              
              {address && (
                <p className="mb-2">
                  <strong>Address:</strong> {address}
                </p>
              )}
            </div>
            
            <div className="flex space-x-4">
              <Button 
                onClick={handleConnect} 
                disabled={isInitializing || isConnecting || connectionStatus === 'connected'}
                className="w-full"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
              
              <Button 
                onClick={handleDisconnect} 
                disabled={isInitializing || connectionStatus !== 'connected'}
                variant="secondary"
                className="w-full"
              >
                Disconnect
              </Button>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Environment Configuration</h2>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Environment Variables:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {`NEXT_PUBLIC_CHAIN_ID: ${process.env.NEXT_PUBLIC_CHAIN_ID || 'Not set'}
NEXT_PUBLIC_RPC_URL: ${process.env.NEXT_PUBLIC_RPC_URL || 'Not set'}
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: ${process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ? 
  process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID.substring(0, 10) + '...' : 'Not set'}`}
              </pre>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Network Config (from config.ts):</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {`chainId: ${NETWORK_CONFIG.chainId}
name: ${NETWORK_CONFIG.name}
rpcUrl: ${NETWORK_CONFIG.rpcUrl}
blockExplorer: ${NETWORK_CONFIG.blockExplorer}`}
              </pre>
            </div>
          </Card>
        </div>
        
        {error && (
          <Card className="p-6 mt-6 bg-red-50 border border-red-200">
            <h2 className="text-xl font-bold mb-4 text-red-700">Error</h2>
            <p className="text-red-700">{error}</p>
          </Card>
        )}
        
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Debug Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

// DEPRECATED: Web3Auth debug page removed. This file is now unused.
