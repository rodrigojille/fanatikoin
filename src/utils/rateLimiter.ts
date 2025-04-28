/**
 * Rate limiter utility for Fanatikoin API endpoints
 * Provides protection against brute force attacks and abuse
 */

// In-memory storage for rate limiting
// In production, consider using Redis or another distributed storage
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum number of requests allowed in the window
  message?: string;  // Custom message for rate limit exceeded
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Set up periodic cleanup of expired entries
    if (typeof window === 'undefined') { // Only run on server
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
    }
  }
  
  /**
   * Check if a request should be rate limited
   * @param key Unique identifier (usually IP address or user ID)
   * @param options Rate limiting options
   * @returns Object containing whether the request is allowed and remaining requests
   */
  check(key: string, options: RateLimitOptions): { 
    allowed: boolean; 
    remaining: number;
    resetAt: number;
    message?: string;
  } {
    const now = Date.now();
    const entry = this.storage.get(key);
    
    // If no entry exists or the entry has expired, create a new one
    if (!entry || entry.resetAt <= now) {
      this.storage.set(key, {
        count: 1,
        resetAt: now + options.windowMs
      });
      
      return {
        allowed: true,
        remaining: options.maxRequests - 1,
        resetAt: now + options.windowMs
      };
    }
    
    // If the entry exists and is not expired, increment the count
    if (entry.count < options.maxRequests) {
      entry.count++;
      this.storage.set(key, entry);
      
      return {
        allowed: true,
        remaining: options.maxRequests - entry.count,
        resetAt: entry.resetAt
      };
    }
    
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      message: options.message || `Too many requests, please try again after ${Math.ceil((entry.resetAt - now) / 1000)} seconds`
    };
  }
  
  /**
   * Reset rate limit for a specific key
   * @param key Unique identifier to reset
   */
  reset(key: string): void {
    this.storage.delete(key);
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (entry.resetAt <= now) {
        this.storage.delete(key);
      }
    }
  }
  
  /**
   * Destroy the rate limiter and clear the cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.storage.clear();
  }
}

// Create a singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;
