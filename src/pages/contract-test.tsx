import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { web3AuthService } from '@/services/web3auth.fixed';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '@/contracts/config';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';

/**
 * Test page for Web3Auth and contract integration
 */
const ContractTestPage: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [contractData, setContractData] = useState<any>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Initialize Web3Auth
        await web3AuthService.initialize();
        
        // Check if already logged in
        const loggedIn = await web3AuthService.isLoggedIn();
        setIsConnected(loggedIn);
        
        if (loggedIn) {
          // Get user account
          const accounts = await web3AuthService.getAccounts();
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            
            // Get chain ID
            const currentChainId = await web3AuthService.getChainId();
            setChainId(currentChainId);
            
            // Get balance
            const userBalance = await web3AuthService.getBalance();
            setBalance(userBalance.toString());
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Initialization error: ${errorMessage}`);
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Connect to Web3Auth
      const connected = await web3AuthService.connect();
      setIsConnected(connected);
      
      if (connected) {
        // Get user account
        const accounts = await web3AuthService.getAccounts();
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          
          // Get chain ID
          const currentChainId = await web3AuthService.getChainId();
          setChainId(currentChainId);
          
          // Get balance
          const userBalance = await web3AuthService.getBalance();
          setBalance(userBalance.toString());
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Connection error: ${errorMessage}`);
      console.error('Connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Disconnect from Web3Auth
      await web3AuthService.disconnect();
      setIsConnected(false);
      setAddress(null);
      setBalance(null);
      setChainId(null);
      setContractData(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Disconnect error: ${errorMessage}`);
      console.error('Disconnect error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testTokenContract = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isConnected) {
        throw new Error('Not connected. Please connect first.');
      }
      
      // Get provider and signer
      const provider = await web3AuthService.getEthersProvider(); // returns ethers.js Web3Provider
      const signer = await web3AuthService.getSigner(); // returns ethers.js Signer
      
      // Check if on the correct network
      const currentChainId = await web3AuthService.getChainId();
      if (currentChainId !== NETWORK_CONFIG.chainId) {
        throw new Error(`Wrong network. Please switch to Chiliz Spicy Testnet (Chain ID: ${NETWORK_CONFIG.chainId})`);
      }
      
      // Simple ERC20 ABI for the CHZ token
      const erc20Abi = [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function balanceOf(address) view returns (uint256)'
      ];
      
      // Initialize contract
      const tokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.ChilizToken,
        erc20Abi,
        signer
      );
      
      // Get token data
      const name = await tokenContract.name();
      const symbol = await tokenContract.symbol();
      const decimals = await tokenContract.decimals();
      const userBalance = await tokenContract.balanceOf(address);
      
      // Format balance
      const formattedBalance = formatUnits(userBalance, decimals);
      
      // Set contract data
      setContractData({
        name,
        symbol,
        decimals,
        balance: formattedBalance
      });
      
      console.log('Token contract data:', {
        name,
        symbol,
        decimals,
        balance: formattedBalance
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Contract test error: ${errorMessage}`);
      console.error('Contract test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Contract Integration Test</h1>
        <p className="mb-6 text-gray-700">
          This page allows you to test the Web3Auth integration with the deployed contracts on Chiliz Spicy Testnet.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Web3Auth Connection</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <p className="font-semibold">Status:</p>
              <p className={`${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            
            {address && (
              <div className="mb-4">
                <p className="font-semibold">Address:</p>
                <p className="text-sm break-all">{address}</p>
              </div>
            )}
            
            {chainId && (
              <div className="mb-4">
                <p className="font-semibold">Chain ID:</p>
                <p>{chainId} {chainId === NETWORK_CONFIG.chainId ? '(Correct Network)' : '(Wrong Network)'}</p>
              </div>
            )}
            
            {balance && (
              <div className="mb-4">
                <p className="font-semibold">Balance:</p>
                <p>{balance} CHZ</p>
              </div>
            )}
            
            <div className="flex space-x-4">
              <Button 
                onClick={handleConnect} 
                disabled={isLoading || isConnected}
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Connect'}
              </Button>
              
              <Button 
                onClick={handleDisconnect} 
                disabled={isLoading || !isConnected}
                variant="secondary"
                className="w-full"
              >
                Disconnect
              </Button>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Contract Interaction</h2>
            
            <Button 
              onClick={testTokenContract} 
              disabled={isLoading || !isConnected}
              className="w-full mb-4"
            >
              {isLoading ? 'Processing...' : 'Test CHZ Token Contract'}
            </Button>
            
            {contractData && (
              <div className="mt-4 bg-blue-50 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">Token Information</h3>
                <p><span className="font-semibold">Name:</span> {contractData.name}</p>
                <p><span className="font-semibold">Symbol:</span> {contractData.symbol}</p>
                <p><span className="font-semibold">Decimals:</span> {contractData.decimals}</p>
                <p><span className="font-semibold">Your Balance:</span> {contractData.balance} {contractData.symbol}</p>
              </div>
            )}
            
            <div className="mt-4">
              <h3 className="font-bold mb-2">Available Contracts</h3>
              <ul className="list-disc pl-5">
                <li>CHZ Token: {CONTRACT_ADDRESSES.ChilizToken}</li>
                <li>Team Token Factory: {CONTRACT_ADDRESSES.TeamTokenFactory}</li>
                <li>Token Marketplace: {CONTRACT_ADDRESSES.TokenMarketplace}</li>
                <li>Token Auction: {CONTRACT_ADDRESSES.TokenAuction}</li>
                <li>Token Staking: {CONTRACT_ADDRESSES.TokenStaking}</li>
              </ul>
            </div>
          </Card>
        </div>
        
        <div className="mt-8 bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">Debugging Information</h2>
          <p className="text-gray-700">
            If you encounter any issues with the contract integration, please check the following:
          </p>
          <ul className="list-disc pl-5 mt-2 text-gray-700">
            <li>Make sure you're connected to Chiliz Spicy Testnet (Chain ID: {NETWORK_CONFIG.chainId})</li>
            <li>Check that your Web3Auth wallet has CHZ tokens for contract interactions</li>
            <li>Verify that the contract addresses are correct</li>
            <li>Check the console for any JavaScript errors (F12 to open developer tools)</li>
          </ul>
          
          <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">Network Configuration:</h3>
            <pre className="bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
              {`Chain ID: ${NETWORK_CONFIG.chainId} (Chiliz Spicy Testnet)
Network Name: ${NETWORK_CONFIG.name}
RPC URL: ${NETWORK_CONFIG.rpcUrl}
Block Explorer: ${NETWORK_CONFIG.blockExplorer}

Environment Variables:
NEXT_PUBLIC_CHAIN_ID: ${process.env.NEXT_PUBLIC_CHAIN_ID || 'Not set'}
NEXT_PUBLIC_RPC_URL: ${process.env.NEXT_PUBLIC_RPC_URL || 'Not set'}`}
            </pre>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContractTestPage;
