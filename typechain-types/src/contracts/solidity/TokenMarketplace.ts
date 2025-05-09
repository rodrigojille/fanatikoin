/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../../common";

export interface TokenMarketplaceInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "buyTokens"
      | "chilizToken"
      | "delistToken"
      | "getAllTokens"
      | "getTokenInfo"
      | "listToken"
      | "listedTokens"
      | "listedTokensCount"
      | "owner"
      | "paused"
      | "platformFeeRate"
      | "renounceOwnership"
      | "sellTokens"
      | "tokenPrices"
      | "tokenSellers"
      | "transferOwnership"
      | "updatePlatformFee"
      | "updateTokenPrice"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "OwnershipTransferred"
      | "Paused"
      | "PlatformFeeUpdated"
      | "TokenDelisted"
      | "TokenListed"
      | "TokenPriceUpdated"
      | "TokenPurchased"
      | "TokenSold"
      | "Unpaused"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "buyTokens",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "chilizToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "delistToken",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getAllTokens",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenInfo",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "listToken",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "listedTokens",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "listedTokensCount",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "paused", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "platformFeeRate",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "sellTokens",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenPrices",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenSellers",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "updatePlatformFee",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "updateTokenPrice",
    values: [AddressLike, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "buyTokens", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "chilizToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "delistToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAllTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "listToken", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "listedTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "listedTokensCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "platformFeeRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "sellTokens", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "tokenPrices",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokenSellers",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updatePlatformFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateTokenPrice",
    data: BytesLike
  ): Result;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace PausedEvent {
  export type InputTuple = [account: AddressLike];
  export type OutputTuple = [account: string];
  export interface OutputObject {
    account: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace PlatformFeeUpdatedEvent {
  export type InputTuple = [newFeeRate: BigNumberish];
  export type OutputTuple = [newFeeRate: bigint];
  export interface OutputObject {
    newFeeRate: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TokenDelistedEvent {
  export type InputTuple = [tokenAddress: AddressLike];
  export type OutputTuple = [tokenAddress: string];
  export interface OutputObject {
    tokenAddress: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TokenListedEvent {
  export type InputTuple = [tokenAddress: AddressLike, price: BigNumberish];
  export type OutputTuple = [tokenAddress: string, price: bigint];
  export interface OutputObject {
    tokenAddress: string;
    price: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TokenPriceUpdatedEvent {
  export type InputTuple = [tokenAddress: AddressLike, newPrice: BigNumberish];
  export type OutputTuple = [tokenAddress: string, newPrice: bigint];
  export interface OutputObject {
    tokenAddress: string;
    newPrice: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TokenPurchasedEvent {
  export type InputTuple = [
    buyer: AddressLike,
    tokenAddress: AddressLike,
    amount: BigNumberish,
    price: BigNumberish
  ];
  export type OutputTuple = [
    buyer: string,
    tokenAddress: string,
    amount: bigint,
    price: bigint
  ];
  export interface OutputObject {
    buyer: string;
    tokenAddress: string;
    amount: bigint;
    price: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TokenSoldEvent {
  export type InputTuple = [
    seller: AddressLike,
    tokenAddress: AddressLike,
    amount: BigNumberish,
    price: BigNumberish
  ];
  export type OutputTuple = [
    seller: string,
    tokenAddress: string,
    amount: bigint,
    price: bigint
  ];
  export interface OutputObject {
    seller: string;
    tokenAddress: string;
    amount: bigint;
    price: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UnpausedEvent {
  export type InputTuple = [account: AddressLike];
  export type OutputTuple = [account: string];
  export interface OutputObject {
    account: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface TokenMarketplace extends BaseContract {
  connect(runner?: ContractRunner | null): TokenMarketplace;
  waitForDeployment(): Promise<this>;

  interface: TokenMarketplaceInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  buyTokens: TypedContractMethod<
    [tokenAddress: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  chilizToken: TypedContractMethod<[], [string], "view">;

  delistToken: TypedContractMethod<
    [tokenAddress: AddressLike],
    [void],
    "nonpayable"
  >;

  getAllTokens: TypedContractMethod<[], [string[]], "view">;

  getTokenInfo: TypedContractMethod<
    [tokenAddress: AddressLike],
    [
      [boolean, bigint, string, string, string] & {
        isListed: boolean;
        price: bigint;
        tokenName: string;
        tokenSymbol: string;
        tokenDescription: string;
      }
    ],
    "view"
  >;

  listToken: TypedContractMethod<
    [tokenAddress: AddressLike, price: BigNumberish],
    [void],
    "nonpayable"
  >;

  listedTokens: TypedContractMethod<[arg0: AddressLike], [boolean], "view">;

  listedTokensCount: TypedContractMethod<[], [bigint], "view">;

  owner: TypedContractMethod<[], [string], "view">;

  paused: TypedContractMethod<[], [boolean], "view">;

  platformFeeRate: TypedContractMethod<[], [bigint], "view">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  sellTokens: TypedContractMethod<
    [tokenAddress: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  tokenPrices: TypedContractMethod<[arg0: AddressLike], [bigint], "view">;

  tokenSellers: TypedContractMethod<[arg0: AddressLike], [string], "view">;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  updatePlatformFee: TypedContractMethod<
    [newFeeRate: BigNumberish],
    [void],
    "nonpayable"
  >;

  updateTokenPrice: TypedContractMethod<
    [tokenAddress: AddressLike, newPrice: BigNumberish],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "buyTokens"
  ): TypedContractMethod<
    [tokenAddress: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "chilizToken"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "delistToken"
  ): TypedContractMethod<[tokenAddress: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "getAllTokens"
  ): TypedContractMethod<[], [string[]], "view">;
  getFunction(
    nameOrSignature: "getTokenInfo"
  ): TypedContractMethod<
    [tokenAddress: AddressLike],
    [
      [boolean, bigint, string, string, string] & {
        isListed: boolean;
        price: bigint;
        tokenName: string;
        tokenSymbol: string;
        tokenDescription: string;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "listToken"
  ): TypedContractMethod<
    [tokenAddress: AddressLike, price: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "listedTokens"
  ): TypedContractMethod<[arg0: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "listedTokensCount"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "paused"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "platformFeeRate"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "sellTokens"
  ): TypedContractMethod<
    [tokenAddress: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "tokenPrices"
  ): TypedContractMethod<[arg0: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "tokenSellers"
  ): TypedContractMethod<[arg0: AddressLike], [string], "view">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "updatePlatformFee"
  ): TypedContractMethod<[newFeeRate: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "updateTokenPrice"
  ): TypedContractMethod<
    [tokenAddress: AddressLike, newPrice: BigNumberish],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "Paused"
  ): TypedContractEvent<
    PausedEvent.InputTuple,
    PausedEvent.OutputTuple,
    PausedEvent.OutputObject
  >;
  getEvent(
    key: "PlatformFeeUpdated"
  ): TypedContractEvent<
    PlatformFeeUpdatedEvent.InputTuple,
    PlatformFeeUpdatedEvent.OutputTuple,
    PlatformFeeUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "TokenDelisted"
  ): TypedContractEvent<
    TokenDelistedEvent.InputTuple,
    TokenDelistedEvent.OutputTuple,
    TokenDelistedEvent.OutputObject
  >;
  getEvent(
    key: "TokenListed"
  ): TypedContractEvent<
    TokenListedEvent.InputTuple,
    TokenListedEvent.OutputTuple,
    TokenListedEvent.OutputObject
  >;
  getEvent(
    key: "TokenPriceUpdated"
  ): TypedContractEvent<
    TokenPriceUpdatedEvent.InputTuple,
    TokenPriceUpdatedEvent.OutputTuple,
    TokenPriceUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "TokenPurchased"
  ): TypedContractEvent<
    TokenPurchasedEvent.InputTuple,
    TokenPurchasedEvent.OutputTuple,
    TokenPurchasedEvent.OutputObject
  >;
  getEvent(
    key: "TokenSold"
  ): TypedContractEvent<
    TokenSoldEvent.InputTuple,
    TokenSoldEvent.OutputTuple,
    TokenSoldEvent.OutputObject
  >;
  getEvent(
    key: "Unpaused"
  ): TypedContractEvent<
    UnpausedEvent.InputTuple,
    UnpausedEvent.OutputTuple,
    UnpausedEvent.OutputObject
  >;

  filters: {
    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    "Paused(address)": TypedContractEvent<
      PausedEvent.InputTuple,
      PausedEvent.OutputTuple,
      PausedEvent.OutputObject
    >;
    Paused: TypedContractEvent<
      PausedEvent.InputTuple,
      PausedEvent.OutputTuple,
      PausedEvent.OutputObject
    >;

    "PlatformFeeUpdated(uint256)": TypedContractEvent<
      PlatformFeeUpdatedEvent.InputTuple,
      PlatformFeeUpdatedEvent.OutputTuple,
      PlatformFeeUpdatedEvent.OutputObject
    >;
    PlatformFeeUpdated: TypedContractEvent<
      PlatformFeeUpdatedEvent.InputTuple,
      PlatformFeeUpdatedEvent.OutputTuple,
      PlatformFeeUpdatedEvent.OutputObject
    >;

    "TokenDelisted(address)": TypedContractEvent<
      TokenDelistedEvent.InputTuple,
      TokenDelistedEvent.OutputTuple,
      TokenDelistedEvent.OutputObject
    >;
    TokenDelisted: TypedContractEvent<
      TokenDelistedEvent.InputTuple,
      TokenDelistedEvent.OutputTuple,
      TokenDelistedEvent.OutputObject
    >;

    "TokenListed(address,uint256)": TypedContractEvent<
      TokenListedEvent.InputTuple,
      TokenListedEvent.OutputTuple,
      TokenListedEvent.OutputObject
    >;
    TokenListed: TypedContractEvent<
      TokenListedEvent.InputTuple,
      TokenListedEvent.OutputTuple,
      TokenListedEvent.OutputObject
    >;

    "TokenPriceUpdated(address,uint256)": TypedContractEvent<
      TokenPriceUpdatedEvent.InputTuple,
      TokenPriceUpdatedEvent.OutputTuple,
      TokenPriceUpdatedEvent.OutputObject
    >;
    TokenPriceUpdated: TypedContractEvent<
      TokenPriceUpdatedEvent.InputTuple,
      TokenPriceUpdatedEvent.OutputTuple,
      TokenPriceUpdatedEvent.OutputObject
    >;

    "TokenPurchased(address,address,uint256,uint256)": TypedContractEvent<
      TokenPurchasedEvent.InputTuple,
      TokenPurchasedEvent.OutputTuple,
      TokenPurchasedEvent.OutputObject
    >;
    TokenPurchased: TypedContractEvent<
      TokenPurchasedEvent.InputTuple,
      TokenPurchasedEvent.OutputTuple,
      TokenPurchasedEvent.OutputObject
    >;

    "TokenSold(address,address,uint256,uint256)": TypedContractEvent<
      TokenSoldEvent.InputTuple,
      TokenSoldEvent.OutputTuple,
      TokenSoldEvent.OutputObject
    >;
    TokenSold: TypedContractEvent<
      TokenSoldEvent.InputTuple,
      TokenSoldEvent.OutputTuple,
      TokenSoldEvent.OutputObject
    >;

    "Unpaused(address)": TypedContractEvent<
      UnpausedEvent.InputTuple,
      UnpausedEvent.OutputTuple,
      UnpausedEvent.OutputObject
    >;
    Unpaused: TypedContractEvent<
      UnpausedEvent.InputTuple,
      UnpausedEvent.OutputTuple,
      UnpausedEvent.OutputObject
    >;
  };
}
