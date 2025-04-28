import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider, JsonRpcProvider, Contract, formatEther, parseEther, formatUnits, parseUnits, type BigNumberish, ContractTransactionResponse } from 'ethers';
import { handleWeb3Error, safeWeb3Call, validateChilizNetwork } from '../utils/web3ErrorHandler';
import { metamaskService } from '../services/metamask';

// Type definition for window.ethereum is now in src/types/ethereum.d.ts
import { TeamTokenFactory } from '../contracts/interfaces/TeamTokenFactory';
import TeamTokenFactoryABI from '../contracts/abis/TeamTokenFactory.json';
import { TokenMarketplace } from '../contracts/interfaces/TokenMarketplace';
import { TokenAuction } from '../contracts/interfaces/TokenAuction';
import TokenAuctionABI from '../contracts/abis/TokenAuction.json';
import { CONTRACT_ADDRESSES, CONTRACT_CONFIG } from '../contracts/config';
import TeamTokenABI from '../contracts/abis/TeamToken.json';
import TokenMarketplaceABI from '../contracts/abis/TokenMarketplace.json';
import {
  formatTokenAmount,
  formatChzPrice,
  formatDuration,
  calculateTimeRemaining,
} from '../utils/tokenUtils';

// Define Token interface
interface Token {
  address: string;
  name: string;
  symbol: string;
  description: string;
  benefits: string[];
  price: string;
  hasError?: boolean;
}

// Define Auction interface
interface Auction {
  id: number;
  tokenAddress: string;
  seller: string;
  tokenAmount: string;
  startingPrice: number;
  currentBid: number;
  highestBidder: string;
  startTime: Date;
  endTime: string;
  timeRemaining: string | number;
  duration: string;
  active: boolean;
  name: string;
  symbol: string;
  hasError?: boolean;
  // Fields required by AppAuction
  address: string;
  minBidIncrement: number;
  description: string;
  totalBids: number;
}

interface TokenContextType {
  tokens: Token[];
  auctions: Auction[];
  loading: boolean;
  error: string | null;
  fetchTokens: (retryCount?: number) => Promise<void>;
  fetchAuctions: (retryCount?: number) => Promise<void>;
  approveToken: (tokenAddress: string, amount: BigNumberish) => Promise<void>;
  createToken: (
    name: string,
    symbol: string,
    description: string,
    benefits: string[],
    initialSupply: number,
    maxSupply: number,
    initialPrice: number
  ) => Promise<void>;
  createAuction: (
    tokenAddress: string,
    tokenAmount: number,
    startingPrice: number,
    duration: number
  ) => Promise<void>;
  bidOnAuction: (auctionId: number, amount: number) => Promise<void>;
  metaMaskConnected: boolean;
  metaMaskAddress: string | null;
  connectMetaMask: () => Promise<void>;
  tokensEmpty: boolean;
  auctionsEmpty: boolean;
}

