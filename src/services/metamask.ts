import { BrowserProvider, formatEther } from "ethers";

// Environment variables
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://spicy-rpc.chiliz.com/";
const BLOCK_EXPLORER_URL = "https://spicy.chiliscan.com/";
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "88882");
const CHAIN_ID_HEX = `0x${CHAIN_ID.toString(16)}`;

/**
 * MetaMask service for wallet connection and management
 */
type MetaMaskEvent =
  | { type: 'connected'; address: string; chainId: number }
  | { type: 'disconnected' }
  | { type: 'accountChanged'; address: string }
  | { type: 'chainChanged'; chainId: number }
  | { type: 'error'; error: any };

class MetaMaskService {
  private provider: BrowserProvider | null = null;
  private connected: boolean = false;
  private address: string | null = null;
  private chainId: number | null = null;
  private static instance: MetaMaskService;

  // Event listeners for UI
  private listeners: ((event: MetaMaskEvent) => void)[] = [];

  // Bound handlers for event removal
  private handleAccountsChangedBound = this.handleAccountsChanged.bind(this);
  private handleChainChangedBound = this.handleChainChanged.bind(this);
  private handleDisconnectBound = this.handleDisconnect.bind(this);

  /**
   * Subscribe to MetaMask events (UI should use this)
   */
  public on(listener: (event: MetaMaskEvent) => void) {
    this.listeners.push(listener);
  }

  /**
   * Unsubscribe from MetaMask events
   */
  public off(listener: (event: MetaMaskEvent) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private emit(event: MetaMaskEvent) {
    for (const l of this.listeners) l(event);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): MetaMaskService {
    if (!MetaMaskService.instance) {
      MetaMaskService.instance = new MetaMaskService();
    }
    return MetaMaskService.instance;
  }

  /**
   * Check if MetaMask is available
   */
  isMetaMaskAvailable(): boolean {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
  }

  /**
   * Check if connected to MetaMask
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Connect to MetaMask
   */
  async connect(): Promise<boolean> {
    try {
      if (!this.isMetaMaskAvailable()) {
        console.error("[MetaMask] MetaMask not available");
        throw new Error("MetaMask is not installed. Please install MetaMask extension and try again.");
      }

      console.log("[MetaMask] Connecting to wallet...");

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        console.error("[MetaMask] No accounts found");
        return false;
      }

      this.address = accounts[0];
      console.log(`[MetaMask] Connected to account: ${this.address}`);

      // Initialize provider
      this.provider = new BrowserProvider(window.ethereum, {
        name: "Chiliz Spicy Testnet",
        chainId: CHAIN_ID
      });

      // Get chain ID
      const network = await this.provider?.getNetwork() || { chainId: 0 };
      this.chainId = Number(network.chainId);
      console.log(`[MetaMask] Chain ID: ${this.chainId}`);

      // Check if on correct network
      if (this.chainId !== CHAIN_ID) {
        console.warn(`[MetaMask] Wrong network. Expected ${CHAIN_ID}, got ${this.chainId}`);
        
        // Try to switch to the correct network
        try {
          await this.switchToChilizNetwork();
        } catch (switchError) {
          console.error("[MetaMask] Failed to switch network:", switchError);
          this.emit({ type: 'error', error: switchError });
          return false;
        }
      }

      // Set up event listeners
      window.ethereum.on('accountsChanged', this.handleAccountsChangedBound);
      window.ethereum.on('chainChanged', this.handleChainChangedBound);
      window.ethereum.on('disconnect', this.handleDisconnectBound);

      this.connected = true;
      this.emit({ type: 'connected', address: this.address || '', chainId: this.chainId! });
      return true;
    } catch (error) {
      console.error("[MetaMask] Connection error:", error);
      this.emit({ type: 'error', error });
      return false;
    }
  }

  /**
   * Disconnect from MetaMask
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.address = null;
    this.provider = null;
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', this.handleAccountsChangedBound);
      window.ethereum.removeListener('chainChanged', this.handleChainChangedBound);
      window.ethereum.removeListener('disconnect', this.handleDisconnectBound);
    }
    this.emit({ type: 'disconnected' });
    
    console.log("[MetaMask] Disconnected");
  }

  /**
   * Switch to Chiliz Spicy Testnet
   */
  async switchToChilizNetwork(): Promise<boolean> {
    if (!window.ethereum) {
      return false;
    }

    try {
      // Try to switch to the Chiliz network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID_HEX }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: CHAIN_ID_HEX,
                chainName: 'Chiliz Spicy Testnet',
                nativeCurrency: {
                  name: 'Chiliz',
                  symbol: 'CHZ',
                  decimals: 18,
                },
                rpcUrls: [RPC_URL],
                blockExplorerUrls: [BLOCK_EXPLORER_URL],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("[MetaMask] Error adding Chiliz network:", addError);
          return false;
        }
      }
      console.error("[MetaMask] Error switching to Chiliz network:", switchError);
      return false;
    }
  }

  /**
   * Get connected account address
   */
  getAddress(): string | null {
    return this.address;
  }

  /**
   * Get current chain ID
   */
  getChainId(): number | null {
    return this.chainId;
  }

  /**
   * Get provider
   */
  getProvider(): BrowserProvider | null {
    return this.provider;
  }

  /**
   * Get signer
   */
  async getSigner() {
    if (!this.provider) {
      return null;
    }
    return await this.provider.getSigner();
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<string> {
    try {
      if (!this.provider || !this.address) {
        return "0";
      }

      const balance = await this.provider.getBalance(this.address);
      return formatEther(balance);
    } catch (error) {
      console.error("[MetaMask] Error getting balance:", error);
      return "0";
    }
  }

  /**
   * Handle accounts changed event
   */
  private handleAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) {
      // User disconnected their wallet
      this.disconnect();
    } else if (this.address !== accounts[0]) {
      // User switched accounts
      this.address = accounts[0];
      console.log(`[MetaMask] Account changed to: ${this.address}`);
      this.emit({ type: 'accountChanged', address: this.address });
    }
  }

  /**
   * Handle chain changed event
   */
  private handleChainChanged(chainIdHex: string): void {
    // Emit chainChanged event and force UI to handle
    const chainId = parseInt(chainIdHex, 16);
    this.chainId = chainId;
    this.emit({ type: 'chainChanged', chainId });
    // Optionally, force page reload (legacy behavior)
    // window.location.reload();
  }

  /**
   * Handle disconnect event
   */
  private handleDisconnect(error: { code: number; message: string }): void {
    console.log("[MetaMask] Disconnect event:", error);
    this.disconnect();
  }
}

// Export singleton instance
export const metamaskService = MetaMaskService.getInstance();
export default metamaskService;
