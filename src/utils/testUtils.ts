/**
 * Test Utilities
 * Functions for testing and verifying integrations
 */

import { getCurrentNetwork } from '@/config/chilizNetworks';
import { handleWeb3Error } from './web3ErrorHandler';

/**
 * Test Web3Auth configuration
 * @returns Test results with success status and messages
 */
export async function testWeb3AuthConfig(): Promise<{
  success: boolean;
  messages: string[];
  details?: any;
}> {
  try {
    const messages: string[] = [];
    let success = true;
    const details: any = {};
    
    // Check environment variables
    const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
    if (!clientId) {
      messages.push('❌ Web3Auth client ID is missing');
      success = false;
    } else {
      messages.push('✅ Web3Auth client ID is configured');
      details.clientId = `${clientId.substring(0, 10)}...`;
    }
    
    // Check network configuration
    const network = getCurrentNetwork();
    details.network = network;
    
    if (network.chainId !== 88882) {
      messages.push(`⚠️ Warning: Chain ID ${network.chainId} is not the latest Chiliz Spicy Testnet (88882)`);
      success = false;
    } else {
      messages.push('✅ Chiliz Spicy Testnet Chain ID is correct (88882)');
    }
    
    if (!network.rpcUrl.includes('chiliz.com') && !network.rpcUrl.includes('ankr.com')) {
      messages.push(`⚠️ Warning: RPC URL ${network.rpcUrl} may not be a valid Chiliz endpoint`);
      success = false;
    } else {
      messages.push(`✅ RPC URL is valid: ${network.rpcUrl}`);
    }
    
    return {
      success,
      messages,
      details
    };
  } catch (error) {
    return {
      success: false,
      messages: [`❌ Error testing Web3Auth config: ${handleWeb3Error(error)}`]
    };
  }
}

/**
 * Test Socios Wallet detection
 * @returns Test results with success status and messages
 */
export function testSociosWalletDetection(): {
  available: boolean;
  messages: string[];
} {
  try {
    const messages: string[] = [];
    let available = false;
    
    // Check if window is defined (browser environment)
    if (typeof window === 'undefined') {
      messages.push('⚠️ Not running in browser environment, cannot detect Socios Wallet');
      return { available, messages };
    }
    
    // Check for Socios Wallet provider
    if (window.ethereum?.isSocios === true || window.ethereum?.isSociosWallet === true) {
      messages.push('✅ Socios Wallet detected via window.ethereum');
      available = true;
    } else if (window.socios !== undefined) {
      messages.push('✅ Socios Wallet detected via window.socios');
      available = true;
    } else {
      messages.push('❌ Socios Wallet not detected');
    }
    
    return {
      available,
      messages
    };
  } catch (error) {
    return {
      available: false,
      messages: [`❌ Error detecting Socios Wallet: ${error}`]
    };
  }
}

/**
 * Test network connectivity
 * @param rpcUrl RPC URL to test
 * @returns Test results with success status and messages
 */
export async function testNetworkConnectivity(
  rpcUrl: string = getCurrentNetwork().rpcUrl
): Promise<{
  success: boolean;
  messages: string[];
  latency?: number;
}> {
  try {
    const messages: string[] = [];
    const startTime = Date.now();
    
    // Make a simple JSON-RPC request to check connectivity
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });
    
    const latency = Date.now() - startTime;
    
    if (!response.ok) {
      messages.push(`❌ Failed to connect to ${rpcUrl}: ${response.statusText}`);
      return {
        success: false,
        messages,
        latency
      };
    }
    
    const data = await response.json();
    
    if (data.error) {
      messages.push(`❌ RPC error: ${data.error.message}`);
      return {
        success: false,
        messages,
        latency
      };
    }
    
    const blockNumber = parseInt(data.result, 16);
    messages.push(`✅ Connected to ${rpcUrl} successfully`);
    messages.push(`✅ Current block number: ${blockNumber}`);
    messages.push(`✅ Latency: ${latency}ms`);
    
    // Warn if latency is high
    if (latency > 1000) {
      messages.push(`⚠️ Warning: High latency (${latency}ms)`);
    }
    
    return {
      success: true,
      messages,
      latency
    };
  } catch (error) {
    return {
      success: false,
      messages: [`❌ Error testing network connectivity: ${error}`]
    };
  }
}

/**
 * Run all tests
 * @returns Combined test results
 */
export async function runAllTests(): Promise<{
  web3Auth: Awaited<ReturnType<typeof testWeb3AuthConfig>>;
  sociosWallet: ReturnType<typeof testSociosWalletDetection>;
  network: Awaited<ReturnType<typeof testNetworkConnectivity>>;
}> {
  const web3Auth = await testWeb3AuthConfig();
  const sociosWallet = testSociosWalletDetection();
  const network = await testNetworkConnectivity();
  
  return {
    web3Auth,
    sociosWallet,
    network
  };
}
