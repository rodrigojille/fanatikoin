// Integration Test Runner Script
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

console.log(`${colors.bright}${colors.blue}=== FANATIKOIN INTEGRATION TESTS ===${colors.reset}\n`);
console.log(`${colors.cyan}Running tests for Chiliz Chain integration...${colors.reset}\n`);

// Check if the environment file exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log(`${colors.red}Error: .env.local file not found.${colors.reset}`);
  console.log(`Please create a .env.local file with the following variables:
  - NEXT_PUBLIC_CHAIN_ID
  - NEXT_PUBLIC_RPC_URL
  - NEXT_PUBLIC_WEB3AUTH_CLIENT_ID`);
  process.exit(1);
}

// Read environment variables
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

// Check required environment variables
const requiredVars = [
  'NEXT_PUBLIC_CHAIN_ID',
  'NEXT_PUBLIC_RPC_URL',
  'NEXT_PUBLIC_WEB3AUTH_CLIENT_ID'
];

const missingVars = requiredVars.filter(v => !envVars[v]);
if (missingVars.length > 0) {
  console.log(`${colors.red}Error: Missing required environment variables:${colors.reset}`);
  missingVars.forEach(v => console.log(`  - ${v}`));
  process.exit(1);
}

console.log(`${colors.green}✓ Environment variables verified${colors.reset}`);

// Test network connectivity
console.log(`\n${colors.cyan}Testing network connectivity...${colors.reset}`);

async function testRpcConnection(rpcUrl) {
  try {
    const startTime = Date.now();
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });
    
    const data = await response.json();
    const latency = Date.now() - startTime;
    
    if (data.result) {
      const blockNumber = parseInt(data.result, 16);
      console.log(`${colors.green}✓ Connected to RPC: ${rpcUrl}${colors.reset}`);
      console.log(`  - Current block: ${blockNumber}`);
      console.log(`  - Latency: ${latency}ms`);
      return { success: true, blockNumber, latency };
    } else {
      console.log(`${colors.red}✗ Failed to get block number from RPC: ${rpcUrl}${colors.reset}`);
      console.log(`  - Response: ${JSON.stringify(data)}`);
      return { success: false };
    }
  } catch (error) {
    console.log(`${colors.red}✗ Failed to connect to RPC: ${rpcUrl}${colors.reset}`);
    console.log(`  - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test chain ID configuration
async function testChainId(rpcUrl, configuredChainId) {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1
      })
    });
    
    const data = await response.json();
    
    if (data.result) {
      const chainIdFromRpc = parseInt(data.result, 16);
      const configChainIdInt = parseInt(configuredChainId);
      
      if (chainIdFromRpc === configChainIdInt) {
        console.log(`${colors.green}✓ Chain ID configuration is correct: ${chainIdFromRpc}${colors.reset}`);
        return { success: true, chainId: chainIdFromRpc };
      } else {
        console.log(`${colors.red}✗ Chain ID mismatch:${colors.reset}`);
        console.log(`  - RPC reports: ${chainIdFromRpc}`);
        console.log(`  - Configured as: ${configChainIdInt}`);
        return { success: false, rpcChainId: chainIdFromRpc, configuredChainId: configChainIdInt };
      }
    } else {
      console.log(`${colors.red}✗ Failed to get chain ID from RPC${colors.reset}`);
      console.log(`  - Response: ${JSON.stringify(data)}`);
      return { success: false };
    }
  } catch (error) {
    console.log(`${colors.red}✗ Failed to test chain ID:${colors.reset}`);
    console.log(`  - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test Web3Auth configuration
function testWeb3AuthConfig(clientId) {
  console.log(`\n${colors.cyan}Testing Web3Auth configuration...${colors.reset}`);
  
  if (!clientId) {
    console.log(`${colors.red}✗ Web3Auth client ID is not configured${colors.reset}`);
    return { success: false };
  }
  
  // Basic validation of client ID format
  const isValidFormat = /^[a-zA-Z0-9_-]{10,}$/.test(clientId);
  
  if (isValidFormat) {
    console.log(`${colors.green}✓ Web3Auth client ID is configured and format appears valid${colors.reset}`);
    return { success: true };
  } else {
    console.log(`${colors.red}✗ Web3Auth client ID format appears to be invalid${colors.reset}`);
    return { success: false };
  }
}

// Test Biconomy configuration
function testBiconomyConfig(apiKey) {
  console.log(`\n${colors.cyan}Testing Biconomy configuration...${colors.reset}`);
  
  if (!apiKey) {
    console.log(`${colors.yellow}! Biconomy API key is not configured${colors.reset}`);
    console.log(`  This is optional but required for gasless transactions`);
    return { success: false, optional: true };
  }
  
  // Basic validation of API key format
  const isValidFormat = /^[a-zA-Z0-9_-]{10,}$/.test(apiKey);
  
  if (isValidFormat) {
    console.log(`${colors.green}✓ Biconomy API key is configured and format appears valid${colors.reset}`);
    return { success: true };
  } else {
    console.log(`${colors.red}✗ Biconomy API key format appears to be invalid${colors.reset}`);
    return { success: false };
  }
}

// Test smart contract addresses
function testContractAddresses() {
  console.log(`\n${colors.cyan}Testing smart contract configurations...${colors.reset}`);
  
  // Based on the memory information
  const contracts = {
    TeamTokenFactory: '0xD84420a763Fd7Af933fe516Ef6ceE44fCA1E9b49',
    ChilizToken: '0x0000000000000000000000000000000000001010',
    TokenMarketplace: '[Pending Deployment]',
    TokenAuction: '[Pending Deployment]'
  };
  
  let allValid = true;
  
  for (const [name, address] of Object.entries(contracts)) {
    if (!address || address === '[Pending Deployment]') {
      console.log(`${colors.yellow}! ${name}: Pending deployment${colors.reset}`);
      continue;
    }
    
    // Check if address is valid format (basic check)
    const isValidFormat = /^0x[a-fA-F0-9]{40}$/.test(address);
    
    if (isValidFormat) {
      console.log(`${colors.green}✓ ${name}: ${address}${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ${name}: Invalid address format - ${address}${colors.reset}`);
      allValid = false;
    }
  }
  
  return { success: allValid, contracts };
}

// Run all tests
async function runAllTests() {
  const results = {
    network: await testRpcConnection(envVars.NEXT_PUBLIC_RPC_URL),
    chainId: await testChainId(envVars.NEXT_PUBLIC_RPC_URL, envVars.NEXT_PUBLIC_CHAIN_ID),
    web3Auth: testWeb3AuthConfig(envVars.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID),
    biconomy: testBiconomyConfig(envVars.NEXT_PUBLIC_BICONOMY_API_KEY),
    contracts: testContractAddresses()
  };
  
  // Calculate overall success
  const requiredTests = ['network', 'chainId', 'web3Auth', 'contracts'];
  const allRequired = requiredTests.every(test => results[test].success);
  
  console.log(`\n${colors.bright}${colors.blue}=== TEST SUMMARY ===${colors.reset}\n`);
  
  if (allRequired) {
    console.log(`${colors.green}${colors.bright}✓ All required tests passed!${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bright}✗ Some required tests failed.${colors.reset}`);
  }
  
  // Save results to a file
  const resultsPath = path.join(process.cwd(), 'integration-test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    success: allRequired
  }, null, 2));
  
  console.log(`\nTest results saved to: ${resultsPath}`);
  
  return results;
}

// Run the tests
runAllTests().catch(error => {
  console.log(`${colors.red}Error running tests: ${error.message}${colors.reset}`);
  process.exit(1);
});
