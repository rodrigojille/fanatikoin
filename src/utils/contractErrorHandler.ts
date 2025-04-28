import { ethers } from 'ethers';

export enum ContractErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONTRACT_NOT_DEPLOYED = 'CONTRACT_NOT_DEPLOYED',
  FUNCTION_NOT_FOUND = 'FUNCTION_NOT_FOUND',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  USER_REJECTED = 'USER_REJECTED',
  WRONG_NETWORK = 'WRONG_NETWORK',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ContractError {
  type: ContractErrorType;
  message: string;
  originalError?: any;
}

/**
 * Handles contract interaction errors and categorizes them
 * @param error The original error
 * @param context Optional context message
 * @returns Structured contract error
 */
export function handleContractError(error: any, context?: string): ContractError {
  const contextPrefix = context ? `${context}: ` : '';
  
  // Check for user rejected transaction
  if (
    error.code === 4001 || // MetaMask user rejected
    error.code === 'ACTION_REJECTED' ||
    (error.message && error.message.includes('user rejected'))
  ) {
    return {
      type: ContractErrorType.USER_REJECTED,
      message: `${contextPrefix}Transaction was rejected by the user`,
      originalError: error
    };
  }
  
  // Check for wrong network
  if (
    error.code === 'NETWORK_ERROR' ||
    (error.message && error.message.includes('network') && error.message.includes('mismatch'))
  ) {
    return {
      type: ContractErrorType.WRONG_NETWORK,
      message: `${contextPrefix}Please connect to the Chiliz Spicy Testnet (Chain ID: 1001)`,
      originalError: error
    };
  }
  
  // Check for insufficient funds
  if (
    error.code === 'INSUFFICIENT_FUNDS' ||
    (error.message && error.message.includes('insufficient funds'))
  ) {
    return {
      type: ContractErrorType.INSUFFICIENT_FUNDS,
      message: `${contextPrefix}Insufficient funds for transaction`,
      originalError: error
    };
  }
  
  // Check for contract not deployed
  if (
    error.code === 'CALL_EXCEPTION' ||
    (error.message && error.message.includes('call revert exception'))
  ) {
    return {
      type: ContractErrorType.CONTRACT_NOT_DEPLOYED,
      message: `${contextPrefix}Contract may not be deployed at the specified address`,
      originalError: error
    };
  }
  
  // Check for function not found
  if (error.message && error.message.includes('no method named')) {
    return {
      type: ContractErrorType.FUNCTION_NOT_FOUND,
      message: `${contextPrefix}Contract function does not exist or ABI mismatch`,
      originalError: error
    };
  }
  
  // Check for network error
  if (error.message && (
    error.message.includes('failed to fetch') ||
    error.message.includes('network error') ||
    error.message.includes('connection refused')
  )) {
    return {
      type: ContractErrorType.NETWORK_ERROR,
      message: `${contextPrefix}Network connection error. Please check your internet connection`,
      originalError: error
    };
  }
  
  // Default unknown error
  return {
    type: ContractErrorType.UNKNOWN_ERROR,
    message: `${contextPrefix}${error.message || 'Unknown contract error'}`,
    originalError: error
  };
}

/**
 * Checks if the provider is connected to the correct network
 * @param provider Ethers provider
 * @param expectedChainId Expected chain ID
 * @returns Promise resolving to boolean
 */
export async function isCorrectNetwork(
  provider: ethers.Provider,
  expectedChainId: number
): Promise<boolean> {
  try {
    const network = await provider.getNetwork();
    return network.chainId === BigInt(expectedChainId);
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
}

/**
 * Checks if a contract exists at the specified address
 * @param provider Ethers provider
 * @param contractAddress Contract address to check
 * @returns Promise resolving to boolean
 */
export async function contractExists(
  provider: ethers.Provider,
  contractAddress: string
): Promise<boolean> {
  try {
    const code = await provider.getCode(contractAddress);
    // If there's no code at the address, it's not a contract
    return code !== '0x';
  } catch (error) {
    console.error('Error checking contract existence:', error);
    return false;
  }
}
