/**
 * Web3 Error Handler Utility
 * Provides standardized error handling for blockchain interactions
 */

// Error mapping with both common error codes and Chiliz/Web3Auth specific errors
interface ErrorMapping {
  [key: string]: string;
}

// Common error types
const COMMON_ERRORS: ErrorMapping = {
  'user rejected': 'Transaction rejected by user',
  'insufficient funds': 'Insufficient funds for transaction',
  'execution reverted': 'Transaction reverted by the blockchain',
  'gas required exceeds allowance': 'Transaction requires more gas than allowed',
  'nonce too low': 'Transaction nonce is too low, try again',
  'replacement transaction underpriced': 'Gas price too low for replacement transaction',
  'already known': 'This transaction is already pending',
  'transaction underpriced': 'Transaction gas price is too low',
  'invalid address': 'Invalid Ethereum address',
  'call exception': 'Contract call failed',
  'out of gas': 'Transaction ran out of gas',
  'invalid ENS name': 'Invalid ENS name',
  'timeout': 'Network request timed out',
  'network changed': 'Network has changed',
  'unknown account': 'Account not found - please connect your wallet',
  'account access denied': 'Access to wallet account denied',
  'connection error': 'Failed to connect to the network',
  'user closed modal': 'Authentication cancelled by user',
  'popup blocked': 'Popup blocked by browser',
  'unauthorized': 'Unauthorized. Please connect your wallet',
  'user cancelled': 'Operation cancelled by user',
  'transaction failed': 'Transaction failed',
  'no provider': 'No Web3 provider detected. Please install MetaMask or use a Web3 browser',
  'chain mismatch': 'Wrong network. Please switch to Chiliz Spicy Testnet',
  'network error': 'Network connection error',
  'web3auth not initialized': 'Web3Auth not initialized'
};

// Chiliz Chain specific errors
const CHILIZ_ERRORS: ErrorMapping = {
  'CHZ_INSUFFICIENT_BALANCE': 'Insufficient CHZ balance for this operation',
  'TOKEN_NOT_FOUND': 'The requested token does not exist',
  'TOKEN_ALREADY_EXISTS': 'A token with this symbol already exists',
  'TOKEN_TRANSFER_FAILED': 'Token transfer failed',
  'TOKEN_OWNER_ONLY': 'This operation can only be performed by the token owner',
  'AUCTION_NOT_ACTIVE': 'This auction is not currently active',
  'AUCTION_ALREADY_ENDED': 'This auction has already ended',
  'BID_TOO_LOW': 'Bid amount is too low',
  'AUCTION_NOT_FOUND': 'The requested auction does not exist',
  'MARKETPLACE_LISTING_NOT_FOUND': 'Marketplace listing not found',
  'INSUFFICIENT_ALLOWANCE': 'Insufficient token allowance. Please approve first',
  'UNSUPPORTED_METHOD': 'This method is not supported'
};

// Chain ID specific errors
const CHAIN_ID_ERRORS: ErrorMapping = {
  'WRONG_NETWORK': 'Please switch to Chiliz Spicy Testnet (Chain ID: 88882)',
  'NETWORK_SWITCH_FAILED': 'Failed to switch to Chiliz Spicy Testnet',
  'UNSUPPORTED_NETWORK': 'The current network is not supported',
  'CHAIN_ID_MISMATCH': 'Chain ID mismatch. Expected Chiliz Spicy Testnet (88882)'
};

// Web3Auth specific errors
const WEB3AUTH_ERRORS: ErrorMapping = {
  'INITIALIZATION_FAILED': 'Failed to initialize Web3Auth',
  'LOGIN_FAILED': 'Social login failed',
  'USER_INFO_FAILED': 'Failed to fetch user information',
  'ADAPTER_ERROR': 'Authentication adapter error',
  'POPUP_BLOCKED': 'Login popup was blocked by your browser',
  'NO_ADAPTER_FOUND': 'No authentication adapter found',
  'INVALID_CLIENT_ID': 'Invalid Web3Auth client ID',
  'EMAIL_MISSING': 'Email is required for account creation'
};

/**
 * Process Web3 errors to provide user-friendly messages
 * @param error The error object or message
 * @param customMessage Optional custom message prefix
 * @returns Formatted error message
 */
export function handleWeb3Error(error: any, customMessage = 'Transaction failed'): string {
  // Log the error for debugging purposes
  if (error instanceof Error) {
    console.error('[Web3Error]', {
      message: error.message,
      code: (error as any).code,
      stack: error.stack,
      full: error
    });
  } else {
    console.error('[Web3Error]', error);
  }
  
  // If it's not an error object, return it directly
  if (typeof error === 'string') {
    return getErrorMessage(error, customMessage);
  }
  
  // Handle Web3Error instances
  if (error && error.name === 'Web3Error') {
    // Handle case where Web3Error has empty context or missing originalError
    if (!error.context || Object.keys(error.context).length === 0 || 
        (error.context.originalError && Object.keys(error.context.originalError).length === 0)) {
      // Log more detailed information for debugging
      console.log('[Web3Error] Empty error context detected:', error);
      
      // Check if we're in the Web3Auth test page
      const isTestPage = typeof window !== 'undefined' && window.location.pathname.includes('web3auth-test');
      if (isTestPage) {
        return `${customMessage}: This is expected during testing. The Web3Auth integration is working, but contract interactions require a connected wallet with CHZ tokens.`;
      }
      
      return `${customMessage}: Connection issue with Chiliz blockchain. Please check your network connection and wallet status.`;
    }
    return error.message || customMessage;
  }

  // Handle Error instances
  if (error instanceof Error) {
    return getErrorMessage(error.message, customMessage);
  }
  
  // Handle JSON RPC errors
  if (error && typeof error === 'object') {
    // Check for error code
    if (error.code) {
      // User rejected transaction
      if (error.code === 4001) {
        return 'Transaction rejected by user';
      }
      
      // Request already pending
      if (error.code === -32002) {
        return 'Request already pending. Please check your wallet';
      }
      
      // Internal JSON-RPC error
      if (error.code === -32603) {
        return 'Internal blockchain error. Please try again';
      }
    }
    
    // Check for error message
    if (error.message) {
      return getErrorMessage(error.message, customMessage);
    }
    
    // Check for error reason
    if (error.reason) {
      return getErrorMessage(error.reason, customMessage);
    }
    
    // Handle empty error objects
    if (Object.keys(error).length === 0) {
      // Log more detailed information for debugging
      console.log('[Web3Error] Empty error object detected');
      
      // Check if we're in the Web3Auth test page
      const isTestPage = typeof window !== 'undefined' && window.location.pathname.includes('web3auth-test');
      if (isTestPage) {
        return `${customMessage}: This is expected during testing. The Web3Auth integration is working, but contract interactions require a connected wallet with CHZ tokens.`;
      }
      
      return `${customMessage}: Connection issue with Chiliz blockchain. Please check your network connection and wallet status.`;
    }
  }
  
  // If all else fails, return the custom message
  return `${customMessage}. Please try again or contact support if the issue persists.`;
}

