import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, parseUnits, formatUnits } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_CONFIG } from '../contracts/config';
import { handleWeb3Error, safeWeb3Call } from '../utils/web3ErrorHandler';
import { metamaskService } from '../services/metamask';

interface TokenStats {
  address: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  circulatingSupply: bigint;
  holders: number;
  price: string;
}

interface TeamTokenHook {
  tokens: TokenStats[];
  loading: boolean;
  error: string | null;
  createToken: (name: string, symbol: string, totalSupply: number, initialPrice: number) => Promise<void>;
  buybackTokens: (tokenAddress: string, amount: number) => Promise<void>;
  getHoldersList: (tokenAddress: string) => Promise<string[]>;
  isLoading: boolean;
}

export const useTeamTokens = (): TeamTokenHook => {
  const [tokens, setTokens] = useState<TokenStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTokens = async () => {
    try {
      setIsLoading(true);
      
      // Check if window.ethereum exists
      if (!metamaskService.isMetaMaskAvailable()) {
        throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
      }
      
      // Use the non-null assertion operator since we've checked for existence
      const provider = metamaskService.getProvider();
      const signer = await metamaskService.getSigner();

      // Initialize factory contract
      const factory = new Contract(
        CONTRACT_ADDRESSES.TeamTokenFactory,
        [
          'function getTeamTokens() view returns (address[])',
          'function createToken(string name, string symbol, uint256 totalSupply, uint256 initialPrice) returns (address)'
        ],
        signer
      );

      // Get all team tokens
      let tokenAddresses;
      try {
        tokenAddresses = await factory.getTeamTokens();
      } catch (err: unknown) {
        // If we get a BAD_DATA error, it means there are no tokens yet
        if (err && typeof err === 'object' && 'code' in err && err.code === 'BAD_DATA') {
          tokenAddresses = [];
        } else {
          throw err;
        }
      }
      
      // Load token details
      const tokenDetails = await Promise.all(
        tokenAddresses.map(async (address: string) => {
          const token = new Contract(
            address,
            [
              'function name() view returns (string)',
              'function symbol() view returns (string)',
              'function totalSupply() view returns (uint256)',
              'function circulatingSupply() view returns (uint256)',
              'function getCurrentPrice() view returns (uint256)',
              'function getHoldersCount() view returns (uint256)'
            ],
            signer
          );

          const [name, symbol, totalSupply, circulatingSupply, price, holdersCount] = await Promise.all([
            token.name(),
            token.symbol(),
            token.totalSupply(),
            token.circulatingSupply(),
            token.getCurrentPrice(),
            token.getHoldersCount()
          ]);

          return {
            address,
            name,
            symbol,
            totalSupply,
            circulatingSupply,
            holders: Number(holdersCount),
            price: formatUnits(price, 18)
          };
        })
      );

      setTokens(tokenDetails);
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Failed to load team tokens');
      setError(errorMessage);
      console.error('Load tokens error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createToken = async (name: string, symbol: string, totalSupply: number, initialPrice: number) => {
    try {
      setLoading(true);
      
      // Check if window.ethereum exists
      if (!metamaskService.isMetaMaskAvailable()) {
        throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
      }
      
      // Use the non-null assertion operator since we've checked for existence
      const provider = metamaskService.getProvider();
      const signer = await metamaskService.getSigner();

      const factory = new Contract(
        CONTRACT_ADDRESSES.TeamTokenFactory,
        ['function createToken(string name, string symbol, uint256 totalSupply, uint256 initialPrice) returns (address)'],
        signer
      );

      const tx = await factory.createToken(
        name,
        symbol,
        BigInt(totalSupply),
        parseUnits(initialPrice.toString(), CONTRACT_CONFIG.decimals)
      );
      // For ethers v6, wait for transaction to be mined
      await tx.wait();

      // Reload tokens
      await loadTokens();
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Failed to create token');
      setError(errorMessage);
      console.error('Create token error:', err);
    } finally {
      setLoading(false);
    }
  };

  const buybackTokens = async (tokenAddress: string, amount: number) => {
    try {
      setLoading(true);
      
      // Check if window.ethereum exists
      if (!metamaskService.isMetaMaskAvailable()) {
        throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
      }
      
      // Use the non-null assertion operator since we've checked for existence
      const provider = metamaskService.getProvider();
      const signer = await metamaskService.getSigner();

      const token = new Contract(
        tokenAddress,
        ['function buyback(uint256 amount) returns (bool)'],
        signer
      );

      const tx = await token.buyback(BigInt(amount));
      // For ethers v6, wait for transaction to be mined
      await tx.wait();

      // Reload tokens
      await loadTokens();
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Failed to buyback tokens');
      setError(errorMessage);
      console.error('Buyback tokens error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHoldersList = async (tokenAddress: string): Promise<string[]> => {
    try {
      // Check if window.ethereum exists
      if (!metamaskService.isMetaMaskAvailable()) {
        throw new Error('No Web3 provider detected. Please install MetaMask or use a Web3 browser.');
      }
      
      // Use the non-null assertion operator since we've checked for existence
      const provider = metamaskService.getProvider();
      const signer = await metamaskService.getSigner();

      const token = new Contract(
        tokenAddress,
        ['function getHolders() view returns (address[])'],
        signer
      );

      return await token.getHolders();
    } catch (err: unknown) {
      const errorMessage = handleWeb3Error(err, 'Failed to get holders list');
      setError(errorMessage);
      console.error('Get holders list error:', err);
      return [];
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  return {
    tokens,
    loading,
    error,
    createToken,
    buybackTokens,
    getHoldersList,
    isLoading
  };
};
