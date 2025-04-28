/**
 * Integration Testing Utility
 * Provides comprehensive testing for Chiliz Chain integrations
 */

import { ethers } from 'ethers';
import { CHILIZ_NETWORKS, getCurrentNetwork } from '@/config/chilizNetworks';
import { measureNetworkLatency } from './performanceMonitor';
import { ErrorType, createError, handleError } from './errorHandler';

// Test result interface
export interface TestResult {
  name: string;
  success: boolean;
  message: string;
  details?: any;
  timestamp: number;
}

// Test suite interface
export interface TestSuite {
  name: string;
  description: string;
  results: TestResult[];
  startTime: number;
  endTime: number | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

/**
 * Create a new test suite
 * @param name Test suite name
 * @param description Test suite description
 * @returns Test suite
 */
export function createTestSuite(name: string, description: string): TestSuite {
  return {
    name,
    description,
    results: [],
    startTime: Date.now(),
    endTime: null,
    status: 'pending'
  };
}

/**
 * Add a test result to a test suite
 * @param suite Test suite
 * @param result Test result
 * @returns Updated test suite
 */
export function addTestResult(suite: TestSuite, result: TestResult): TestSuite {
  return {
    ...suite,
    results: [...suite.results, result]
  };
}

/**
 * Complete a test suite
 * @param suite Test suite
 * @param status Test suite status
 * @returns Completed test suite
 */
export function completeTestSuite(suite: TestSuite, status: 'completed' | 'failed'): TestSuite {
  return {
    ...suite,
    endTime: Date.now(),
    status
  };
}

/**
 * Test network connectivity
 * @returns Test result
 */
export async function testNetworkConnectivity(): Promise<TestResult> {
  try {
    const network = getCurrentNetwork();
    const latency = await measureNetworkLatency(network.rpcUrl);
    
    if (latency === -1) {
      return {
        name: 'Network Connectivity',
        success: false,
        message: `Failed to connect to ${network.name} RPC at ${network.rpcUrl}`,
        timestamp: Date.now()
      };
    }
    
    return {
      name: 'Network Connectivity',
      success: true,
      message: `Successfully connected to ${network.name} with ${latency.toFixed(2)}ms latency`,
      details: { latency, network: network.name, rpcUrl: network.rpcUrl },
      timestamp: Date.now()
    };
  } catch (error) {
    const errorMessage = handleError(error);
    return {
      name: 'Network Connectivity',
      success: false,
      message: `Network connectivity test failed: ${errorMessage}`,
      details: { error },
      timestamp: Date.now()
    };
  }
}

/**
 * Test JSON-RPC methods
 * @returns Test result
 */
export async function testJsonRpcMethods(): Promise<TestResult> {
  try {
    const network = getCurrentNetwork();
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
    
    // Test basic RPC methods
    const blockNumber = await provider.getBlockNumber();
    const chainId = await provider.getNetwork().then(network => network.chainId);
    const gasPrice = await provider.getFeeData().then(data => data.gasPrice);
    
    return {
      name: 'JSON-RPC Methods',
      success: true,
      message: `Successfully tested JSON-RPC methods. Block: ${blockNumber}, Chain ID: ${chainId}`,
      details: { blockNumber, chainId, gasPrice: gasPrice?.toString() },
      timestamp: Date.now()
    };
  } catch (error) {
    const errorMessage = handleError(error);
    return {
      name: 'JSON-RPC Methods',
      success: false,
      message: `JSON-RPC methods test failed: ${errorMessage}`,
      details: { error },
      timestamp: Date.now()
    };
  }
}

/**
 * Test chain ID configuration
 * @returns Test result
 */
export async function testChainIdConfiguration(): Promise<TestResult> {
  try {
    const network = getCurrentNetwork();
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
    
    // Get chain ID from provider
    const chainIdFromProvider = await provider.getNetwork().then(network => network.chainId);
    
    // Compare with configured chain ID
    const configuredChainId = BigInt(network.chainId);
    
    if (chainIdFromProvider === configuredChainId) {
      return {
        name: 'Chain ID Configuration',
        success: true,
        message: `Chain ID configuration is correct: ${chainIdFromProvider}`,
        details: { 
          chainIdFromProvider: chainIdFromProvider.toString(), 
          configuredChainId: configuredChainId.toString() 
        },
        timestamp: Date.now()
      };
    } else {
      return {
        name: 'Chain ID Configuration',
        success: false,
        message: `Chain ID mismatch: Provider reports ${chainIdFromProvider}, configured as ${configuredChainId}`,
        details: { 
          chainIdFromProvider: chainIdFromProvider.toString(), 
          configuredChainId: configuredChainId.toString() 
        },
        timestamp: Date.now()
      };
    }
  } catch (error) {
    const errorMessage = handleError(error);
    return {
      name: 'Chain ID Configuration',
      success: false,
      message: `Chain ID configuration test failed: ${errorMessage}`,
      details: { error },
      timestamp: Date.now()
    };
  }
}

/**
 * Test Web3Auth configuration
 * @param web3AuthClientId Web3Auth client ID
 * @returns Test result
 */
export async function testWeb3AuthConfiguration(web3AuthClientId: string): Promise<TestResult> {
  try {
    if (!web3AuthClientId) {
      return {
        name: 'Web3Auth Configuration',
        success: false,
        message: 'Web3Auth client ID is not configured',
        timestamp: Date.now()
      };
    }
    
    // Validate client ID format (basic check)
    const isValidFormat = /^[a-zA-Z0-9_-]{10,}$/.test(web3AuthClientId);
    
    if (!isValidFormat) {
      return {
        name: 'Web3Auth Configuration',
        success: false,
        message: 'Web3Auth client ID format appears to be invalid',
        details: { clientId: web3AuthClientId },
        timestamp: Date.now()
      };
    }
    
    // We can't fully validate the client ID without making an actual Web3Auth request,
    // but we can check if it's properly formatted
    return {
      name: 'Web3Auth Configuration',
      success: true,
      message: 'Web3Auth client ID is configured and format appears valid',
      details: { clientId: web3AuthClientId },
      timestamp: Date.now()
    };
  } catch (error) {
    const errorMessage = handleError(error);
    return {
      name: 'Web3Auth Configuration',
      success: false,
      message: `Web3Auth configuration test failed: ${errorMessage}`,
      details: { error },
      timestamp: Date.now()
    };
  }
}

/**
 * Test Socios Wallet detection
 * @returns Test result
 */
export function testSociosWalletDetection(): TestResult {
  try {
    // Check for Socios Wallet in window.ethereum
    const isSociosWallet = 
      typeof window !== 'undefined' && 
      window.ethereum && 
      (window.ethereum.isSocios || window.ethereum.isSociosWallet);
    
    // Check for window.socios
    const hasSociosObject = typeof window !== 'undefined' && window.socios;
    
    if (isSociosWallet || hasSociosObject) {
      return {
        name: 'Socios Wallet Detection',
        success: true,
        message: 'Socios Wallet detected',
        details: { 
          isSociosWallet, 
          hasSociosObject,
          detectionMethod: isSociosWallet ? 'window.ethereum' : 'window.socios'
        },
        timestamp: Date.now()
      };
    } else {
      return {
        name: 'Socios Wallet Detection',
        success: false,
        message: 'Socios Wallet not detected',
        details: { isSociosWallet, hasSociosObject },
        timestamp: Date.now()
      };
    }
  } catch (error) {
    const errorMessage = handleError(error);
    return {
      name: 'Socios Wallet Detection',
      success: false,
      message: `Socios Wallet detection test failed: ${errorMessage}`,
      details: { error },
      timestamp: Date.now()
    };
  }
}

/**
 * Test Biconomy configuration
 * @param biconomyApiKey Biconomy API key
 * @returns Test result
 */
export function testBiconomyConfiguration(biconomyApiKey: string): TestResult {
  try {
    if (!biconomyApiKey) {
      return {
        name: 'Biconomy Configuration',
        success: false,
        message: 'Biconomy API key is not configured',
        timestamp: Date.now()
      };
    }
    
    // Validate API key format (basic check)
    const isValidFormat = /^[a-zA-Z0-9_-]{10,}$/.test(biconomyApiKey);
    
    if (!isValidFormat) {
      return {
        name: 'Biconomy Configuration',
        success: false,
        message: 'Biconomy API key format appears to be invalid',
        details: { apiKey: biconomyApiKey },
        timestamp: Date.now()
      };
    }
    
    return {
      name: 'Biconomy Configuration',
      success: true,
      message: 'Biconomy API key is configured and format appears valid',
      details: { apiKey: biconomyApiKey },
      timestamp: Date.now()
    };
  } catch (error) {
    const errorMessage = handleError(error);
    return {
      name: 'Biconomy Configuration',
      success: false,
      message: `Biconomy configuration test failed: ${errorMessage}`,
      details: { error },
      timestamp: Date.now()
    };
  }
}

/**
 * Test smart contract addresses
 * @param contractAddresses Contract addresses to test
 * @returns Test result
 */
export async function testSmartContractAddresses(
  contractAddresses: Record<string, string>
): Promise<TestResult> {
  try {
    const network = getCurrentNetwork();
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
    const results: Record<string, { valid: boolean; code: string | null }> = {};
    
    // Check each contract address
    for (const [name, address] of Object.entries(contractAddresses)) {
      if (!address || address === '[Pending Deployment]') {
        results[name] = { valid: false, code: null };
        continue;
      }
      
      try {
        // Check if address is valid format
        ethers.getAddress(address); // Will throw if invalid
        
        // Check if there's code at the address
        const code = await provider.getCode(address);
        results[name] = { 
          valid: code !== '0x', 
          code: code === '0x' ? null : code.slice(0, 10) + '...' 
        };
      } catch (error) {
        results[name] = { valid: false, code: null };
      }
    }
    
    // Check if all contracts are valid
    const allValid = Object.values(results).every(result => result.valid);
    
    if (allValid) {
      return {
        name: 'Smart Contract Addresses',
        success: true,
        message: 'All smart contract addresses are valid',
        details: { results },
        timestamp: Date.now()
      };
    } else {
      const invalidContracts = Object.entries(results)
        .filter(([_, result]) => !result.valid)
        .map(([name]) => name);
      
      return {
        name: 'Smart Contract Addresses',
        success: false,
        message: `Invalid smart contract addresses: ${invalidContracts.join(', ')}`,
        details: { results, invalidContracts },
        timestamp: Date.now()
      };
    }
  } catch (error) {
    const errorMessage = handleError(error);
    return {
      name: 'Smart Contract Addresses',
      success: false,
      message: `Smart contract addresses test failed: ${errorMessage}`,
      details: { error },
      timestamp: Date.now()
    };
  }
}

/**
 * Run all integration tests
 * @returns Test suite with results
 */
export async function runAllTests(): Promise<TestSuite> {
  // Create test suite
  let suite = createTestSuite(
    'Chiliz Chain Integration Tests',
    'Comprehensive tests for Chiliz Chain integration'
  );
  
  // Update status
  suite = { ...suite, status: 'running' };
  
  try {
    // Test network connectivity
    const networkResult = await testNetworkConnectivity();
    suite = addTestResult(suite, networkResult);
    
    // If network connectivity fails, skip other tests
    if (!networkResult.success) {
      return completeTestSuite(suite, 'failed');
    }
    
    // Test JSON-RPC methods
    const rpcResult = await testJsonRpcMethods();
    suite = addTestResult(suite, rpcResult);
    
    // Test chain ID configuration
    const chainIdResult = await testChainIdConfiguration();
    suite = addTestResult(suite, chainIdResult);
    
    // Test Web3Auth configuration
    const web3AuthClientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || '';
    const web3AuthResult = await testWeb3AuthConfiguration(web3AuthClientId);
    suite = addTestResult(suite, web3AuthResult);
    
    // Test Socios Wallet detection
    const sociosWalletResult = testSociosWalletDetection();
    suite = addTestResult(suite, sociosWalletResult);
    
    // Test Biconomy configuration
    const biconomyApiKey = process.env.NEXT_PUBLIC_BICONOMY_API_KEY || '';
    const biconomyResult = testBiconomyConfiguration(biconomyApiKey);
    suite = addTestResult(suite, biconomyResult);
    
    // Test smart contract addresses
    const contractAddresses = {
      TeamTokenFactory: '0xD84420a763Fd7Af933fe516Ef6ceE44fCA1E9b49',
      ChilizToken: '0x0000000000000000000000000000000000001010',
      TokenMarketplace: '[Pending Deployment]',
      TokenAuction: '[Pending Deployment]'
    };
    const contractResult = await testSmartContractAddresses(contractAddresses);
    suite = addTestResult(suite, contractResult);
    
    // Check if all tests passed
    const allPassed = suite.results.every(result => result.success);
    
    return completeTestSuite(suite, allPassed ? 'completed' : 'failed');
  } catch (error) {
    // Add error as a test result
    const errorMessage = handleError(error);
    const errorResult: TestResult = {
      name: 'Unexpected Error',
      success: false,
      message: `Test suite failed with error: ${errorMessage}`,
      details: { error },
      timestamp: Date.now()
    };
    
    suite = addTestResult(suite, errorResult);
    
    return completeTestSuite(suite, 'failed');
  }
}