export const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metaMaskMissing, setMetaMaskMissing] = useState(false);
  const [metaMaskConnected, setMetaMaskConnected] = useState(false);
  const [metaMaskAddress, setMetaMaskAddress] = useState<string | null>(null);

  // Helper to check and update MetaMask status
  const updateMetaMaskStatus = async () => {
    if (!metamaskService.isMetaMaskAvailable()) {
      setMetaMaskMissing(true);
      setMetaMaskConnected(false);
      setMetaMaskAddress(null);
      return;
    }
    setMetaMaskMissing(false);
    try {
      const provider = metamaskService.getProvider();
      if (provider) {
        const address = metamaskService.getAddress();
        setMetaMaskConnected(!!address);
        setMetaMaskAddress(address);
      } else {
        setMetaMaskConnected(false);
        setMetaMaskAddress(null);
      }
    } catch {
      setMetaMaskConnected(false);
      setMetaMaskAddress(null);
    }
  };

  // Prompt user to connect MetaMask
  const connectMetaMask = async () => {
    try {
      await metamaskService.connect();
      await updateMetaMaskStatus();
    } catch (error) {
      setMetaMaskConnected(false);
      setMetaMaskAddress(null);
      setError('Failed to connect MetaMask. Please approve the connection in your wallet.');
    }
  };

  // Listen for MetaMask events
  React.useEffect(() => {
    updateMetaMaskStatus();
    metamaskService.on((event) => {
      if (event.type === 'connected' || event.type === 'accountChanged' || event.type === 'chainChanged' || event.type === 'disconnected') {
        updateMetaMaskStatus();
      }
    });
    return () => {
      metamaskService.off(updateMetaMaskStatus);
    };
  }, []);
  const approveToken = async (tokenAddress: string, amount: BigNumberish) => {
    try {
      setLoading(true);
      setError(null);

      // Use safe web3 call with proper error handling
      await safeWeb3Call(async () => {
        if (!metamaskService.isMetaMaskAvailable()) {
          throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
        }
        
        const provider = metamaskService.getProvider();
if (!provider) {
  throw new Error('No provider available. Please connect your wallet.');
}
        
        // Validate network before proceeding
        const networkValidation = await validateChilizNetwork(provider);
        if (!networkValidation.isValid) {
          throw new Error(networkValidation.error);
        }
        
        const signer = await metamaskService.getSigner();
if (!signer) {
  throw new Error('No signer available. Please connect your wallet.');
}

        // Initialize token contract
        const token = new Contract(tokenAddress, TeamTokenABI, signer);

        // Approve marketplace to spend tokens
        const tx = await token.approve(CONTRACT_ADDRESSES.TokenMarketplace, amount);
        // For ethers v6, wait for transaction to be mined
        // Explicitly cast to ContractTransactionResponse to access wait()
        await (tx as ContractTransactionResponse).wait();
        return tx;
      }, 'Token approval failed');
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Token approval failed');
      setError(errorMessage);
      throw err; // Re-throw to handle in the UI
    } finally {
      setLoading(false);
    }
  };
  const [tokens, setTokens] = useState<Token[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokensEmpty, setTokensEmpty] = useState(false);
  const [auctionsEmpty, setAuctionsEmpty] = useState(false);

  const fetchTokens = async (retryCount = 2) => {
    // Guard: Only fetch if MetaMask is available and connected
    if (!metamaskService.isMetaMaskAvailable() || !metaMaskConnected) {
      setError('No Web3 provider detected or wallet not connected. Please connect MetaMask.');
      setLoading(false);
      setTokensEmpty(true);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setTokensEmpty(false);

      // Use safe web3 call with proper error handling
      await safeWeb3Call(async () => {
        if (!metamaskService.isMetaMaskAvailable()) {
          throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
        }
        
        const provider = metamaskService.getProvider();
if (!provider) {
  throw new Error('No provider available. Please connect your wallet.');
}
        
        // Validate network before proceeding
        const networkValidation = await validateChilizNetwork(provider);
        if (!networkValidation.isValid) {
          throw new Error(networkValidation.error);
        }
        
        const signer = await metamaskService.getSigner();
if (!signer) {
  throw new Error('No signer available. Please connect your wallet.');
}

        // Initialize factory contract
        const factoryContract = new Contract(
          CONTRACT_ADDRESSES.TeamTokenFactory,
          TeamTokenFactoryABI,
          signer
        );

        // Get all tokens
        const tokens = await factoryContract.getAllTokens();
        
        // Process tokens
        const processedTokens = await Promise.all(tokens.map(async (tokenAddress: string) => {
          try {
            const tokenContract = new Contract(tokenAddress, TeamTokenABI, signer);
            const [name, symbol, description, benefits, price] = await Promise.all([
              tokenContract.name(),
              tokenContract.symbol(),
              tokenContract.description(),
              tokenContract.benefits(),
              tokenContract.price()
            ]);

            return {
              address: tokenAddress,
              name: name.toString(),
              symbol: symbol.toString(),
              description: description.toString(),
              benefits: benefits.map(benefit => benefit.toString()),
              price: formatUnits(price, CONTRACT_CONFIG.decimals),
              hasError: false
            };
          } catch (error) {
            console.error(`Error processing token ${tokenAddress}:`, error);
            return {
              address: tokenAddress,
              name: 'Error',
              symbol: 'ERR',
              description: 'Failed to load token information',
              benefits: [],
              price: '0',
              hasError: true
            };
          }
        }));

        setTokens(processedTokens);
        setTokensEmpty(processedTokens.length === 0);
        return processedTokens;
      }, 'Token fetching failed');
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Token fetching failed');
      setError(errorMessage);
      console.error('Fetch tokens error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuctions = async (retryCount = 2) => {
    // Guard: Only fetch if MetaMask is available and connected
    if (!metamaskService.isMetaMaskAvailable() || !metaMaskConnected) {
      setError('No Web3 provider detected or wallet not connected. Please connect MetaMask.');
      setLoading(false);
      setAuctionsEmpty(true);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // Use safe web3 call with proper error handling
      await safeWeb3Call(async () => {
        if (!metamaskService.isMetaMaskAvailable()) {
          throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
        }
        
        const provider = metamaskService.getProvider();
if (!provider) {
  throw new Error('No provider available. Please connect your wallet.');
}
        
        // Validate network before proceeding
        const networkValidation = await validateChilizNetwork(provider);
        if (!networkValidation.isValid) {
          throw new Error(networkValidation.error);
        }
        
        const signer = await metamaskService.getSigner();
if (!signer) {
  throw new Error('No signer available. Please connect your wallet.');
}

        // Initialize auction contract
        const auctionContract = new Contract(
          CONTRACT_ADDRESSES.TokenAuction,
          TokenAuctionABI,
          signer
        );

        // Get auction count
        const auctionCount = await auctionContract.getAuctionCount();
        
        // Process auctions
        const processedAuctions = await Promise.all(
          Array.from({ length: auctionCount.toNumber() }, (_, i) => i)
            .map(async (index) => {
              try {
                const auction = await auctionContract.auctions(index);
                const tokenContract = new Contract(auction.tokenAddress, TeamTokenABI, signer);
                const [name, symbol, description, benefits, price] = await Promise.all([
                  tokenContract.name(),
                  tokenContract.symbol(),
                  tokenContract.description(),
                  tokenContract.benefits(),
                  tokenContract.price()
                ]);

                const address = metamaskService.getAddress();

                return {
                  id: index,
                  tokenAddress: auction.tokenAddress,
                  seller: auction.seller,
                  tokenAmount: formatUnits(auction.tokenAmount, CONTRACT_CONFIG.decimals),
                  startingPrice: Number(formatUnits(auction.startingPrice, CONTRACT_CONFIG.decimals)),
                  currentBid: Number(formatUnits(auction.currentBid, CONTRACT_CONFIG.decimals)),
                  highestBidder: auction.highestBidder,
                  startTime: new Date(auction.startTime.toNumber() * 1000),
                  endTime: new Date(auction.endTime.toNumber() * 1000).toISOString(),
                  timeRemaining: calculateTimeRemaining(auction.endTime.toNumber()),
                  duration: formatDuration(auction.duration.toNumber()),
                  active: auction.active,
                  name: name.toString(),
                  symbol: symbol.toString(),
                  hasError: false,
                  address: auction.tokenAddress || '',
                  minBidIncrement: auction.minBidIncrement !== undefined ? Number(auction.minBidIncrement) : 1,
                  description: auction.description || '',
                  totalBids: auction.totalBids !== undefined ? Number(auction.totalBids) : 0
                };
              } catch (error) {
                console.error(`Error processing auction ${index}:`, error);
                return {
                  id: index,
                  tokenAddress: '',
                  seller: '',
                  tokenAmount: '0',
                  startingPrice: 0,
                  currentBid: 0,
                  highestBidder: '',
                  startTime: new Date(),
                  endTime: new Date().toISOString(),
                  timeRemaining: '0',
                  duration: '0',
                  active: false,
                  name: 'Error',
                  symbol: 'ERR',
                  hasError: true,
                  address: '',
                  minBidIncrement: 1,
                  description: '',
                  totalBids: 0
                };
              }
            }));

        setAuctions(processedAuctions);
        setAuctionsEmpty(processedAuctions.length === 0);
        return processedAuctions;
      }, 'Auction fetching failed');
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Auction fetching failed');
      setError(errorMessage);
      console.error('Fetch auctions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createToken = async (
    name: string,
    symbol: string,
    description: string,
    benefits: string[],
    initialSupply: number,
    maxSupply: number,
    initialPrice: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      await safeWeb3Call(async () => {
        if (!metamaskService.isMetaMaskAvailable()) {
          throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
        }
        
        const provider = metamaskService.getProvider();
if (!provider) {
  throw new Error('No provider available. Please connect your wallet.');
}
        
        // Validate network before proceeding
        const networkValidation = await validateChilizNetwork(provider);
        if (!networkValidation.isValid) {
          throw new Error(networkValidation.error);
        }
        
        const signer = await metamaskService.getSigner();
if (!signer) {
  throw new Error('No signer available. Please connect your wallet.');
}

        const factory = new TeamTokenFactory(
          CONTRACT_ADDRESSES.TeamTokenFactory,
          signer
        );

        const tx = await factory.createToken(
          name,
          symbol,
          description,
          benefits,
          BigInt(initialSupply),
          BigInt(maxSupply),
          parseUnits(initialPrice.toString(), CONTRACT_CONFIG.decimals)
        );
        
        // For ethers v6, wait for transaction to be mined
        // Explicitly cast to ContractTransactionResponse to access wait()
        await (tx as ContractTransactionResponse).wait();
        return tx;
      }, 'Token creation failed');

      // Refresh tokens list
      await fetchTokens();
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Token creation failed');
      setError(errorMessage);
      console.error('Create token error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAuction = async (
    tokenAddress: string,
    tokenAmount: number,
    startingPrice: number,
    duration: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      await safeWeb3Call(async () => {
        if (!metamaskService.isMetaMaskAvailable()) {
          throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
        }
        
        const provider = metamaskService.getProvider();
if (!provider) {
  throw new Error('No provider available. Please connect your wallet.');
}
        
        // Validate network before proceeding
        const networkValidation = await validateChilizNetwork(provider);
        if (!networkValidation.isValid) {
          throw new Error(networkValidation.error);
        }
        
        const signer = await metamaskService.getSigner();
if (!signer) {
  throw new Error('No signer available. Please connect your wallet.');
}

        const auctionContract = new Contract(
          CONTRACT_ADDRESSES.TokenAuction,
          TokenAuctionABI,
          signer
        );

        const tx = await auctionContract.createAuction(
          tokenAddress,
          BigInt(tokenAmount),
          parseUnits(startingPrice.toString(), CONTRACT_CONFIG.decimals),
          BigInt(duration)
        );
        
        // For ethers v6, wait for transaction to be mined
        // Explicitly cast to ContractTransactionResponse to access wait()
        await (tx as ContractTransactionResponse).wait();
        return tx;
      }, 'Auction creation failed');

      // Refresh auctions list
      await fetchAuctions();
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Auction creation failed');
      setError(errorMessage);
      console.error('Create auction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const bidOnAuction = async (auctionId: number, amount: number) => {
    try {
      setLoading(true);
      setError(null);

      await safeWeb3Call(async () => {
        if (!metamaskService.isMetaMaskAvailable()) {
          throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
        }
        
        const provider = metamaskService.getProvider();
if (!provider) {
  throw new Error('No provider available. Please connect your wallet.');
}
        
        // Validate network before proceeding
        const networkValidation = await validateChilizNetwork(provider);
        if (!networkValidation.isValid) {
          throw new Error(networkValidation.error);
        }
        
        const signer = await metamaskService.getSigner();
if (!signer) {
  throw new Error('No signer available. Please connect your wallet.');
}

        const auctionContract = new Contract(
          CONTRACT_ADDRESSES.TokenAuction,
          TokenAuctionABI,
          signer
        );

        const tx = await auctionContract.bid(auctionId);
        
        // For ethers v6, wait for transaction to be mined
        // Explicitly cast to ContractTransactionResponse to access wait()
        await (tx as ContractTransactionResponse).wait();
        return tx;
      }, 'Bidding on auction failed');

      // Refresh auctions list
      await fetchAuctions();
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Bidding on auction failed');
      setError(errorMessage);
      console.error('Bid on auction error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if MetaMask is available and connected
    if (!metaMaskMissing && metaMaskConnected) {
      fetchTokens();
      fetchAuctions();
    }
  }, [metaMaskMissing, metaMaskConnected]);

  return (
    <TokenContext.Provider value={{
      tokens,
      auctions,
      loading,
      error,
      fetchTokens,
      fetchAuctions,
      createToken,
      createAuction,
      bidOnAuction,
      approveToken,
      metaMaskConnected,
      metaMaskAddress,
      connectMetaMask,
      tokensEmpty,
      auctionsEmpty,
    }}>
      {children}
    </TokenContext.Provider>
  );
};


export const useToken = () => {
const context = useContext(TokenContext);
if (context === undefined) {
throw new Error('useToken must be used within a TokenProvider');
}
return context;
};
