// Sustainable mock/stub for Web3AuthService
export interface IWeb3AuthService {
  initialize: () => Promise<boolean>;
  isLoggedIn: () => Promise<boolean>;
  connect: () => Promise<boolean>;
  getProvider: () => any;
  getUserInfo: () => Promise<{ email?: string }>;
  disconnect: () => Promise<void>;
  getChainId: () => Promise<number>;
  getBalance: () => Promise<number>;
  getAccounts: () => Promise<string[]>;
}

export const web3AuthService: IWeb3AuthService = {
  async initialize() { return false; },
  async isLoggedIn() { return false; },
  async connect() { return false; },
  getProvider() { return null; },
  async getUserInfo() { return {}; },
  async disconnect() { return; },
  async getChainId() { return 0; },
  async getBalance() { return 0; },
  async getAccounts() { return []; },
};

// DEPRECATED: Web3Auth integration removed. This file is now unused.













