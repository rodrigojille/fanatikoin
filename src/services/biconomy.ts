/**
 * Biconomy Service for Gasless Transactions
 * Based on Biconomy SDK v2.0 for Chiliz Chain
 * 
 * This service provides gasless transaction capabilities using Biconomy's
 * Account Abstraction infrastructure.
 */

import { Bundler } from '@biconomy/bundler';
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account';
import { BiconomyPaymaster } from '@biconomy/paymaster';
import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from '@biconomy/modules';
import { Wallet, ethers } from 'ethers';
import { CHILIZ_NETWORKS, getCurrentNetwork } from '@/config/chilizNetworks';

// Get Chiliz Chain configuration
const currentNetwork = getCurrentNetwork();
const chainId = currentNetwork.chainId;

// Biconomy configuration
const BICONOMY_API_KEY = process.env.NEXT_PUBLIC_BICONOMY_API_KEY || '';
const PAYMASTER_URL = `https://paymaster.biconomy.io/api/v1/${chainId}/${BICONOMY_API_KEY}`;

/**
 * Biconomy service for gasless transactions
 */
class BiconomyService {
  private bundler: any = null;
  private paymaster: any = null;
  private smartAccount: BiconomySmartAccountV2 | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private initialized = false;
  private smartAccountAddress: string | null = null;

  /**
   * Initialize Biconomy service
   * @param provider Ethers provider
   * @returns Promise resolving to true if initialization was successful
   */
  async initialize(provider: any): Promise<boolean> {
    try {
      if (this.initialized) {
        console.log('[Biconomy] Already initialized');
        return true;
      }

      if (!BICONOMY_API_KEY) {
        console.error('[Biconomy] API key is missing');
        return false;
      }

      console.log(`[Biconomy] Initializing for Chain ID: ${chainId}`);

      try {
        // Create provider and signer
        this.provider = new ethers.BrowserProvider(provider);
        const jsonRpcSigner = await this.provider.getSigner();
        
        // Create a compatible signer for Biconomy
        // We'll use a private key from the environment if available, otherwise use the JSON-RPC signer
        const privateKey = process.env.NEXT_PUBLIC_BICONOMY_SIGNER_PRIVATE_KEY;
        if (privateKey) {
          this.signer = new Wallet(privateKey, this.provider);
        } else {
          // This is a workaround for type compatibility
          // In a production environment, you should use a proper signer
          this.signer = jsonRpcSigner;
        }
        
        // Create bundler
        this.bundler = new Bundler({
          bundlerUrl: `https://bundler.biconomy.io/api/v2/${chainId}/${BICONOMY_API_KEY}`,
          chainId,
          entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        });

        // Create paymaster
        this.paymaster = new BiconomyPaymaster({
          paymasterUrl: PAYMASTER_URL,
        });

        // Create validation module
        const ownerShipModule = await ECDSAOwnershipValidationModule.create({
          signer: this.signer as any, // Type assertion to bypass type checking
          moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
        });

        // Create smart account
        this.smartAccount = await BiconomySmartAccountV2.create({
          chainId,
          bundler: this.bundler as any,
          paymaster: this.paymaster as any,
          entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
          defaultValidationModule: ownerShipModule as any,
          activeValidationModule: ownerShipModule as any,
        });

        // Get smart account address
        this.smartAccountAddress = await this.smartAccount.getAccountAddress();
        console.log(`[Biconomy] Smart Account Address: ${this.smartAccountAddress}`);

        this.initialized = true;
        return true;
      } catch (innerError) {
        console.error('[Biconomy] Setup error:', innerError);
        return false;
      }
    } catch (error) {
      console.error('[Biconomy] Initialization error:', error);
      return false;
    }
  }

  /**
   * Get smart account address
   * @returns Smart account address or null if not initialized
   */
  getSmartAccountAddress(): string | null {
    return this.smartAccountAddress;
  }

  /**
   * Check if Biconomy is initialized
   * @returns True if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Send a gasless transaction
   * @param to Recipient address
   * @param data Transaction data
   * @param value Transaction value (optional)
   * @returns Transaction hash
   */
  async sendGaslessTransaction(
    to: string,
    data: string,
    value: string = '0'
  ): Promise<string> {
    if (!this.initialized || !this.smartAccount) {
      throw new Error('Biconomy not initialized');
    }

    try {
      console.log(`[Biconomy] Preparing gasless transaction to ${to}`);

      // Create transaction
      const tx = {
        to,
        data,
        value: ethers.parseEther(value),
      };

      // Build user operation
      const userOp = await this.smartAccount.buildUserOp([tx]);
      
      // Get paymaster and data
      const biconomyPaymaster = this.smartAccount.paymaster as any;
      
      // Get fee quotes
      const feeQuotes = await biconomyPaymaster.getPaymasterFeeQuotesOrData(userOp, {
        mode: 'ERC20' as any,
        tokenList: [],
      });

      const feeQuote = feeQuotes.feeQuotes?.[0];
      if (!feeQuote) {
        throw new Error('No fee quotes available');
      }
      
      // Set paymaster data
      const paymasterServiceData = {
        mode: 'ERC20' as any,
        feeTokenAddress: feeQuote.tokenAddress,
        calculateGasLimits: true,
      };
      
      const paymasterAndDataWithLimits = await biconomyPaymaster.getPaymasterAndData(
        userOp,
        paymasterServiceData
      );
      
      userOp.paymasterAndData = paymasterAndDataWithLimits.paymasterAndData;
      
      // If gas limits are returned, use them
      if (
        paymasterAndDataWithLimits.callGasLimit &&
        paymasterAndDataWithLimits.verificationGasLimit &&
        paymasterAndDataWithLimits.preVerificationGas
      ) {
        userOp.callGasLimit = paymasterAndDataWithLimits.callGasLimit;
        userOp.verificationGasLimit = paymasterAndDataWithLimits.verificationGasLimit;
        userOp.preVerificationGas = paymasterAndDataWithLimits.preVerificationGas;
      }
      
      // Send user operation
      const userOpResponse = await this.smartAccount.sendUserOp(userOp);
      
      // Get transaction hash
      const transactionDetails = await userOpResponse.wait();
      
      console.log('[Biconomy] Transaction hash:', transactionDetails.receipt.transactionHash);
      
      return transactionDetails.receipt.transactionHash;
    } catch (error) {
      console.error('[Biconomy] Error sending gasless transaction:', error);
      throw error;
    }
  }

  /**
   * Send a token transfer using gasless transaction
   * @param tokenAddress ERC20 token address
   * @param recipient Recipient address
   * @param amount Amount to transfer (in token units)
   * @returns Transaction hash
   */
  async sendTokenTransfer(
    tokenAddress: string,
    recipient: string,
    amount: string
  ): Promise<string> {
    if (!this.initialized || !this.smartAccount) {
      throw new Error('Biconomy not initialized');
    }

    try {
      console.log(`[Biconomy] Preparing token transfer of ${amount} tokens to ${recipient}`);

      // ERC20 interface for transfer function
      const erc20Interface = new ethers.Interface([
        'function transfer(address to, uint256 amount) returns (bool)',
      ]);

      // Encode transfer function data
      const data = erc20Interface.encodeFunctionData('transfer', [
        recipient,
        ethers.parseUnits(amount, 18), // Assuming 18 decimals
      ]);

      // Send gasless transaction
      return await this.sendGaslessTransaction(tokenAddress, data);
    } catch (error) {
      console.error('[Biconomy] Error sending token transfer:', error);
      throw error;
    }
  }


}

// Create and export singleton instance
const biconomyService = new BiconomyService();
export default biconomyService;
