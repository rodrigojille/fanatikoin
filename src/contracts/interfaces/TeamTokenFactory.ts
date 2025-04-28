import { Contract, Signer, Provider, BigNumberish, ContractTransaction } from 'ethers';
import TeamTokenFactoryABI from '../abis/TeamTokenFactory.json';

export class TeamTokenFactory {
  private contract: Contract;

  constructor(contractAddress: string, signer: Signer | Provider) {
    this.contract = new Contract(contractAddress, TeamTokenFactoryABI, signer);
  }

  /**
   * Create a new team token
   * @param name Token name
   * @param symbol Token symbol
   * @param description Token description
   * @param benefits Array of token benefits
   * @param initialSupply Initial token supply
   * @param maxSupply Maximum token supply
   * @param initialPrice Initial token price in CHZ
   */
  async createToken(
    name: string,
    symbol: string,
    description: string,
    benefits: string[],
    initialSupply: BigNumberish,
    maxSupply: BigNumberish,
    initialPrice: BigNumberish
  ): Promise<ContractTransaction> {
    return this.contract.createToken(
      name,
      symbol,
      description,
      benefits,
      initialSupply,
      maxSupply,
      initialPrice
    );
  }

  /**
   * Get all tokens created by a specific address
   * @param creator Creator address
   */
  async getTokensByCreator(creator: string): Promise<string[]> {
    return this.contract.getTokensByCreator(creator);
  }

  /**
   * Get all created tokens
   */
  async getAllTokens(): Promise<string[]> {
    return this.contract.getAllTokens();
  }

  /**
   * Get the total number of created tokens
   */
  async getTokenCount(): Promise<BigNumberish> {
    return this.contract.getTokenCount();
  }

  /**
   * Get the creator of a token
   * @param tokenAddress Token address
   */
  async getTokenCreator(tokenAddress: string): Promise<string> {
    return this.contract.tokenCreators(tokenAddress);
  }
}
