import { BaseContract, BigNumberish } from "ethers";

export interface IERC20 extends BaseContract {
  connect(signer: any): this;
  approve(spender: string, amount: BigNumberish): Promise<any>;
  mint(to: string, amount: BigNumberish): Promise<any>;
  balanceOf(account: string): Promise<bigint>;
  getAddress(): Promise<string>;
}

export interface ITeamToken extends IERC20 {
  transfer(to: string, amount: BigNumberish): Promise<any>;
  connect(signer: any): this;
  purchaseTokens(amount: BigNumberish): Promise<any>;
  name(): Promise<string>;
  symbol(): Promise<string>;
  description(): Promise<string>;
  getBenefits(): Promise<string[]>;
  maxSupply(): Promise<bigint>;
  currentPrice(): Promise<bigint>;
  totalSupply(): Promise<bigint>;
  teamPoolCHZ(): Promise<bigint>;
  withdrawTeamCHZ(amount: BigNumberish): Promise<any>;
  withdrawCHZ(amount: BigNumberish): Promise<any>;
}

export interface IMockCHZ extends IERC20 {
  mint(address: string, amount: BigNumberish): Promise<any>;
  transfer(address: string, amount: BigNumberish): Promise<any>;
  getAddress(): Promise<string>;
}

export interface ITokenMarketplace extends BaseContract {
  connect(signer: any): this;
  listToken(token: string, price: BigNumberish): Promise<any>;
  listedTokens(token: string): Promise<boolean>;
  tokenPrices(token: string): Promise<bigint>;
  buyTokens(token: string, amount: BigNumberish): Promise<any>;
  getAddress(): Promise<string>;
}

export interface ITokenAuction extends BaseContract {
  connect(signer: any): this;
  createAuction(
    token: string,
    amount: BigNumberish,
    startingPrice: BigNumberish,
    duration: BigNumberish
  ): Promise<any>;
  getAuction(auctionId: BigNumberish): Promise<any>;
  placeBid(auctionId: BigNumberish, bidAmount: BigNumberish): Promise<any>;
  endAuction(auctionId: BigNumberish): Promise<any>;
  getAddress(): Promise<string>;
}
