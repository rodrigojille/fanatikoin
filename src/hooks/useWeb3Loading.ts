import { useState, useCallback } from 'react';

interface Web3LoadingState {
  isLoading: boolean;
  operation: string;
  message: string;
}

interface UseWeb3LoadingReturn {
  loading: Web3LoadingState;
  startLoading: (operation: string, message?: string) => void;
  stopLoading: () => void;
  withLoading: <T>(operation: string, message: string, fn: () => Promise<T>) => Promise<T>;
}

/**
 * Hook to manage loading states for Web3 operations
 * Provides functions to start/stop loading and a wrapper for async operations
 */
export const useWeb3Loading = (): UseWeb3LoadingReturn => {
  const [loading, setLoading] = useState<Web3LoadingState>({
    isLoading: false,
    operation: '',
    message: ''
  });

  const startLoading = useCallback((operation: string, message = 'Processing transaction...') => {
    setLoading({
      isLoading: true,
      operation,
      message
    });
  }, []);

  const stopLoading = useCallback(() => {
    setLoading({
      isLoading: false,
      operation: '',
      message: ''
    });
  }, []);

  /**
   * Wrapper function to automatically handle loading state for async operations
   * @param operation The name of the operation (for tracking)
   * @param message The loading message to display
   * @param fn The async function to execute
   * @returns The result of the async function
   */
  const withLoading = useCallback(
    async <T>(operation: string, message: string, fn: () => Promise<T>): Promise<T> => {
      try {
        startLoading(operation, message);
        const result = await fn();
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading
  };
};

export default useWeb3Loading;
