/**
 * Socios Wallet Integration Utility
 * Based on Chiliz documentation: https://docs.chiliz.com/develop/advanced/how-to-integrate-socios-wallet-in-your-dapp
 */

// Check if Socios Wallet is available
export function isSociosWalletAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Socios Wallet provider
  return window.ethereum?.isSocios === true || 
         window.ethereum?.isSociosWallet === true || 
         window.socios !== undefined;
}

// Get the Socios Wallet provider
export function getSociosProvider(): any {
  if (!isSociosWalletAvailable()) {
    throw new Error('Socios Wallet is not available');
  }
  
  return window.ethereum || window.socios;
}

// Connect to Socios Wallet
export async function connectSociosWallet(): Promise<string[]> {
  try {
    if (!isSociosWalletAvailable()) {
      throw new Error('Socios Wallet is not available. Please install the Socios app.');
    }
    
    const provider = getSociosProvider();
    
    // Request accounts
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found in Socios Wallet');
    }
    
    console.log('[Socios] Connected to Socios Wallet:', accounts[0]);
    return accounts;
  } catch (error) {
    console.error('[Socios] Error connecting to Socios Wallet:', error);
    throw error;
  }
}

// Check if connected to Chiliz Chain
export async function isConnectedToChilizChain(): Promise<boolean> {
  try {
    if (!isSociosWalletAvailable()) {
      return false;
    }
    
    const provider = getSociosProvider();
    
    // Get chain ID
    const chainIdHex = await provider.request({ method: 'eth_chainId' });
    const chainId = parseInt(chainIdHex, 16);
    
    // Chiliz Chain IDs
    const CHILIZ_MAINNET_CHAIN_ID = 88888;
    const CHILIZ_SPICY_TESTNET_CHAIN_ID = 1001;
    
    return chainId === CHILIZ_MAINNET_CHAIN_ID || chainId === CHILIZ_SPICY_TESTNET_CHAIN_ID;
  } catch (error) {
    console.error('[Socios] Error checking chain:', error);
    return false;
  }
}

// Switch to Chiliz Chain
export async function switchToChilizChain(useTestnet = true): Promise<boolean> {
  try {
    if (!isSociosWalletAvailable()) {
      throw new Error('Socios Wallet is not available');
    }
    
    const provider = getSociosProvider();
    
    // Chain IDs
    const CHILIZ_MAINNET_CHAIN_ID = 88888;
    const CHILIZ_SPICY_TESTNET_CHAIN_ID = 1001;
    
    const targetChainId = useTestnet ? CHILIZ_SPICY_TESTNET_CHAIN_ID : CHILIZ_MAINNET_CHAIN_ID;
    const chainIdHex = `0x${targetChainId.toString(16)}`;
    
    try {
      // Try to switch to the Chiliz Chain
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }]
      });
      
      return true;
    } catch (switchError: any) {
      // If the chain hasn't been added to the wallet yet
      if (switchError.code === 4902) {
        // Add the Chiliz Chain to the wallet
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainIdHex,
            chainName: useTestnet ? 'Chiliz Spicy Testnet' : 'Chiliz Chain',
            nativeCurrency: {
              name: 'Chiliz',
              symbol: 'CHZ',
              decimals: 18
            },
            rpcUrls: useTestnet 
              ? ['https://spicy-rpc.chiliz.com/'] 
              : ['https://rpc.ankr.com/chiliz'],
            blockExplorerUrls: useTestnet 
              ? ['https://spicy.chiliscan.com/'] 
              : ['https://chiliscan.com/']
          }]
        });
        
        return true;
      }
      
      throw switchError;
    }
  } catch (error) {
    console.error('[Socios] Error switching to Chiliz Chain:', error);
    throw error;
  }
}

// Get Fan Token balance
export async function getFanTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
  try {
    if (!isSociosWalletAvailable()) {
      throw new Error('Socios Wallet is not available');
    }
    
    const provider = getSociosProvider();
    
    // ERC20 balanceOf function signature
    const data = `0x70a08231000000000000000000000000${userAddress.slice(2).padStart(64, '0')}`;
    
    // Call the balanceOf function
    const result = await provider.request({
      method: 'eth_call',
      params: [{
        to: tokenAddress,
        data
      }, 'latest']
    });
    
    // Parse the result
    const balance = parseInt(result, 16);
    
    // Convert to decimal with 18 decimals
    return (balance / 10**18).toString();
  } catch (error) {
    console.error('[Socios] Error getting token balance:', error);
    throw error;
  }
}

// Add Fan Token to Socios Wallet
export async function addFanTokenToWallet(
  tokenAddress: string, 
  tokenSymbol: string, 
  tokenDecimals = 18, 
  tokenImage?: string
): Promise<boolean> {
  try {
    if (!isSociosWalletAvailable()) {
      throw new Error('Socios Wallet is not available');
    }
    
    const provider = getSociosProvider();
    
    // Request to add the token
    await provider.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          image: tokenImage
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error('[Socios] Error adding token to wallet:', error);
    throw error;
  }
}

// Define global window interface with Socios properties
declare global {
  interface Window {
    ethereum?: any;
    socios?: any;
  }
}
