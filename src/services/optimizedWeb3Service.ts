import { ethers } from 'ethers';
import { JsonRpcProvider, Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { formatEther, formatUnits } from '@ethersproject/units';
import { blockchainCache } from '@/utils/cacheUtils';
import { CONTRACT_ADDRESSES } from '@/contracts/config';

// Default RPC URL from environment variable
const DEFAULT_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://spicy-rpc.chiliz.com/';
const DEFAULT_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1001');

/**
 * Optimized Web3 Service with caching and batch request support
 */
interface BatchedCall<T> {
  fn: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

class OptimizedWeb3Service {
  private provider: JsonRpcProvider | null = null;
  private batchedCalls: Map<string, BatchedCall<any>> = new Map();
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 50; // ms to wait before processing batch

  /**
   * Initialize the provider
   */
  async initProvider(rpcUrl: string = DEFAULT_RPC_URL): Promise<JsonRpcProvider> {
    if (!this.provider) {
      this.provider = new JsonRpcProvider(rpcUrl);
      
      // Ensure we're connected to the right network
      const network = await this.provider.getNetwork();
      if (network.chainId !== DEFAULT_CHAIN_ID) {
        console.warn(`Connected to chain ID ${network.chainId}, expected ${DEFAULT_CHAIN_ID}`);
      }
    }
    return this.provider;
  }

  /**
   * Get contract instance with caching
   */
  async getContract(
    address: string, 
    abi: any[], 
    signerOrProvider?: any
  ): Promise<Contract> {
    const cacheKey = `contract-${address}`;
    
    return blockchainCache.getOrSet(cacheKey, async () => {
      if (!signerOrProvider && !this.provider) {
        await this.initProvider();
      }
      
      return new Contract(
        address, 
        abi, 
        signerOrProvider || this.provider!
      );
    });
  }

  /**
   * Get account balance with caching
   */
  async getBalance(address: string): Promise<string> {
    const cacheKey = `balance-${address}`;
    
    return blockchainCache.getOrSet(cacheKey, async () => {
      if (!this.provider) {
        await this.initProvider();
      }
      
      const balance = await this.provider!.getBalance(address);
      return formatEther(balance);
    }, 30000); // 30 second cache for balances
  }

  /**
   * Get token balance with caching
   */
  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    const cacheKey = `token-balance-${tokenAddress}-${walletAddress}`;
    
    return blockchainCache.getOrSet(cacheKey, async () => {
      // ERC20 minimal ABI for balanceOf
      const minABI = [
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          type: "function",
        }
      ];
      
      const contract = await this.getContract(tokenAddress, minABI);
      const balance = await contract.balanceOf(walletAddress);
      return formatEther(balance);
    }, 30000); // 30 second cache for token balances
  }

  /**
   * Get transaction count with caching
   */
  async getTransactionCount(address: string): Promise<number> {
    const cacheKey = `tx-count-${address}`;
    
    return blockchainCache.getOrSet(cacheKey, async () => {
      if (!this.provider) {
        await this.initProvider();
      }
      
      return this.provider!.getTransactionCount(address);
    }, 15000); // 15 second cache
  }

  /**
   * Get gas price with caching
   */
  async getGasPrice(): Promise<string> {
    const cacheKey = 'gas-price';
    
    return blockchainCache.getOrSet(cacheKey, async () => {
      if (!this.provider) {
        await this.initProvider();
      }
      
      const gasPrice = await this.provider!.getGasPrice();
      return formatUnits(gasPrice, 'gwei');
    }, 60000); // 1 minute cache for gas price
  }

  /**
   * Get block with caching
   */
  async getBlock(blockHashOrBlockTag: string | number): Promise<any> {
    const cacheKey = `block-${blockHashOrBlockTag}`;
    
    return blockchainCache.getOrSet(cacheKey, async () => {
      if (!this.provider) {
        await this.initProvider();
      }
      
      return this.provider!.getBlock(blockHashOrBlockTag);
    }, 60000); // 1 minute cache for blocks
  }

  /**
   * Get latest block with short cache
   */
  async getLatestBlock(): Promise<any> {
    const cacheKey = 'latest-block';
    
    return blockchainCache.getOrSet(cacheKey, async () => {
      if (!this.provider) {
        await this.initProvider();
      }
      
      return this.provider!.getBlock('latest');
    }, 10000); // 10 second cache for latest block
  }

  /**
   * Add a call to the batch queue
   */
  async batchCall<T>(key: string, callFn: () => Promise<T>): Promise<T> {
    // If we already have this call in the batch, return a new promise
    if (this.batchedCalls.has(key)) {
      const existingCall = this.batchedCalls.get(key)!;
      return new Promise<T>((resolve, reject) => {
        existingCall.fn().then(resolve).catch(reject);
      });
    }
    
    // Create a new promise for this call
    return new Promise<T>((resolve, reject) => {
      // If there's no timeout set, create one
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.processBatch(), this.BATCH_DELAY);
      }
      
      // Add the call to the batch
      this.batchedCalls.set(key, {
        fn: callFn,
        resolve,
        reject
      });
    });
  }

  /**
   * Process all batched calls
   */
  private async processBatch(): Promise<void> {
    // Clear the timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    
    // If there are no calls, return
    if (this.batchedCalls.size === 0) {
      return;
    }
    
    // Get all calls
    const calls = Array.from(this.batchedCalls.entries());
    this.batchedCalls.clear();
    
    // Process each call
    for (const [key, call] of calls) {
      try {
        const result = await call.fn();
        call.resolve(result);
      } catch (error) {
        call.reject(error);
      }
    }
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    blockchainCache.clear();
  }
}

// Create and export a singleton instance
const optimizedWeb3Service = new OptimizedWeb3Service();
export default optimizedWeb3Service;
