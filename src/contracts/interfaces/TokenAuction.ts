import { Contract, Signer, Provider, BigNumberish, ContractTransaction } from 'ethers';
import TokenAuctionABI from '../abis/TokenAuction.json';

export interface Auction {
  tokenAddress: string;
  creator: string;
  highestBidder: string;
  tokenAmount: BigNumberish;
  startingPrice: BigNumberish;
  highestBid: BigNumberish;
  endTime: BigNumberish;
  ended: boolean;
}

export class TokenAuction {
  private contract: Contract;

  constructor(contractAddress: string, signer: Signer | Provider) {
    this.contract = new Contract(contractAddress, TokenAuctionABI, signer);
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
   * Get next auction ID
   */
  async nextAuctionId(): Promise<BigNumberish> {
    return this.contract.nextAuctionId();
  }

  /**
   * Create a new auction
   * @param tokenAddress Token address
   * @param tokenAmount Amount of tokens to auction
   * @param startingPrice Starting price in CHZ
   * @param duration Auction duration in seconds
   */
  async createAuction(
    tokenAddress: string,
    tokenAmount: BigNumberish,
    startingPrice: BigNumberish,
    duration: number
  ): Promise<ContractTransaction> {
    return this.contract.createAuction(tokenAddress, tokenAmount, startingPrice, duration);
  }

  /**
   * Place a bid on an auction
   * @param auctionId Auction ID
   */
  async bid(auctionId: BigNumberish): Promise<ContractTransaction> {
    return this.contract.bid(auctionId);
  }

  /**
   * End an auction
   * @param auctionId Auction ID
   */
  async endAuction(auctionId: BigNumberish): Promise<ContractTransaction> {
    return this.contract.endAuction(auctionId);
  }

  /**
   * Get auction details
   * @param auctionId Auction ID
   */
  async getAuction(auctionId: BigNumberish): Promise<Auction> {
    return this.contract.auctions(auctionId);
  }

  /**
   * Get all active auctions
   */
  async getActiveAuctions(): Promise<BigNumberish[]> {
    return this.contract.getActiveAuctions();
  }

  /**
   * Get auctions created by a specific address
   * @param creator Creator address
   */
  async getAuctionsByCreator(creator: string): Promise<BigNumberish[]> {
    return this.contract.getAuctionsByCreator(creator);
  }

  /**
   * Update platform fee (only owner)
   * @param newFeeRate New fee rate (in basis points, e.g., 250 = 2.5%)
   */
  async updatePlatformFee(newFeeRate: number): Promise<ContractTransaction> {
    return this.contract.updatePlatformFee(newFeeRate);
  }
}
