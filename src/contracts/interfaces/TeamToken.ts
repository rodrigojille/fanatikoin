import { Contract, Signer, Provider, BigNumberish, ContractTransaction } from 'ethers';
import TeamTokenABI from '../abis/TeamToken.json';

export class TeamToken {
  private contract: Contract;

  constructor(contractAddress: string, signer: Signer | Provider) {
    this.contract = new Contract(contractAddress, TeamTokenABI, signer);
  }

  /**
   * Get token name
   */
  async name(): Promise<string> {
    return this.contract.name();
  }

  /**
   * Get token symbol
   */
  async symbol(): Promise<string> {
    return this.contract.symbol();
  }

  /**
   * Get token description
   */
  async description(): Promise<string> {
    return this.contract.description();
  }

  /**
   * Get token benefits
   */
  async benefits(): Promise<string[]> {
    return this.contract.benefits();
  }

  /**
   * Get token total supply
   */
  async totalSupply(): Promise<BigNumberish> {
    return this.contract.totalSupply();
  }

  /**
   * Get token max supply
   */
  async maxSupply(): Promise<BigNumberish> {
    return this.contract.maxSupply();
  }

  /**
   * Get token initial price
   */
  async initialPrice(): Promise<BigNumberish> {
    return this.contract.initialPrice();
  }

  /**
   * Get token verification status
   */
  async isVerified(): Promise<boolean> {
    return this.contract.isVerified();
  }

  /**
   * Get token balance of an address
   * @param address User address
   */
  async balanceOf(address: string): Promise<BigNumberish> {
    return this.contract.balanceOf(address);
  }

  /**
   * Get token allowance
   * @param owner Owner address
   * @param spender Spender address
   */
  async allowance(owner: string, spender: string): Promise<BigNumberish> {
    return this.contract.allowance(owner, spender);
  }

  /**
   * Approve spender to spend tokens
   * @param spender Spender address
   * @param amount Amount to approve
   */
  async approve(spender: string, amount: BigNumberish): Promise<ContractTransaction> {
    return this.contract.approve(spender, amount);
  }

  /**
   * Transfer tokens to another address
   * @param to Recipient address
   * @param amount Amount to transfer
   */
  async transfer(to: string, amount: BigNumberish): Promise<ContractTransaction> {
    return this.contract.transfer(to, amount);
  }

  /**
   * Transfer tokens from one address to another
   * @param from Sender address
   * @param to Recipient address
   * @param amount Amount to transfer
   */
  async transferFrom(from: string, to: string, amount: BigNumberish): Promise<ContractTransaction> {
    return this.contract.transferFrom(from, to, amount);
  }

  /**
   * Mint new tokens (only owner)
   * @param to Recipient address
   * @param amount Amount to mint
   */
  async mint(to: string, amount: BigNumberish): Promise<ContractTransaction> {
    return this.contract.mint(to, amount);
  }

  /**
   * Burn tokens
   * @param amount Amount to burn
   */
  async burn(amount: BigNumberish): Promise<ContractTransaction> {
    return this.contract.burn(amount);
  }

  /**
   * Update token description (only owner)
   * @param newDescription New description
   */
  async updateDescription(newDescription: string): Promise<ContractTransaction> {
    return this.contract.updateDescription(newDescription);
  }

  /**
   * Add token benefit (only owner)
   * @param benefit New benefit
   */
  async addBenefit(benefit: string): Promise<ContractTransaction> {
    return this.contract.addBenefit(benefit);
  }

  /**
   * Remove token benefit (only owner)
   * @param index Benefit index
   */
  async removeBenefit(index: number): Promise<ContractTransaction> {
    return this.contract.removeBenefit(index);
  }

  /**
   * Set token verification status (only owner)
   * @param verified Verification status
   */
  async setVerified(verified: boolean): Promise<ContractTransaction> {
    return this.contract.setVerified(verified);
  }
}
