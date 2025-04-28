// DEPRECATED: Web3Auth integration removed. This file is now unused.
// All logic and imports have been removed as the project now uses MetaMask exclusively for wallet integration.
// This file remains only for historical reference and should not be used or imported anywhere in the codebase.
      console.error("[Web3Auth] Initialization error:", error);
      return false;
    }
  }

  public async connect(): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      if (!this.web3auth) {
        console.error("[Web3Auth] Web3Auth not initialized");
        return false;
      }
      const connectPromise = this.web3auth.connect();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Web3Auth connection timed out")), 30000);
      });
      this.provider = await Promise.race([connectPromise, timeoutPromise]) as any;
      if (!this.provider) {
        console.error("[Web3Auth] Provider is null after connection");
        return false;
      }
      this.ethersProvider = new Web3Provider(this.provider as any);
      try {
        const userInfo = await this.web3auth.getUserInfo();
        this.user = userInfo;
      } catch (error) {
        console.error("[Web3Auth] Error getting user info after connection:", error);
      }
      try {
        const chainId = await this.getChainId();
        if (chainId !== CHAIN_ID) {
          console.warn(`[Web3Auth] Connected to chain ID ${chainId}, but expected ${CHAIN_ID}`);
        }
      } catch (error) {
        console.error("[Web3Auth] Error getting chain ID:", error);
      }
      return true;
    } catch (error) {
      console.error("[Web3Auth] Connection error:", error);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.web3auth) {
      console.error("[Web3Auth] Web3Auth not initialized");
      return;
    }
    try {
      await this.web3auth.logout();
      this.provider = null;
      this.ethersProvider = null;
      this.user = {};
      console.log("[Web3Auth] Disconnected");
    } catch (error) {
      console.error("[Web3Auth] Error during disconnect:", error);
    }
  }

  public getProvider(): any {
    return this.provider;
  }

  public async getUserInfo(): Promise<Partial<UserInfo>> {
    if (!this.web3auth) {
      console.error("[Web3Auth] Web3Auth not initialized yet");
      return {};
    }
    try {
      const userInfo = await this.web3auth.getUserInfo();
      return userInfo;
    } catch (error) {
      console.error("[Web3Auth] Error getting user info:", error);
      return {};
    }
  }

  public async getAccounts(): Promise<string[]> {
    try {
      if (!this.provider) {
        console.error("[Web3Auth] Provider not initialized");
        return [];
      }
      if (!this.ethersProvider) {
        this.ethersProvider = new Web3Provider(this.provider as any);
      }
      const signer = this.ethersProvider.getSigner();
      const address = await signer.getAddress();
      return [address];
    } catch (error) {
      console.error("[Web3Auth] Error getting accounts:", error);
      return [];
    }
  }

  public async getChainId(): Promise<number> {
    try {
      if (!this.provider) {
        console.error("[Web3Auth] Provider not initialized");
        return CHAIN_ID;
      }
      if (!this.ethersProvider) {
        this.ethersProvider = new Web3Provider(this.provider as any);
      }
      const network = await this.ethersProvider.getNetwork();
      return network.chainId;
    } catch (error) {
      console.error("[Web3Auth] Error getting chain ID:", error);
      return CHAIN_ID;
    }
  }

  public async getBalance(): Promise<string> {
    try {
      if (!this.provider) {
        console.error("[Web3Auth] Provider not initialized");
        return "0";
      }
      if (!this.ethersProvider) {
        this.ethersProvider = new Web3Provider(this.provider as any);
      }
      const accounts = await this.getAccounts();
      if (accounts.length === 0) {
        return "0";
      }
      const balance = await this.ethersProvider.getBalance(accounts[0]);
      return formatEther(balance);
    } catch (error) {
      console.error("[Web3Auth] Error getting balance:", error);
      return "0";
    }
  }

  public async getEthersProvider(): Promise<Web3Provider> {
    if (!this.provider) {
      throw new Error("[Web3Auth] Provider not initialized");
    }
    if (!this.ethersProvider) {
      this.ethersProvider = new Web3Provider(this.provider as any);
    }
    return this.ethersProvider;
  }

  public async getSigner(): Promise<ethers.Signer> {
    const provider = await this.getEthersProvider();
    return provider.getSigner();
  }

  public async isLoggedIn(): Promise<boolean> {
    if (!this.web3auth) {
      return false;
    }
    return this.web3auth.connected;
  }
}

      const chainConfig = {
        chainId: CHAIN_ID,
        rpcTarget: RPC_URL,
        displayName: 'Chiliz Spicy Testnet',
        blockExplorerUrl: BLOCK_EXPLORER_URL,
        ticker: 'CHZ',
        tickerName: 'Chiliz',
      };

      // Create private key provider
      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig },
      });

      // Create Web3Auth instance
      this.web3auth = new Web3Auth({
        clientId: WEB3AUTH_CLIENT_ID,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // Using DEVNET for better compatibility
        privateKeyProvider: privateKeyProvider,
        chainConfig: chainConfig,
        uiConfig: {
          appLogo: "https://fanatikoin-web3.windsurf.build/favicon.ico",
          loginMethodsOrder: ["google", "facebook", "twitter", "email_passwordless"],
          // Theme is handled differently in newer versions
          mode: "dark"
        } as any,
      });
      
      // Double-check that web3auth was created successfully
      if (!this.web3auth) {
        console.error("[Web3Auth] Failed to create Web3Auth instance");
        throw new Error("Failed to create Web3Auth instance");
      }

      // Configure modal
      this.web3auth.configureAdapter({
        adapterSettings: {
          loginConfig: {
            google: {
              name: "Google",
              verifier: "google",
              typeOfLogin: "google",
              clientId: WEB3AUTH_CLIENT_ID,
            },
          },
        },
      });

      try {
        await this.web3auth.initModal({
          modalConfig: {
            [WALLET_ADAPTERS.OPENLOGIN]: {
              label: "openlogin",
              loginMethods: {
                google: {
                  name: "Google",
                  showOnModal: true,
                },
                facebook: {
                  name: "Facebook",
                  showOnModal: true,
                },
                twitter: {
                  name: "Twitter",
                  showOnModal: true,
                },
                email_passwordless: {
                  name: "Email",
                  showOnModal: true,
                },
              },
              showOnModal: true,
            },
          },
        });
        
        console.log("[Web3Auth] Initialized successfully");
        this.initialized = true;
        return true;
      } catch (error) {
        console.error("[Web3Auth] Error initializing modal:", error);
        return false;
      }
    } catch (error) {
      console.error("[Web3Auth] Initialization error:", error);
      return false;
    }
  }

  /**
   * Connect to Web3Auth
   */
  async connect(): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.web3auth) {
        console.error("[Web3Auth] Web3Auth not initialized");
        return false;
      }

      // Connect with timeout
      console.log("[Web3Auth] Connecting to wallet...");
      const connectPromise = this.web3auth.connect();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Web3Auth connection timed out")), 30000);
      });
      
      this.provider = await Promise.race([connectPromise, timeoutPromise]) as SafeEventEmitterProvider;
      
      if (!this.provider) {
        console.error("[Web3Auth] Provider is null after connection");
        return false;
      }
      
      console.log("[Web3Auth] Connected successfully");
      
      // Create ethers provider from Web3Auth provider
      this.ethersProvider = new Web3Provider(this.provider as any);
      
      // Get user info after connection
      try {
        const userInfo = await this.web3auth.getUserInfo();
        this.user = userInfo;
        console.log("[Web3Auth] User info retrieved after connection");
      } catch (error) {
        console.error("[Web3Auth] Error getting user info after connection:", error);
      }
      
      // Verify chain ID
      try {
        const chainId = await this.getChainId();
        console.log(`[Web3Auth] Connected to chain ID: ${chainId}`);
        
        // Verify we're on the correct network
        if (chainId !== CHAIN_ID) {
          console.warn(`[Web3Auth] Connected to chain ID ${chainId}, but expected ${CHAIN_ID}`);
        }
      } catch (error) {
        console.error("[Web3Auth] Error getting chain ID:", error);
      }
      
      return true;
    } catch (error) {
      console.error("[Web3Auth] Connection error:", error);
      return false;
    }
  }

  /**
   * Disconnect from Web3Auth
   */
  async disconnect(): Promise<void> {
    if (!this.web3auth) {
      console.error("[Web3Auth] Web3Auth not initialized");
      return;
    }

    try {
      await this.web3auth.logout();
      this.provider = null;
      this.ethersProvider = null;
      this.user = {};
      console.log("[Web3Auth] Disconnected");
    } catch (error) {
      console.error("[Web3Auth] Error during disconnect:", error);
    }
  }

  /**
   * Get Web3Auth provider
   */
  getProvider(): SafeEventEmitterProvider | null {
    return this.provider;
  }

  /**
   * Get user info from Web3Auth
   */
  async getUserInfo(): Promise<Partial<UserInfo>> {
    if (!this.web3auth) {
      console.error("[Web3Auth] Web3Auth not initialized yet");
      return {};
    }

    try {
      const userInfo = await this.web3auth.getUserInfo();
      console.log("[Web3Auth] User info:", userInfo);
      return userInfo;
    } catch (error) {
      console.error("[Web3Auth] Error getting user info:", error);
      return {};
    }
  }

  /**
   * Get connected accounts
   */
  async getAccounts(): Promise<string[]> {
    try {
      if (!this.provider) {
        console.error("[Web3Auth] Provider not initialized");
        return [];
      }

      if (!this.ethersProvider) {
        this.ethersProvider = new Web3Provider(this.provider as any);
      }

      const signer = this.ethersProvider.getSigner();
      const address = await signer.getAddress();
      return [address];
    } catch (error) {
      console.error("[Web3Auth] Error getting accounts:", error);
      return [];
    }
  }

  /**
   * Get current chain ID
   */
  async getChainId(): Promise<number> {
    try {
      if (!this.provider) {
        console.error("[Web3Auth] Provider not initialized");
        return CHAIN_ID; // Default to configured chain ID
      }

      if (!this.ethersProvider) {
        this.ethersProvider = new Web3Provider(this.provider as any);
      }

      const network = await this.ethersProvider.getNetwork();
      return network.chainId;
    } catch (error) {
      console.error("[Web3Auth] Error getting chain ID:", error);
      return CHAIN_ID; // Default to configured chain ID
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<string> {
    try {
      if (!this.provider) {
        console.error("[Web3Auth] Provider not initialized");
        return "0";
      }

      if (!this.ethersProvider) {
        this.ethersProvider = new Web3Provider(this.provider as any);
      }

      const accounts = await this.getAccounts();
      if (accounts.length === 0) {
        return "0";
      }

      const balance = await this.ethersProvider.getBalance(accounts[0]);
      return formatEther(balance);
    } catch (error) {
      console.error("[Web3Auth] Error getting balance:", error);
      return "0";
    }
  }

  /**
   * Get ethers provider
   */
  async getEthersProvider(): Promise<Web3Provider> {
    if (!this.provider) {
      throw new Error("[Web3Auth] Provider not initialized");
    }

    if (!this.ethersProvider) {
      this.ethersProvider = new Web3Provider(this.provider as any);
    }

    return this.ethersProvider;
  }

  /**
   * Get signer
   */
  async getSigner(): Promise<ethers.Signer> {
    const provider = await this.getEthersProvider();
    return provider.getSigner();
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    if (!this.web3auth) {
      return false;
    }
    
    return this.web3auth.connected;
  }
}

// Export a singleton instance of Web3AuthService
export const web3AuthService = Web3AuthService.getInstance();
export default web3AuthService;
