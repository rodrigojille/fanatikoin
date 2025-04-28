/**
 * Chiliz Chain Network Configuration
 * Contains network information for both Mainnet and Spicy Testnet
 * Based on latest Chiliz documentation: https://docs.chiliz.com/develop/basics/connect-to-chiliz-chain
 */

/**
 * Chiliz Chain specific network information
 */
export interface ChilizNetworkInfo {
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
export interface ChilizNetworkConfig {
  MAINNET: ChilizNetworkInfo;
  SPICY_TESTNET: ChilizNetworkInfo;
}

/**
 * Chiliz Chain Network Configuration
 */
export const CHILIZ_NETWORKS: ChilizNetworkConfig = {
  MAINNET: {
    chainId: 88888,
    chainIdHex: '0x15b38',
    name: 'Chiliz Chain',
    rpcUrl: 'https://rpc.ankr.com/chiliz',
    wsRpcUrl: undefined, // No official WebSocket endpoint provided
    blockExplorerUrl: 'https://chiliscan.com',
    isTestnet: false
  },
  SPICY_TESTNET: {
    chainId: 88882,
    chainIdHex: '0x15b52',
    name: 'Chiliz Spicy Testnet',
    rpcUrl: 'https://spicy-rpc.chiliz.com/',
    wsRpcUrl: 'wss://spicy-rpc-ws.chiliz.com/',
    blockExplorerUrl: 'https://spicy.chiliscan.com',
    isTestnet: true
  }
};

/**
 * Get network configuration by chain ID
 * @param chainId The chain ID to look up
 * @returns The network configuration or undefined if not found
 */
export function getNetworkByChainId(chainId: number | string): ChilizNetworkInfo | undefined {
  const numericChainId = typeof chainId === 'string' ? parseInt(chainId) : chainId;
  
  if (numericChainId === CHILIZ_NETWORKS.MAINNET.chainId) {
    return CHILIZ_NETWORKS.MAINNET;
  } else if (numericChainId === CHILIZ_NETWORKS.SPICY_TESTNET.chainId) {
    return CHILIZ_NETWORKS.SPICY_TESTNET;
  }
  
  return undefined;
}

/**
 * Check if a chain ID is a Chiliz Chain network
 * @param chainId The chain ID to check
 * @returns True if the chain ID is a Chiliz Chain network
 */
export function isChilizChain(chainId: number | string): boolean {
  return getNetworkByChainId(chainId) !== undefined;
}

/**
 * Get the current network from environment variables
 * @returns The current network configuration
 */
export function getCurrentNetwork(): ChilizNetworkInfo {
  const envChainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  
  if (envChainId) {
    const chainId = parseInt(envChainId);
    const network = getNetworkByChainId(chainId);
    
    if (network) {
      return network;
    }
  }
  
  // Default to Spicy Testnet
  return CHILIZ_NETWORKS.SPICY_TESTNET;
}

/**
 * Add Chiliz Chain network to wallet
 * @param provider Ethereum provider
 * @param isTestnet Whether to add testnet or mainnet
 * @returns Promise that resolves when the network is added
 */
export async function addChilizChainToWallet(
  provider: any,
  isTestnet: boolean = true
): Promise<boolean> {
  try {
    const network = isTestnet ? CHILIZ_NETWORKS.SPICY_TESTNET : CHILIZ_NETWORKS.MAINNET;
    
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: network.chainIdHex,
        chainName: network.name,
        nativeCurrency: {
          name: 'Chiliz',
          symbol: 'CHZ',
          decimals: 18
        },
        rpcUrls: [network.rpcUrl],
        blockExplorerUrls: [network.blockExplorerUrl]
      }]
    });
    
    return true;
  } catch (error) {
    console.error('[Chiliz] Error adding network to wallet:', error);
    return false;
  }
}

/**
 * Switch to Chiliz Chain network
 * @param provider Ethereum provider
 * @param isTestnet Whether to switch to testnet or mainnet
 * @returns Promise that resolves when the network is switched
 */
export async function switchToChilizChain(
  provider: any,
  isTestnet: boolean = true
): Promise<boolean> {
  try {
    const network = isTestnet ? CHILIZ_NETWORKS.SPICY_TESTNET : CHILIZ_NETWORKS.MAINNET;
    
    try {
      // Try to switch to the network
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainIdHex }]
      });
      
      return true;
    } catch (switchError: any) {
      // If the chain hasn't been added to the wallet yet
      if (switchError.code === 4902) {
        return await addChilizChainToWallet(provider, isTestnet);
      }
      
      throw switchError;
    }
  } catch (error) {
    console.error('[Chiliz] Error switching to Chiliz Chain:', error);
    return false;
  }
}
