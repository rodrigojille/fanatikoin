# Fanatikoin - Chiliz Chain Integration Guide

This document provides comprehensive information about the Chiliz Chain integration in the Fanatikoin application.

## Table of Contents

1. [Overview](#overview)
2. [Network Configuration](#network-configuration)
3. [Authentication Methods](#authentication-methods)
4. [Token Price Integration](#token-price-integration)
5. [Random Number Generation](#random-number-generation)
6. [Troubleshooting](#troubleshooting)
7. [Testing](#testing)

## Overview

Fanatikoin is integrated with the Chiliz Chain blockchain, specifically the Spicy Testnet for development and testing. This integration enables fan token creation, trading, and engagement features powered by blockchain technology.

### Key Features

- Web3Auth social login integration
- Socios Wallet support
- Fan token price tracking
- Blockchain-based random number generation
- Comprehensive error handling

## Network Configuration

### Chiliz Chain Networks

Fanatikoin supports both Chiliz Chain Mainnet and Spicy Testnet.

| Network | Chain ID | Chain ID (Hex) | RPC URL |
|---------|----------|---------------|---------|
| Mainnet | 88888 | 0x15b38 | https://rpc.ankr.com/chiliz |
| Spicy Testnet | 88882 | 0x15b32 | https://spicy-rpc.chiliz.com/ |

### Environment Configuration

The following environment variables are used for Chiliz Chain configuration:

```
# RPC Provider for Chiliz Spicy Testnet
NEXT_PUBLIC_RPC_URL=https://spicy-rpc.chiliz.com/
# Chiliz Spicy Testnet Chain ID
NEXT_PUBLIC_CHAIN_ID=88882
# Web3Auth Client ID
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
```

### Network Switching

The application automatically detects if the user is on the correct network and prompts them to switch if necessary. This is handled by the `web3auth.ts` service.

## Authentication Methods

### Web3Auth

Web3Auth provides social login capabilities, allowing users to authenticate using Google, Facebook, Twitter, and other providers.

#### Configuration

Web3Auth is configured in `src/services/web3auth.ts` with the following settings:

- Client ID: Configured via environment variable
- Chain configuration: Uses the Chiliz Chain network settings
- Adapters: OpenLogin adapter for social login

#### Usage

```typescript
import { useWeb3 } from '@/context/Web3Context';

// In your component
const { connect, disconnect, address, isConnected } = useWeb3();

// Connect with Web3Auth
await connect();
```

### Socios Wallet

Socios Wallet integration allows users to connect their Socios Wallet directly to the application.

#### Detection

The application checks for Socios Wallet availability by looking for:
- `window.ethereum?.isSocios` property
- `window.ethereum?.isSociosWallet` property
- `window.socios` object

#### Usage

```typescript
import useSociosWallet from '@/hooks/useSociosWallet';

// In your component
const { 
  connect, 
  isAvailable, 
  isConnected, 
  address 
} = useSociosWallet();

// Check if Socios Wallet is available
if (isAvailable) {
  // Connect to Socios Wallet
  await connect();
}
```

## Token Price Integration

Fanatikoin includes utilities for fetching and displaying fan token prices from various sources.

### Price Sources

1. Chiliz Price API (primary)
2. CoinGecko (fallback)
3. Chainlink Oracles (if available)

### Usage

```typescript
import useTokenPrice from '@/hooks/useTokenPrice';

// In your component
const { 
  price, 
  loading, 
  error, 
  formatPrice, 
  calculateValue 
} = useTokenPrice(tokenAddress);

// Format price for display
const formattedPrice = formatPrice({ currency: 'USD' });

// Calculate token value
const tokenAmount = 100;
const valueInUsd = calculateValue(tokenAmount);
```

## Random Number Generation

The application includes utilities for generating verifiable random numbers using the Chiliz blockchain.

### Methods

1. Block hash-based randomness
2. Seeded random number generation

### Usage

```typescript
import { 
  requestRandomNumberFromBlock,
  getRandomNumberFromBlock,
  getRandomInt
} from '@/utils/randomNumberGenerator';

// Request random number
const request = await requestRandomNumberFromBlock(provider);

// Get random number result (in next block)
const result = await getRandomNumberFromBlock(provider, request);

// Generate random integer between 1 and 100
const randomNumber = getRandomInt(result.randomNumberAsFloat, 1, 100);
```

## Troubleshooting

### Common Issues

#### Network Connection Issues

**Symptoms:**
- "Failed to connect to network" errors
- Transactions not being processed

**Solutions:**
1. Check if the RPC URL is correct in `.env.local`
2. Verify that the Chain ID is set to 88882 for Spicy Testnet
3. Test network connectivity using the test page at `/test-integrations`

#### Web3Auth Connection Failures

**Symptoms:**
- Social login popup closes without connecting
- "Failed to initialize Web3Auth" errors

**Solutions:**
1. Verify that the Web3Auth client ID is correct
2. Check browser console for detailed error messages
3. Ensure that the application is running on a supported domain (localhost or HTTPS)

#### Socios Wallet Detection Issues

**Symptoms:**
- Socios Wallet option not appearing
- "Socios Wallet not detected" errors

**Solutions:**
1. Ensure Socios Wallet is installed and unlocked
2. Check if the Socios Wallet is on the correct network
3. Refresh the page and try again

## Testing

A test page is available at `/test-integrations` to verify the integration with Chiliz Chain. This page provides:

1. Network configuration details
2. Wallet connection testing
3. Network latency measurements
4. Configuration validation

To run tests programmatically:

```typescript
import { runAllTests } from '@/utils/testUtils';

// Run all tests
const results = await runAllTests();
console.log(results);
```

---

## Additional Resources

- [Chiliz Chain Documentation](https://docs.chiliz.com/)
- [Web3Auth Documentation](https://web3auth.io/docs/)
- [Socios Wallet Documentation](https://www.chiliz.com/)
