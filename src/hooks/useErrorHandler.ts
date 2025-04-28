import { useState, useCallback, useEffect } from 'react';
import { 
  handleError, 
  ErrorType, 
  ErrorSeverity, 
  createError,
  AppError,
  getErrorHistory,
  clearErrorHistory
} from '@/utils/errorHandler';

/**
 * Hook for handling errors in components
 * @returns Error handling utilities
 */
export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<AppError | null>(null);
  const [errorHistory, setErrorHistory] = useState<AppError[]>([]);

  // Handle an error and set the error state
  const handleErrorWithState = useCallback((err: any, context?: Record<string, any>) => {
    if (!err) {
      setError(null);
      setErrorDetails(null);
      return;
    }

    // If it's already an AppError, just use it
    if (err && typeof err === 'object' && 'type' in err && 'severity' in err) {
      setError(err.message);
      setErrorDetails(err as AppError);
      return err.message;
    }

    // Create context with component information
    const errorContext = {
      ...context,
      component: 'useErrorHandler',
      timestamp: new Date().toISOString()
    };

    // Handle the error
    const errorMessage = handleError(err);
    
    // Create an AppError for the error details
    const appError = createError(
      ErrorType.UNKNOWN,
      ErrorSeverity.ERROR,
      errorMessage,
      err,
      undefined,
      errorContext
    );
    
    setError(errorMessage);
    setErrorDetails(appError);
    
    return errorMessage;
  }, []);

  // Clear the error state
  const clearError = useCallback(() => {
    setError(null);
    setErrorDetails(null);
  }, []);

  // Create a safe async function that handles errors
  const createSafeAsyncFunction = useCallback(<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    context?: Record<string, any>
  ): ((...args: Args) => Promise<T | null>) => {
    return async (...args: Args): Promise<T | null> => {
      try {
        const result = await fn(...args);
        // Clear any previous errors on success
        clearError();
        return result;
      } catch (err) {
        handleErrorWithState(err, context);
        return null;
      }
    };
  }, [handleErrorWithState, clearError]);

  // Get error history
  const refreshErrorHistory = useCallback(() => {
    setErrorHistory(getErrorHistory());
  }, []);

  // Clear error history
  const clearAllErrors = useCallback(() => {
    clearErrorHistory();
    refreshErrorHistory();
    clearError();
  }, [clearError, refreshErrorHistory]);

  // Refresh error history when the component mounts
  useEffect(() => {
    refreshErrorHistory();
  }, [refreshErrorHistory]);

  return {
    error,
    errorDetails,
    errorHistory,
    handleError: handleErrorWithState,
    clearError,
    createSafeAsyncFunction,
    refreshErrorHistory,
    clearAllErrors
  };
}

export default useErrorHandler;
