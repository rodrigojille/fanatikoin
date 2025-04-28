import React from 'react';
import { NETWORK_CONFIG } from '@/contracts/config';

/**
 * Simple Web3 Debug Page
 */
const Web3SimplePage = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Web3 Configuration Debug</h1>
      
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {`NEXT_PUBLIC_CHAIN_ID: ${process.env.NEXT_PUBLIC_CHAIN_ID || 'Not set'}
NEXT_PUBLIC_RPC_URL: ${process.env.NEXT_PUBLIC_RPC_URL || 'Not set'}
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: ${process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ? 
  process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID.substring(0, 10) + '...' : 'Not set'}`}
        </pre>
      </div>
      
      <div className="bg-white shadow-md rounded p-6">
        <h2 className="text-xl font-bold mb-4">Network Configuration</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {`chainId: ${NETWORK_CONFIG.chainId}
name: ${NETWORK_CONFIG.name}
rpcUrl: ${NETWORK_CONFIG.rpcUrl}
blockExplorer: ${NETWORK_CONFIG.blockExplorer}`}
        </pre>
      </div>
    </div>
  );
};

export default Web3SimplePage;
