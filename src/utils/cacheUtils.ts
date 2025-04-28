/**
 * Cache utility for storing and retrieving data with expiration
 */

interface CacheItem<T> {
  value: T;
  expiry: number;
}

class Cache {
  private storage: Map<string, CacheItem<any>>;
  private defaultTTL: number; // Time to live in milliseconds

  constructor(defaultTTL = 5 * 60 * 1000) { // Default 5 minutes
    this.storage = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Set a value in the cache with optional TTL
   * @param key Cache key
   * @param value Value to store
   * @param ttl Time to live in milliseconds (optional)
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.storage.set(key, { value, expiry });
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const item = this.storage.get(key);
    
    // Return undefined if item doesn't exist or has expired
    if (!item || item.expiry < Date.now()) {
      if (item) {
        // Remove expired item
        this.storage.delete(key);
      }
      return undefined;
    }
    
    return item.value as T;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key Cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.storage.get(key);
    const valid = item && item.expiry >= Date.now();
    
    if (item && !valid) {
      // Remove expired item
      this.storage.delete(key);
    }
    
    return !!valid;
  }

  /**
   * Remove a key from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.storage.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Remove all expired items from the cache
   * @returns Number of items removed
   */
  cleanup(): number {
    const now = Date.now();
    let count = 0;
    
    for (const [key, item] of this.storage.entries()) {
      if (item.expiry < now) {
        this.storage.delete(key);
        count++;
      }
    }
    
    return count;
  }

  /**
   * Get the number of items in the cache
   */
  size(): number {
    return this.storage.size;
  }

  /**
   * Get or set a value with a callback if not in cache
   * @param key Cache key
   * @param callback Function to call if value is not in cache
   * @param ttl Time to live in milliseconds (optional)
   * @returns The cached or newly fetched value
   */
  async getOrSet<T>(key: string, callback: () => Promise<T>, ttl?: number): Promise<T> {
    const cachedValue = this.get<T>(key);
    
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    const value = await callback();
    this.set(key, value, ttl);
    return value;
  }
}

// Create a global instance with default TTL of 5 minutes
export const globalCache = new Cache(5 * 60 * 1000);

// Create a cache specifically for blockchain data with longer TTL (10 minutes)
export const blockchainCache = new Cache(10 * 60 * 1000);

// Create a cache for UI data with shorter TTL (2 minutes)
export const uiCache = new Cache(2 * 60 * 1000);

export default Cache;
