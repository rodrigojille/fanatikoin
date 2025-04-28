import { useState, useEffect, useCallback, useRef } from 'react';
import {
  measureNetworkLatency,
  getPerformanceMetrics,
  resetPerformanceMetrics,
  startMeasuringRender,
  stopMeasuringRender
} from '@/utils/performanceMonitor';
import { getCurrentNetwork } from '@/config/chilizNetworks';

/**
 * Hook for monitoring performance in components
 * @param componentName Name of the component using this hook
 * @returns Performance monitoring utilities
 */
export function usePerformanceMonitor(componentName: string) {
  const [networkLatency, setNetworkLatency] = useState<number | null>(null);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [metrics, setMetrics] = useState(getPerformanceMetrics());
  const renderStartTime = useRef<number>(0);
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);

  // Measure network latency
  const checkNetworkLatency = useCallback(async () => {
    const network = getCurrentNetwork();
    const latency = await measureNetworkLatency(network.rpcUrl);
    setNetworkLatency(latency);
    return latency;
  }, []);

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
    }

    setIsMonitoring(true);
    
    // Check network latency immediately
    checkNetworkLatency();
    
    // Set up interval to check network latency
    monitoringInterval.current = setInterval(() => {
      checkNetworkLatency();
      setMetrics(getPerformanceMetrics());
    }, 30000); // Check every 30 seconds
    
    return () => {
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
        monitoringInterval.current = null;
      }
    };
  }, [checkNetworkLatency]);

  // Stop performance monitoring
  const stopMonitoring = useCallback(() => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
      monitoringInterval.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // Reset performance metrics
  const resetMetrics = useCallback(() => {
    resetPerformanceMetrics();
    setMetrics(getPerformanceMetrics());
  }, []);

  // Refresh metrics
  const refreshMetrics = useCallback(() => {
    setMetrics(getPerformanceMetrics());
  }, []);

  // Start measuring render time when component mounts
  useEffect(() => {
    renderStartTime.current = startMeasuringRender(componentName);
    
    return () => {
      stopMeasuringRender(componentName, renderStartTime.current);
      
      // Clean up interval on unmount
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
        monitoringInterval.current = null;
      }
    };
  }, [componentName]);

  return {
    networkLatency,
    metrics,
    isMonitoring,
    checkNetworkLatency,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    refreshMetrics
  };
}

export default usePerformanceMonitor;
