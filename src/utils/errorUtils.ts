/**
 * Utility functions for handling Web3 and blockchain-related errors
 */

/**
 * Handles Web3 errors and returns a formatted error message
 * @param error The error object
 * @param defaultMessage Default message to show if error is not recognized
 * @returns Formatted error message
 */
export function handleWeb3Error(error: any, defaultMessage: string = "An error occurred"): string {
  // If it's a standard Error object
  if (error instanceof Error) {
    return `${defaultMessage}: ${error.message}`;
  }
  
  // If it's a JSON RPC error with code and message
  if (error && typeof error === 'object') {
    // Check for common error codes
    if (error.code === 4001) {
      return "Transaction rejected by user";
    }
    
    if (error.code === -32002) {
      return "Request already pending. Please check your wallet";
    }
    
    if (error.code === -32603) {
      return "Internal JSON-RPC error. Please try again";
    }
    
    // If there's a message property
    if (error.message) {
      return `${defaultMessage}: ${error.message}`;
    }
    
    // If there's a reason property
    if (error.reason) {
      return `${defaultMessage}: ${error.reason}`;
    }
  }
  
  // Default fallback
  return `${defaultMessage}. Please try again or contact support if the issue persists.`;
}

/**
 * Extracts a user-friendly message from a contract error
 * @param error The contract error
 * @returns User-friendly error message
 */
export function extractContractErrorMessage(error: any): string {
  if (!error) return "Unknown contract error";
  
  // Try to extract revert reason
  if (typeof error === 'object') {
    // Check for revert reason in various locations
    if (error.reason) return error.reason;
    if (error.data && error.data.message) return error.data.message;
    if (error.error && error.error.message) return error.error.message;
    if (error.message) {
      // Extract revert reason from error message if possible
      const match = error.message.match(/reverted with reason string '(.+)'/);
      if (match && match[1]) return match[1];
      
      // Return the message if no specific reason found
      return error.message;
    }
  }
  
  // If nothing specific found, return the stringified error
  return String(error);
}

/**
 * Checks if an error is due to user rejection (e.g., user declined transaction)
 * @param error The error to check
 * @returns Boolean indicating if error is due to user rejection
 */
export function isUserRejectionError(error: any): boolean {
  if (!error) return false;
  
  // Check error code
  if (error.code === 4001) return true;
  
  // Check error message
  if (error.message && typeof error.message === 'string') {
    const message = error.message.toLowerCase();
    return (
      message.includes('user denied') ||
      message.includes('user rejected') ||
      message.includes('rejected by user') ||
      message.includes('user cancelled')
    );
  }
  
  return false;
}
