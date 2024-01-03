import { TransactionEvent } from "./TransactionEvent";
import { ConnectInfo } from "../../ConnectInfo";
export declare const ETH_ADDRESS = "ETH";
export interface SerializedToken {
    chainId: number;
    address: string;
    decimals: number;
    symbol: string;
    name?: string;
    logoURI?: string;
}
/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
export declare class Token {
    readonly isNative: boolean;
    readonly isToken: boolean;
    readonly chainId: number;
    /**
     * The decimals used in representing currency amounts
     */
    readonly decimals: number;
    /**
     * The symbol of the currency, i.e. a short textual non-unique identifier
     */
    readonly symbol: string;
    /**
     * The name of the currency, i.e. a descriptive textual non-unique identifier
     */
    readonly name?: string;
    /**
     * The contract address on the chain on which this token lives
     */
    readonly address: string;
    readonly logoURI?: string;
    static fromSerialized(serializedToken: SerializedToken): Token;
    constructor(chainId: number, address: string, decimals: number, symbol: string, name?: string, logoURI?: string);
    /**
     * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
     * @param other other token to compare
     */
    equals(other: Token): boolean;
    /**
     * Returns true if the address of this token sorts before the address of the other token
     * @param other other token to compare
     * @throws if the tokens have the same address
     * @throws if the tokens are on different chains
     */
    sortsBefore(other: Token): boolean;
    get serialize(): SerializedToken;
    erc20Address(): string;
    iconUrl(): string;
    scanUrl(): string;
}
export declare class Balance {
    token: Token;
    user: string;
    balance: string;
    constructor(token: Token, user: string, balance: string);
    select(rate: '25' | '50' | '75' | 'max'): string;
}
export declare class BalanceAndAllowance extends Balance {
    allowance: string;
    spender: string;
    constructor(token: Token, user: string, balance: string, allowance: string, spender: string);
    showApprove(inputAmount: string): boolean;
    approve(connectInfo: ConnectInfo): Promise<TransactionEvent>;
    static unavailable(token: Token): BalanceAndAllowance;
}