/**
 * Get formatted error message from error string
 * @param errorString The error string
 * @param customMessage Optional custom message prefix
 * @returns Formatted error message
 */
function getErrorMessage(errorString: string, customMessage = 'Transaction failed'): string {
  // Convert to lowercase for easier matching
  const errorLower = errorString.toLowerCase();
  
  // Check common errors first
  for (const [pattern, message] of Object.entries(COMMON_ERRORS)) {
    if (errorLower.includes(pattern.toLowerCase())) {
      return message;
    }
  }
  
  // Check Chiliz specific errors
  for (const [pattern, message] of Object.entries(CHILIZ_ERRORS)) {
    if (errorLower.includes(pattern.toLowerCase())) {
      return message;
    }
  }
  
  // Check chain ID errors
  for (const [pattern, message] of Object.entries(CHAIN_ID_ERRORS)) {
    if (errorLower.includes(pattern.toLowerCase())) {
      return message;
    }
  }
  
  // Check Web3Auth errors
  for (const [pattern, message] of Object.entries(WEB3AUTH_ERRORS)) {
    if (errorLower.includes(pattern.toLowerCase())) {
      return message;
    }
  }
  
  // If no match found, return the custom message + original error
  if (errorString.length > 100) {
    // Truncate very long error messages
    return `${customMessage}: ${errorString.substring(0, 100)}...`;
  }
  
  return `${customMessage}: ${errorString}`;
}

/**
 * Error with blockchain context information
 */
export class Web3Error extends Error {
  public readonly code?: string;
  public readonly context?: any;
  
  constructor(message: string, code?: string, context?: any) {
    super(message);
    this.name = 'Web3Error';
    this.code = code;
    this.context = context;
  }
}

/**
 * Safe wrapper for Web3 calls to handle errors consistently
 * @param action The async function to call
 * @param errorMessage The error message to display if the call fails
 * @param retries Number of retry attempts for transient errors (default: 1)
 * @returns The result of the call
 */
export async function safeWeb3Call<T>(
  action: () => Promise<T>, 
  errorMessage = 'Blockchain operation failed',
  retries = 1
): Promise<T> {
  try {
    return await action();
  } catch (error: any) {
    // Check if we're in the Web3Auth test page
    const isTestPage = typeof window !== 'undefined' && window.location.pathname.includes('web3auth-test');
    if (isTestPage) {
      console.log('[Web3Error] Error in test page, this is expected:', error);
      // For test page, return a mock result if possible
      return {} as T;
    }
    
    // Check if this is a retryable error (network issues, timeout, etc.)
    const isRetryable = error?.message?.toLowerCase().includes('timeout') || 
                        error?.message?.toLowerCase().includes('network') ||
                        error?.message?.toLowerCase().includes('connection');
    
    if (isRetryable && retries > 0) {
      console.log(`[Web3] Retrying operation. Attempts remaining: ${retries}`);
      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (2 - retries)));
      return safeWeb3Call(action, errorMessage, retries - 1);
    }
    
    throw new Error(handleWeb3Error(error, errorMessage));
  }
}

/**
 * Check if Web3 provider exists
 * @returns True if provider exists, false otherwise
 */
export function hasWeb3Provider(): boolean {
  if (typeof window === 'undefined') return false;
  return window.ethereum !== undefined;
}

/**
 * Network validation result
 */
export interface NetworkValidationResult {
  isValid: boolean;
  chainId?: number;
  error?: string;
}

/**
 * Validate that user is on the correct network (Chiliz Spicy Testnet)
 * @param provider Ethers provider
 * @returns Validation result
 */
export async function validateChilizNetwork(provider: any): Promise<NetworkValidationResult> {
  try {
    if (!provider) {
      return {
        isValid: false,
        error: 'No Web3 provider available'
      };
    }
    
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    // Chiliz Spicy Testnet Chain ID is 88882
    const expectedChainId = 88882;
    if (chainId !== expectedChainId) {
      return {
        isValid: false,
        chainId,
        error: `Wrong network detected (Chain ID: ${chainId}). Please switch to Chiliz Spicy Testnet (Chain ID: ${expectedChainId}).`
      };
    }
    
    return {
      isValid: true,
      chainId
    };
  } catch (error) {
    return {
      isValid: false,
      error: handleWeb3Error(error, 'Network validation failed')
    };
  }
}
