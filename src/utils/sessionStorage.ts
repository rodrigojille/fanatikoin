/**
 * Session storage utility for Fanatikoin
 * Provides persistent storage with encryption for sensitive data
 */

// Keys for storage
const STORAGE_KEYS = {
  AUTH_TOKEN: 'fanatikoin_auth_token',
  USER_PREFERENCES: 'fanatikoin_user_prefs',
  LAST_CONNECTED_WALLET: 'fanatikoin_last_wallet',
  LAST_NETWORK: 'fanatikoin_last_network',
  THEME_PREFERENCE: 'fanatikoin_theme',
};

// Simple encryption for sensitive data
// Note: This is not secure for highly sensitive data, but adds a layer of obfuscation
const encryptData = (data: string): string => {
  return btoa(encodeURIComponent(data));
};

const decryptData = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return '';
  }
};

/**
 * Save data to localStorage with optional encryption
 */
export const saveToStorage = (key: string, data: any, shouldEncrypt = false): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const serializedData = JSON.stringify(data);
    const valueToStore = shouldEncrypt ? encryptData(serializedData) : serializedData;
    localStorage.setItem(key, valueToStore);
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
  }
};

/**
 * Load data from localStorage with optional decryption
 */
export const loadFromStorage = <T>(key: string, encrypted = false, defaultValue: T = null as any): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return defaultValue;
    
    const parsedData = encrypted ? decryptData(storedValue) : storedValue;
    return JSON.parse(parsedData) as T;
  } catch (error) {
    console.error(`Error loading from storage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Remove data from localStorage
 */
export const removeFromStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from storage (${key}):`, error);
  }
};

/**
 * Clear all Fanatikoin-related data from localStorage
 */
export const clearAllStorage = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

/**
 * Save auth token to localStorage (encrypted)
 */
export const saveAuthToken = (token: string): void => {
  saveToStorage(STORAGE_KEYS.AUTH_TOKEN, token, true);
};

/**
 * Get auth token from localStorage (encrypted)
 */
export const getAuthToken = (): string => {
  return loadFromStorage<string>(STORAGE_KEYS.AUTH_TOKEN, true, '');
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = (): void => {
  removeFromStorage(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Save user preferences to localStorage
 */
export const saveUserPreferences = (preferences: Record<string, any>): void => {
  saveToStorage(STORAGE_KEYS.USER_PREFERENCES, preferences);
};

/**
 * Get user preferences from localStorage
 */
export const getUserPreferences = (): Record<string, any> => {
  return loadFromStorage<Record<string, any>>(STORAGE_KEYS.USER_PREFERENCES, false, {});
};

/**
 * Save last connected wallet address to localStorage
 */
export const saveLastConnectedWallet = (address: string): void => {
  saveToStorage(STORAGE_KEYS.LAST_CONNECTED_WALLET, address);
};

/**
 * Get last connected wallet address from localStorage
 */
export const getLastConnectedWallet = (): string => {
  return loadFromStorage<string>(STORAGE_KEYS.LAST_CONNECTED_WALLET, false, '');
};

/**
 * Save last network ID to localStorage
 */
export const saveLastNetwork = (chainId: number): void => {
  saveToStorage(STORAGE_KEYS.LAST_NETWORK, chainId);
};

/**
 * Get last network ID from localStorage
 */
export const getLastNetwork = (): number => {
  return loadFromStorage<number>(STORAGE_KEYS.LAST_NETWORK, false, 0);
};

/**
 * Save theme preference to localStorage
 */
export const saveThemePreference = (theme: 'light' | 'dark' | 'system'): void => {
  saveToStorage(STORAGE_KEYS.THEME_PREFERENCE, theme);
};

/**
 * Get theme preference from localStorage
 */
export const getThemePreference = (): 'light' | 'dark' | 'system' => {
  return loadFromStorage<'light' | 'dark' | 'system'>(STORAGE_KEYS.THEME_PREFERENCE, false, 'system');
};

export default {
  STORAGE_KEYS,
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  clearAllStorage,
  saveAuthToken,
  getAuthToken,
  removeAuthToken,
  saveUserPreferences,
  getUserPreferences,
  saveLastConnectedWallet,
  getLastConnectedWallet,
  saveLastNetwork,
  getLastNetwork,
  saveThemePreference,
  getThemePreference,
};
