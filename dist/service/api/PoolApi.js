"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolApi = void 0;
const tool_1 = require("../tool");
const BaseApi_1 = require("./BaseApi");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
let PoolApi = class PoolApi {
    constructor() {
        this.baseApi = BaseApi_1.BASE_API;
    }
    async poolInfo(tokens) {
        if (!(tokens.length === 2 || tokens.length === 3)) {
            throw new Error('tokens length must be 2 or 3');
        }
        const lpTokenId = 128;
        const poolAccountId = 3;
        const l2BalanceInfos = await this.baseApi.api().accountApi().getBalance(this.baseApi.connectInfo());
        const poolInfo = {
            lpTokenId,
            poolAccountId,
            L2Balances: tokens.map((it) => {
                return l2BalanceInfos.find((info) => info.token.address === it.address);
            }),
            tokens: tokens,
            preAdd: async (connectInfo, amounts, slippage) => {
                const syncWallet = connectInfo.getSyncWallet();
                const restProvider = await this.baseApi.api().zkSyncProvider();
                const lpAmount = await restProvider.addLiquidityView({
                    accountAddress: connectInfo.account,
                    accountId: await syncWallet.getAccountId(),
                    tokenIds: tokens.map((it) => this.baseApi.api().accountApi().getTokenId(it)),
                    lpTokenId: lpTokenId,
                    poolAccountId: poolAccountId,
                    amounts: amounts.map((it, index) => new bignumber_js_1.default(it).multipliedBy(10 ** tokens[index].decimals).toFixed()),
                });
                return {
                    lpAmount,
                    lpAmountMin: new bignumber_js_1.default(lpAmount).multipliedBy(1 - Number(slippage)).toFixed(0, bignumber_js_1.default.ROUND_DOWN),
                };
            },
            add: async (connectInfo, amounts, slippage) => {
                const { lpAmountMin } = await poolInfo.preAdd(connectInfo, amounts, slippage);
                const syncWallet = connectInfo.getSyncWallet();
                const transaction = await syncWallet.addLiquidity({
                    tokenIds: tokens.map((it) => this.baseApi.api().accountApi().getTokenId(it)),
                    lpTokenId: lpTokenId,
                    poolAccountId: poolAccountId,
                    lpAmountMin: lpAmountMin,
                    amounts: amounts.map((it, index) => new bignumber_js_1.default(it).multipliedBy(10 ** tokens[index].decimals).toFixed()),
                });
                return transaction;
            },
            remove: async (connectInfo, amounts, slippage) => {
                const syncWallet = connectInfo.getSyncWallet();
                const lpAmount = "10";
                const transaction = await syncWallet.removeLiquidity({
                    tokenIds: tokens.map((it) => this.baseApi.api().accountApi().getTokenId(it)),
                    lpTokenId: lpTokenId,
                    poolAccountId: poolAccountId,
                    lpAmountMax: "0",
                    lpAmount: lpAmount,
                    amounts: amounts.map((it, index) => new bignumber_js_1.default(it).multipliedBy(10 ** tokens[index].decimals).toFixed()),
                    amountsMin: amounts.map((_it, _index) => "0"),
                });
                return transaction;
            }
        };
        return poolInfo;
    }
};
exports.PoolApi = PoolApi;
exports.PoolApi = PoolApi = __decorate([
    (0, tool_1.CacheKey)('PoolApi')
], PoolApi);
