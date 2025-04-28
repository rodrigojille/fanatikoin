import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, parseUnits } from 'ethers';
import { TokenAuction } from '../contracts/interfaces/TokenAuction';
import { CONTRACT_ADDRESSES, CONTRACT_CONFIG } from '../contracts/config';
import { formatChzPrice, formatTokenAmount, calculateTimeRemaining } from '../utils/tokenUtils';
import { handleWeb3Error, safeWeb3Call } from '../utils/web3ErrorHandler';
import { metamaskService } from '../services/metamask';

interface TokenAuctionHook {
  createAuction: (
    tokenAddress: string,
    tokenAmount: number,
    startingPrice: number,
    duration: number
  ) => Promise<void>;
  bidOnAuction: (auctionId: number, amount: number) => Promise<void>;
  endAuction: (auctionId: number) => Promise<void>;
  auctions: typeof MOCK_AUCTIONS;
  loading: boolean;
  error: string | null;
}

// Add a helper for mock auctions
const MOCK_AUCTIONS = [
  {
    id: 1,
    tokenAddress: '0xmock1',
    tokenName: 'FC Barcelona',
    tokenSymbol: 'BAR',
    startingPrice: 100,
    highestBid: 120,
    endTime: Date.now() + 86400000,
    description: 'Subasta de tokens FC Barcelona',
    isActive: true,
  },
  {
    id: 2,
    tokenAddress: '0xmock2',
    tokenName: 'Manchester United',
    tokenSymbol: 'MUN',
    startingPrice: 90,
    highestBid: 95,
    endTime: Date.now() + 43200000,
    description: 'Subasta de tokens Manchester United',
    isActive: true,
  },
];

export const useTokenAuction = (): TokenAuctionHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auctions, setAuctions] = useState<typeof MOCK_AUCTIONS>([]);

  // Fetch auctions (real or mock)
  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!metamaskService.isMetaMaskAvailable()) {
        setAuctions(MOCK_AUCTIONS);
        setLoading(false);
        return MOCK_AUCTIONS;
      }
      // TODO: Replace with real contract call if needed
      setAuctions(MOCK_AUCTIONS);
      setLoading(false);
      return MOCK_AUCTIONS;
    } catch (err) {
      setError('Failed to fetch auctions');
      setAuctions([]);
      setLoading(false);
      return [];
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

      // Check if window.ethereum exists
      if (!metamaskService.isMetaMaskAvailable()) {
        throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
      }
      
      // Use the non-null assertion operator since we've checked for existence
      const provider = metamaskService.getProvider();
      const signer = await metamaskService.getSigner();
if (!signer) {
  throw new Error('No signer available. Please connect your wallet.');
}

      // Initialize auction contract
      const auction = new TokenAuction(
        CONTRACT_ADDRESSES.TokenAuction,
        signer
      );

      // Create auction
      await auction.createAuction(
        tokenAddress,
        tokenAmount,
        parseUnits(startingPrice.toString(), CONTRACT_CONFIG.decimals),
        duration
      );
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Failed to create auction');
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

      // Check if window.ethereum exists
      if (!metamaskService.isMetaMaskAvailable()) {
        throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
      }
      
      // Use the non-null assertion operator since we've checked for existence
      const provider = metamaskService.getProvider();
      const signer = await metamaskService.getSigner();
if (!signer) {
  throw new Error('No signer available. Please connect your wallet.');
}

      // Initialize auction contract
      const auction = new TokenAuction(
        CONTRACT_ADDRESSES.TokenAuction,
        signer
      );

      // Get auction details
      const auctionDetails = await auction.getAuction(auctionId);
      const currentBid = BigInt(auctionDetails.highestBid.toString());
      const newBid = parseUnits(amount.toString(), CONTRACT_CONFIG.decimals);

      if (newBid <= currentBid) {
        throw new Error('Bid must be higher than current highest bid');
      }

      // Approve CHZ tokens for transfer
      const chilizToken = new Contract(
        CONTRACT_ADDRESSES.ChilizToken,
        ['function approve(address spender, uint256 amount) external returns (bool)'],
        signer
      );

      await chilizToken.approve(
        CONTRACT_ADDRESSES.TokenAuction,
        newBid
      );

      // Place bid
      await auction.bid(auctionId);
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Failed to bid on auction');
      setError(errorMessage);
      console.error('Bid on auction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const endAuction = async (auctionId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Check if window.ethereum exists
      if (!metamaskService.isMetaMaskAvailable()) {
        throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
      }
      
      // Use the non-null assertion operator since we've checked for existence
      const provider = metamaskService.getProvider();
      const signer = await metamaskService.getSigner();
if (!signer) {
  throw new Error('No signer available. Please connect your wallet.');
}

      // Initialize auction contract
      const auction = new TokenAuction(
        CONTRACT_ADDRESSES.TokenAuction,
        signer
      );

      // End auction
      await auction.endAuction(auctionId);
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Failed to end auction');
      setError(errorMessage);
      console.error('End auction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    createAuction,
    bidOnAuction,
    endAuction,
    auctions,
    loading,
    error,
  };
};
