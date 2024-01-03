"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceAndAllowance = exports.Balance = exports.Token = exports.ETH_ADDRESS = void 0;
const AddressInfo_1 = require("../../config/AddressInfo");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const tool_1 = require("../tool");
exports.ETH_ADDRESS = 'ETH';
/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
class Token {
    static fromSerialized(serializedToken) {
        return new Token(serializedToken.chainId, serializedToken.address, serializedToken.decimals, serializedToken.symbol, serializedToken.name, serializedToken.logoURI);
    }
    constructor(chainId, address, decimals, symbol, name, logoURI) {
        this.chainId = chainId;
        this.decimals = decimals;
        this.symbol = symbol;
        this.name = name;
        this.address = address;
        this.logoURI = logoURI;
        this.isNative = this.address === exports.ETH_ADDRESS;
        this.isToken = !this.isNative;
    }
    /**
     * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
     * @param other other token to compare
     */
    equals(other) {
        return !(0, tool_1.isNullOrUndefined)(other) && this.chainId === other.chainId && this.address === other.address;
    }
    /**
     * Returns true if the address of this token sorts before the address of the other token
     * @param other other token to compare
     * @throws if the tokens have the same address
     * @throws if the tokens are on different chains
     */
    sortsBefore(other) {
        if (this.chainId !== other.chainId)
            throw new Error('CHAIN_IDS');
        return this.erc20Address().toLowerCase() < other?.erc20Address().toLowerCase();
    }
    get serialize() {
        return {
            address: this.address,
            chainId: this.chainId,
            decimals: this.decimals,
            symbol: this.symbol,
            name: this.name,
            logoURI: this.logoURI,
        };
    }
    erc20Address() {
        return this.isNative ? '' : this.address;
    }
    iconUrl() {
        return this.logoURI ? this.logoURI : '';
    }
    scanUrl() {
        return this.address === exports.ETH_ADDRESS ? '' : (0, AddressInfo_1.getCurrentAddressInfo)().getEtherscanAddress(this.address);
    }
}
exports.Token = Token;
class Balance {
    constructor(token, user, balance) {
        this.token = token;
        this.user = user;
        this.balance = balance;
    }
    select(rate) {
        let selectRate = rate;
        if (rate === 'max')
            selectRate = '100';
        return new bignumber_js_1.default(this.balance).multipliedBy(selectRate).div('100').toFixed();
    }
}
exports.Balance = Balance;
class BalanceAndAllowance extends Balance {
    constructor(token, user, balance, allowance, spender) {
        super(token, user, balance);
        this.allowance = allowance;
        this.spender = spender;
    }
    showApprove(inputAmount) {
        if (this.token.address === exports.ETH_ADDRESS || this.spender === '')
            return false;
        return new bignumber_js_1.default(inputAmount).comparedTo(this.allowance) > 0;
    }
    approve(connectInfo) {
        return connectInfo.erc20().approve(this.spender, this.token.erc20Address());
    }
    // 生成一个不可用的余额是0的
    static unavailable(token) {
        return new BalanceAndAllowance(token, '', '0', '0', '');
    }
}
exports.BalanceAndAllowance = BalanceAndAllowance;
