import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';

import useSociosWallet from '@/hooks/useSociosWallet';
import { runAllTests, TestResult, TestSuite } from '@/utils/integrationTester';
import { getCurrentNetwork, CHILIZ_NETWORKS } from '@/config/chilizNetworks';
import { handleError } from '@/utils/errorHandler';
import usePerformanceMonitor from '@/hooks/usePerformanceMonitor';
import useErrorHandler from '@/hooks/useErrorHandler';

const TestIntegrationsPage = () => {
  // Web3Auth direct debug state
  const [waStatus, setWaStatus] = useState<'idle'|'connecting'|'connected'|'error'>('idle');
  const [waError, setWaError] = useState<string|null>(null);
  const [waUser, setWaUser] = useState<any>(null);
  const [waAddress, setWaAddress] = useState<string|null>(null);
  const [waChainId, setWaChainId] = useState<number|null>(null);
  const [waBalance, setWaBalance] = useState<string|null>(null);

  const handleWeb3AuthConnect = async () => {
    setWaStatus('error');
    setWaError('Web3Auth integration has been removed. Please use MetaMask for wallet connections.');
  };

  const { connect: connectWeb3Auth, isConnected: isWeb3Connected, address: web3Address } = useWeb3();
  const { connect: connectSocios, isConnected: isSociosConnected, address: sociosAddress } = useSociosWallet();
  
  const [testSuite, setTestSuite] = useState<TestSuite | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainnetLatency, setMainnetLatency] = useState<number | null>(null);
  const [testnetLatency, setTestnetLatency] = useState<number | null>(null);
  
  // Use performance monitoring hook
  const { 
    networkLatency,
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkNetworkLatency
  } = usePerformanceMonitor('TestIntegrationsPage');
  
  // Use error handling hook
  const { handleError: handleErrorWithState } = useErrorHandler();
  
  // Run tests on page load
  useEffect(() => {
    runTests();
  }, []);
  
  // Run network latency tests
  useEffect(() => {
    testNetworkLatency();
  }, []);
  
  const runTests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const results = await runAllTests();
      setTestSuite(results);
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      handleErrorWithState(err, { context: 'Running integration tests' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const testNetworkLatency = async () => {
    try {
      // Use our performance monitoring utility
      const mainnetLatency = await measureNetworkLatency(CHILIZ_NETWORKS.MAINNET.rpcUrl);
      if (mainnetLatency > 0) {
        setMainnetLatency(mainnetLatency);
      }
      
      const testnetLatency = await measureNetworkLatency(CHILIZ_NETWORKS.SPICY_TESTNET.rpcUrl);
      if (testnetLatency > 0) {
        setTestnetLatency(testnetLatency);
      }
    } catch (err) {
      console.error('Error testing network latency:', err);
      handleErrorWithState(err, { context: 'Network latency test' });
    }
  };
  
  // Import the function at the top of the file
  async function measureNetworkLatency(rpcUrl: string): Promise<number> {
    try {
      const startTime = performance.now();
      
      // Make a simple JSON-RPC request
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
      
      await response.json();
      const endTime = performance.now();
      return endTime - startTime;
    } catch (error) {
      console.error(`Error measuring latency for ${rpcUrl}:`, error);
      return -1;
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Web3Auth Direct Debug Section */}
      <div className="mb-8 p-4 bg-blue-50 rounded border border-blue-200">
        <h2 className="text-xl font-semibold mb-2">Web3Auth Direct Debug</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleWeb3AuthConnect}
          disabled={waStatus==='connecting'}
        >
          {waStatus === 'connecting' ? 'Connecting...' : 'Connect with Web3Auth'}
        </button>
        <div className="mt-4">
          {waStatus === 'idle' && <span className="text-gray-500">Not connected.</span>}
          {waStatus === 'connecting' && <span className="text-blue-600">Connecting...</span>}
          {waStatus === 'connected' && (
            <div className="text-green-700">
              <div>✅ Connected via Web3Auth</div>
              <div><strong>Address:</strong> {waAddress || 'N/A'}</div>
              <div><strong>Chain ID:</strong> {waChainId || 'N/A'}</div>
              <div><strong>Balance:</strong> {waBalance || 'N/A'} CHZ</div>
              <div><strong>User Info:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">{JSON.stringify(waUser, null, 2)}</pre>
              </div>
            </div>
          )}
          {waStatus === 'error' && (
            <div className="text-red-600">
              <div>❌ Error: {waError}</div>
            </div>
          )}
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-6">Fanatikoin Integration Tests</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Network Configuration</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p><strong>Current Network:</strong> {getCurrentNetwork().name}</p>
          <p><strong>Chain ID:</strong> {getCurrentNetwork().chainId} ({getCurrentNetwork().chainIdHex})</p>
          <p><strong>RPC URL:</strong> {getCurrentNetwork().rpcUrl}</p>
          <p><strong>Block Explorer:</strong> <a href={getCurrentNetwork().blockExplorerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{getCurrentNetwork().blockExplorerUrl}</a></p>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Network Latency</h3>
            <div className="flex space-x-8">
              <div>
                <p><strong>Mainnet:</strong> {mainnetLatency ? `${mainnetLatency}ms` : 'Testing...'}</p>
                <div className={`h-2 w-32 mt-1 rounded ${mainnetLatency ? (mainnetLatency > 1000 ? 'bg-red-500' : mainnetLatency > 500 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-300'}`}></div>
              </div>
              <div>
                <p><strong>Testnet:</strong> {testnetLatency ? `${testnetLatency}ms` : 'Testing...'}</p>
                <div className={`h-2 w-32 mt-1 rounded ${testnetLatency ? (testnetLatency > 1000 ? 'bg-red-500' : testnetLatency > 500 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-300'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Wallet Connections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Web3Auth */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Web3Auth</h3>
            <div className="mb-4">
              <p><strong>Status:</strong> {isWeb3Connected ? 
                <span className="text-green-600">Connected</span> : 
                <span className="text-red-600">Not Connected</span>
              }</p>
              {isWeb3Connected && web3Address && (
                <p><strong>Address:</strong> {web3Address}</p>
              )}
            </div>
            <button
              onClick={async () => {
                try {
                  await connectWeb3Auth();
                } catch (err) {
                  setError(handleError(err));
                }
              }}
              disabled={isWeb3Connected}
              className={`px-4 py-2 rounded ${isWeb3Connected ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {isWeb3Connected ? 'Connected' : 'Connect Web3Auth'}
            </button>
          </div>
          
          {/* Socios Wallet */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Socios Wallet</h3>
            <div className="mb-4">
              <p><strong>Status:</strong> {isSociosConnected ? 
                <span className="text-green-600">Connected</span> : 
                <span className="text-red-600">Not Connected</span>
              }</p>
              {isSociosConnected && sociosAddress && (
                <p><strong>Address:</strong> {sociosAddress}</p>
              )}
            </div>
            <button
              onClick={async () => {
                try {
                  await connectSocios();
                } catch (err) {
                  setError(handleError(err));
                }
              }}
              disabled={isSociosConnected}
              className={`px-4 py-2 rounded ${isSociosConnected ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
            >
              {isSociosConnected ? 'Connected' : 'Connect Socios Wallet'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Integration Tests</h2>
          <div className="mb-4 flex space-x-4">
            <button 
              onClick={runTests} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Running Tests...' : 'Run Tests'}
            </button>
            
            <button 
              onClick={() => isMonitoring ? stopMonitoring() : startMonitoring()}
              className={`px-4 py-2 ${isMonitoring ? 'bg-red-600' : 'bg-green-600'} text-white rounded hover:${isMonitoring ? 'bg-red-700' : 'bg-green-700'} transition-colors`}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {testSuite ? (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{testSuite.name}</h3>
                <div className={`text-sm font-medium rounded-full px-3 py-1 ${testSuite.status === 'completed' ? 'bg-green-100 text-green-800' : testSuite.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {testSuite.status.toUpperCase()}
                </div>
              </div>
              <p className="text-gray-600 mb-4">{testSuite.description}</p>
              <p className="text-sm text-gray-500 mb-6">
                Started: {new Date(testSuite.startTime).toLocaleString()}
                {testSuite.endTime && ` • Completed: ${new Date(testSuite.endTime).toLocaleString()}`}
                {testSuite.endTime && ` • Duration: ${((testSuite.endTime - testSuite.startTime) / 1000).toFixed(2)}s`}
              </p>
              
              <div className="space-y-4">
                {testSuite.results.map((result: TestResult, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{result.name}</h4>
                      <div className={`text-xs font-medium rounded-full px-2 py-0.5 ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {result.success ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{result.message}</p>
                    {result.details && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono overflow-x-auto">
                        <pre>{JSON.stringify(result.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 p-8 rounded-lg flex justify-center items-center">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-8 w-8 text-gray-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">Running tests...</p>
              </div>
            ) : (
              <p className="text-gray-600">No test results available. Click "Run Tests" to start testing.</p>
            )}
          </div>
        )}
        
        {/* Performance Metrics */}
        {isMonitoring && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Web3 Calls</h4>
                {Object.keys(metrics.web3Calls).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(metrics.web3Calls).map(([method, data]) => (
                      <div key={method} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">{method}</p>
                        <div className="grid grid-cols-2 text-sm">
                          <p>Count: {data.count}</p>
                          <p>Last: {data.lastTime.toFixed(2)}ms</p>
                          <p>Avg: {data.averageTime.toFixed(2)}ms</p>
                          <p>Total: {data.totalTime.toFixed(2)}ms</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No Web3 calls recorded yet</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">API Calls</h4>
                {Object.keys(metrics.apiCalls).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(metrics.apiCalls).map(([endpoint, data]) => (
                      <div key={endpoint} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">{endpoint}</p>
                        <div className="grid grid-cols-2 text-sm">
                          <p>Count: {data.count}</p>
                          <p>Last: {data.lastTime.toFixed(2)}ms</p>
                          <p>Avg: {data.averageTime.toFixed(2)}ms</p>
                          <p>Total: {data.totalTime.toFixed(2)}ms</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No API calls recorded yet</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Component Render Times</h4>
                {Object.keys(metrics.renderTime).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(metrics.renderTime).map(([component, time]) => (
                      <div key={component} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">{component}</p>
                        <p className="text-sm">Render time: {time.toFixed(2)}ms</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No component render times recorded yet</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Transaction Times</h4>
                {Object.keys(metrics.transactionTime).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(metrics.transactionTime).map(([txType, time]) => (
                      <div key={txType} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">{txType}</p>
                        <p className="text-sm">Time: {time.toFixed(2)}ms</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No transactions recorded yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestIntegrationsPage;
