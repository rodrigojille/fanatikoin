import { Contract, Signer, Provider, BigNumberish, ContractTransaction } from 'ethers';
import TokenMarketplaceABI from '../abis/TokenMarketplace.json';

export class TokenMarketplace {
  private contract: Contract;

  constructor(contractAddress: string, signer: Signer | Provider) {
    this.contract = new Contract(contractAddress, TokenMarketplaceABI, signer);
  }

  /**
   * Get Chiliz token address
   */
  async chilizToken(): Promise<string> {
    return this.contract.chilizToken();
  }

  /**
   * Get platform fee rate
   */
  async platformFeeRate(): Promise<BigNumberish> {
    return this.contract.platformFeeRate();
  }

  /**
   * List a token for sale
   * @param tokenAddress Token address
   * @param price Token price in CHZ
   */
  async listToken(tokenAddress: string, price: BigNumberish): Promise<ContractTransaction> {
    return this.contract.listToken(tokenAddress, price);
  }

  /**
   * Delist a token from sale
   * @param tokenAddress Token address
   */
  async delistToken(tokenAddress: string): Promise<ContractTransaction> {
    return this.contract.delistToken(tokenAddress);
  }

  /**
   * Update token price
   * @param tokenAddress Token address
   * @param newPrice New token price in CHZ
   */
  async updateTokenPrice(tokenAddress: string, newPrice: BigNumberish): Promise<ContractTransaction> {
    return this.contract.updateTokenPrice(tokenAddress, newPrice);
  }

  /**
   * Buy tokens
   * @param tokenAddress Token address
   * @param amount Amount to buy
   */
  async buyTokens(tokenAddress: string, amount: BigNumberish): Promise<ContractTransaction> {
    return this.contract.buyTokens(tokenAddress, amount);
  }

  /**
   * Sell tokens
   * @param tokenAddress Token address
   * @param amount Amount to sell
   */
  async sellTokens(tokenAddress: string, amount: BigNumberish): Promise<ContractTransaction> {
    return this.contract.sellTokens(tokenAddress, amount);
  }

  /**
   * Get all listed tokens
   */
  async getAllTokens(): Promise<string[]> {
    return this.contract.getAllTokens();
  }

  /**
   * Check if a token is listed
   * @param tokenAddress Token address
   */
  async isTokenListed(tokenAddress: string): Promise<boolean> {
    return this.contract.listedTokens(tokenAddress);
  }

  /**
   * Get token price
   * @param tokenAddress Token address
   */
  async getTokenPrice(tokenAddress: string): Promise<BigNumberish> {
    return this.contract.tokenPrices(tokenAddress);
  }

  /**
   * Get token information
   * @param tokenAddress Token address
   */
  async getTokenInfo(tokenAddress: string): Promise<{
    isListed: boolean;
    price: BigNumberish;
    tokenName: string;
    tokenSymbol: string;
    tokenDescription: string;
    isVerified: boolean;
  }> {
    return this.contract.getTokenInfo(tokenAddress);
  }

  /**
   * Update platform fee (only owner)
   * @param newFeeRate New fee rate (in basis points, e.g., 250 = 2.5%)
   */
  async updatePlatformFee(newFeeRate: number): Promise<ContractTransaction> {
    return this.contract.updatePlatformFee(newFeeRate);
  }
}
