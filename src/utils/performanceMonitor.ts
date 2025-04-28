/**
 * Performance Monitoring Utility
 * Tracks and optimizes application performance
 */

// Performance metrics
interface PerformanceMetrics {
  networkLatency: number | null;
  renderTime: Record<string, number>;
  transactionTime: Record<string, number>;
  apiCalls: Record<string, {
    count: number;
    totalTime: number;
    averageTime: number;
    lastTime: number;
  }>;
  web3Calls: Record<string, {
    count: number;
    totalTime: number;
    averageTime: number;
    lastTime: number;
  }>;
}

// Initialize metrics
const metrics: PerformanceMetrics = {
  networkLatency: null,
  renderTime: {},
  transactionTime: {},
  apiCalls: {},
  web3Calls: {}
};

/**
 * Measure network latency to RPC endpoint
 * @param rpcUrl RPC URL to test
 * @returns Latency in milliseconds
 */
export async function measureNetworkLatency(rpcUrl: string): Promise<number> {
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
    const latency = endTime - startTime;
    
    // Update metrics
    metrics.networkLatency = latency;
    
    return latency;
  } catch (error) {
    console.error('[Performance] Error measuring network latency:', error);
    return -1;
  }
}

/**
 * Start measuring component render time
 * @param componentName Component name
 * @returns Timestamp
 */
export function startMeasuringRender(componentName: string): number {
  return performance.now();
}

/**
 * Stop measuring component render time
 * @param componentName Component name
 * @param startTime Start timestamp
 */
export function stopMeasuringRender(componentName: string, startTime: number): void {
  const renderTime = performance.now() - startTime;
  metrics.renderTime[componentName] = renderTime;
  
  // Log slow renders
  if (renderTime > 100) {
    console.warn(`[Performance] Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
  }
}

/**
 * Track API call performance
 * @param endpoint API endpoint
 * @param startTime Start timestamp
 */
export function trackApiCall(endpoint: string, startTime: number): void {
  const callTime = performance.now() - startTime;
  
  if (!metrics.apiCalls[endpoint]) {
    metrics.apiCalls[endpoint] = {
      count: 0,
      totalTime: 0,
      averageTime: 0,
      lastTime: callTime
    };
  }
  
  metrics.apiCalls[endpoint].count++;
  metrics.apiCalls[endpoint].totalTime += callTime;
  metrics.apiCalls[endpoint].averageTime = 
    metrics.apiCalls[endpoint].totalTime / metrics.apiCalls[endpoint].count;
  metrics.apiCalls[endpoint].lastTime = callTime;
  
  // Log slow API calls
  if (callTime > 1000) {
    console.warn(`[Performance] Slow API call detected to ${endpoint}: ${callTime.toFixed(2)}ms`);
  }
}

/**
 * Track Web3 call performance
 * @param method Web3 method
 * @param startTime Start timestamp
 */
export function trackWeb3Call(method: string, startTime: number): void {
  const callTime = performance.now() - startTime;
  
  if (!metrics.web3Calls[method]) {
    metrics.web3Calls[method] = {
      count: 0,
      totalTime: 0,
      averageTime: 0,
      lastTime: callTime
    };
  }
  
  metrics.web3Calls[method].count++;
  metrics.web3Calls[method].totalTime += callTime;
  metrics.web3Calls[method].averageTime = 
    metrics.web3Calls[method].totalTime / metrics.web3Calls[method].count;
  metrics.web3Calls[method].lastTime = callTime;
  
  // Log slow Web3 calls
  if (callTime > 3000) {
    console.warn(`[Performance] Slow Web3 call detected for ${method}: ${callTime.toFixed(2)}ms`);
  }
}

/**
 * Track transaction performance
 * @param transactionType Transaction type
 * @param startTime Start timestamp
 */
export function trackTransaction(transactionType: string, startTime: number): void {
  const transactionTime = performance.now() - startTime;
  metrics.transactionTime[transactionType] = transactionTime;
  
  // Log slow transactions
  if (transactionTime > 10000) {
    console.warn(`[Performance] Slow transaction detected for ${transactionType}: ${transactionTime.toFixed(2)}ms`);
  }
}

/**
 * Get current performance metrics
 * @returns Performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...metrics };
}

/**
 * Reset performance metrics
 */
export function resetPerformanceMetrics(): void {
  metrics.networkLatency = null;
  metrics.renderTime = {};
  metrics.transactionTime = {};
  metrics.apiCalls = {};
  metrics.web3Calls = {};
}

/**
 * Create a performance-optimized version of a function
 * @param fn Function to optimize
 * @param name Function name for tracking
 * @returns Optimized function
 */
export function createOptimizedFunction<T, Args extends any[]>(
  fn: (...args: Args) => T,
  name: string
): (...args: Args) => T {
  return (...args: Args): T => {
    const startTime = performance.now();
    const result = fn(...args);
    const endTime = performance.now();
    
    console.log(`[Performance] Function ${name} took ${(endTime - startTime).toFixed(2)}ms`);
    
    return result;
  };
}

/**
 * Create a performance-optimized version of an async function
 * @param fn Async function to optimize
 * @param name Function name for tracking
 * @returns Optimized async function
 */
export function createOptimizedAsyncFunction<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  name: string
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await fn(...args);
      const endTime = performance.now();
      
      console.log(`[Performance] Async function ${name} took ${(endTime - startTime).toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      console.error(`[Performance] Async function ${name} failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
      throw error;
    }
  };
}

/**
 * Debounce a function
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Throttle a function
 * @param fn Function to throttle
 * @param limit Limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>): void => {
    const now = Date.now();
    
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Memoize a function
 * @param fn Function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();
  
  return (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  };
}
