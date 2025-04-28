/**
 * Global Error Handler Utility
 * Provides centralized error handling for the entire application
 */

import { handleWeb3Error } from './web3ErrorHandler';

// Error types
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  CONTRACT = 'contract',
  TRANSACTION = 'transaction',
  API = 'api',
  UI = 'ui',
  UNKNOWN = 'unknown'
}

// Error severity
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error interface
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError?: any;
  code?: string;
  context?: Record<string, any>;
  timestamp: number;
}

// Error tracking configuration
interface ErrorTrackingConfig {
  enabled: boolean;
  logToConsole: boolean;
  logToServer: boolean;
  serverEndpoint?: string;
}

// Default configuration
const defaultConfig: ErrorTrackingConfig = {
  enabled: true,
  logToConsole: true,
  logToServer: false
};

// Current configuration
let currentConfig: ErrorTrackingConfig = { ...defaultConfig };

// Error history
const errorHistory: AppError[] = [];

/**
 * Configure error tracking
 * @param config Error tracking configuration
 */
export function configureErrorTracking(config: Partial<ErrorTrackingConfig>): void {
  currentConfig = { ...defaultConfig, ...config };
}

/**
 * Create an application error
 * @param type Error type
 * @param severity Error severity
 * @param message Error message
 * @param originalError Original error object
 * @param code Error code
 * @param context Additional context
 * @returns Application error
 */
export function createError(
  type: ErrorType,
  severity: ErrorSeverity,
  message: string,
  originalError?: any,
  code?: string,
  context?: Record<string, any>
): AppError {
  return {
    type,
    severity,
    message,
    originalError,
    code,
    context,
    timestamp: Date.now()
  };
}

/**
 * Handle an error
 * @param error Error to handle
 * @returns Formatted error message
 */
export function handleError(error: any): string {
  // If it's already an AppError, just track and return the message
  if (error && typeof error === 'object' && 'type' in error && 'severity' in error) {
    trackError(error as AppError);
    return (error as AppError).message;
  }

  // Check if it's a Web3 error
  if (
    error && 
    (error.code?.startsWith('NETWORK_') || 
     error.code?.startsWith('TRANSACTION_') ||
     error.message?.includes('eth') ||
     error.message?.includes('wallet') ||
     error.message?.includes('provider') ||
     error.message?.includes('chain'))
  ) {
    const web3ErrorMessage = handleWeb3Error(error);
    const appError = createError(
      ErrorType.NETWORK,
      ErrorSeverity.ERROR,
      web3ErrorMessage,
      error,
      error.code
    );
    trackError(appError);
    return web3ErrorMessage;
  }

  // Handle API errors
  if (error?.response || error?.request) {
    const statusCode = error.response?.status;
    const apiErrorMessage = error.response?.data?.message || 
                           error.response?.statusText || 
                           'API request failed';
    
    const appError = createError(
      ErrorType.API,
      statusCode >= 500 ? ErrorSeverity.ERROR : ErrorSeverity.WARNING,
      apiErrorMessage,
      error,
      `API_${statusCode || 'UNKNOWN'}`,
      { url: error.config?.url, method: error.config?.method }
    );
    trackError(appError);
    return apiErrorMessage;
  }

  // Generic error handling
  const errorMessage = error?.message || String(error) || 'An unknown error occurred';
  const appError = createError(
    ErrorType.UNKNOWN,
    ErrorSeverity.ERROR,
    errorMessage,
    error
  );
  trackError(appError);
  return errorMessage;
}

/**
 * Track an error
 * @param error Error to track
 */
function trackError(error: AppError): void {
  if (!currentConfig.enabled) return;

  // Add to history
  errorHistory.push(error);
  
  // Limit history size
  if (errorHistory.length > 100) {
    errorHistory.shift();
  }

  // Log to console
  if (currentConfig.logToConsole) {
    const consoleMethod = error.severity === ErrorSeverity.CRITICAL ? console.error :
                         error.severity === ErrorSeverity.ERROR ? console.error :
                         error.severity === ErrorSeverity.WARNING ? console.warn :
                         console.info;
    
    consoleMethod(`[${error.type.toUpperCase()}] ${error.message}`, {
      severity: error.severity,
      code: error.code,
      context: error.context,
      originalError: error.originalError
    });
  }

  // Log to server
  if (currentConfig.logToServer && currentConfig.serverEndpoint) {
    try {
      const payload = {
        type: error.type,
        severity: error.severity,
        message: error.message,
        code: error.code,
        context: error.context,
        timestamp: error.timestamp,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      };

      // Don't include the original error in the payload to avoid circular references
      fetch(currentConfig.serverEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // Don't wait for the response
        keepalive: true
      }).catch(() => {
        // Ignore errors from error reporting
      });
    } catch (e) {
      // Ignore errors from error reporting
    }
  }
}

/**
 * Get error history
 * @returns Array of tracked errors
 */
export function getErrorHistory(): AppError[] {
  return [...errorHistory];
}

/**
 * Clear error history
 */
export function clearErrorHistory(): void {
  errorHistory.length = 0;
}

/**
 * Create a safe async function that handles errors
 * @param fn Function to make safe
 * @param errorHandler Custom error handler
 * @returns Safe function
 */
export function createSafeAsyncFunction<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  errorHandler?: (error: any) => void
): (...args: Args) => Promise<T | null> {
  return async (...args: Args): Promise<T | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorMessage = handleError(error);
      if (errorHandler) {
        errorHandler(error);
      }
      console.error(`Error in async function: ${errorMessage}`);
      return null;
    }
  };
}

/**
 * Create a safe function that handles errors
 * @param fn Function to make safe
 * @param errorHandler Custom error handler
 * @returns Safe function
 */
export function createSafeFunction<T, Args extends any[]>(
  fn: (...args: Args) => T,
  errorHandler?: (error: any) => void
): (...args: Args) => T | null {
  return (...args: Args): T | null => {
    try {
      return fn(...args);
    } catch (error) {
      const errorMessage = handleError(error);
      if (errorHandler) {
        errorHandler(error);
      }
      console.error(`Error in function: ${errorMessage}`);
      return null;
    }
  };
}
