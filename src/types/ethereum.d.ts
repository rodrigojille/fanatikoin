/**
 * Type declarations for Ethereum and Chiliz Chain providers
 * Used throughout the application for consistent TypeScript typings
 * Includes support for Web3Auth, Socios Wallet, and Chiliz Chain specific features
 */

interface RequestArguments {
  method: string;
  params?: any[];
}

/**
 * Chiliz Chain specific network information
 */
interface ChilizNetworkInfo {
  chainId: number;
  chainIdHex: string;
  name: string;
  rpcUrl: string;
  wsRpcUrl?: string;
  blockExplorerUrl: string;
  isTestnet: boolean;
}

/**
 * Chiliz Chain network configuration
 */
interface ChilizNetworkConfig {
  MAINNET: ChilizNetworkInfo;
  SPICY_TESTNET: ChilizNetworkInfo;
}

/**
 * Ethereum provider interface
 * Extended to support Chiliz Chain specific features
 */
interface EthereumProvider {
  isMetaMask?: boolean;
  isSocios?: boolean;
  isSociosWallet?: boolean;
  isWeb3Auth?: boolean;
  
  // Basic Methods
  request(args: RequestArguments): Promise<any>;
  
  // Event Methods
  on(eventName: string, listener: (...args: any[]) => void): void;
  removeListener(eventName: string, listener: (...args: any[]) => void): void;
  
  // Chain Data
  chainId?: string;
  networkVersion?: string;
  
  // Optional Helper Methods
  _metamask?: {
    isUnlocked: () => Promise<boolean>;
  };
  
  // Chiliz Chain specific methods
  isChilizChain?: () => Promise<boolean>;
  getChilizNetworkInfo?: () => Promise<ChilizNetworkInfo>;
}

/**
 * Fan Token specific interfaces
 */
interface FanTokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  owner: string;
  priceUsd?: number;
}

/**
 * Random number generation interfaces
 */
interface RandomNumberRequest {
  requestId: string;
  seed: string;
  blockNumber: number;
  timestamp: number;
}

interface RandomNumberResult {
  requestId: string;
  randomNumber: bigint;
  randomNumberAsFloat: number; // 0-1 range
  blockNumber: number;
  timestamp: number;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    socios?: EthereumProvider; // Socios Wallet provider
    chiliz?: {
      getNetworkInfo: () => ChilizNetworkInfo;
      isTestnet: () => boolean;
    };
  }
}
