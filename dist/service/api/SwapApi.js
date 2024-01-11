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
exports.SwapApi = void 0;
const tool_1 = require("../tool");
const BaseApi_1 = require("./BaseApi");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
let SwapApi = class SwapApi {
    constructor() {
        this.baseApi = BaseApi_1.BASE_API;
    }
    async swapInfo(tokenA, tokenB) {
        const poolAccountId = 4;
        const l2BalanceInfos = await this.baseApi.api().accountApi().getBalance(this.baseApi.connectInfo());
        const swapInfo = {
            poolAccountId: poolAccountId,
            tokenAL2Balance: l2BalanceInfos.find((info) => info.token.address === tokenA.address),
            tokenBL2Balance: l2BalanceInfos.find((info) => info.token.address === tokenB.address),
            tokenA: tokenA,
            tokenB: tokenB,
            preSwap: async (connectInfo, amount, slippage) => {
                const vin = new bignumber_js_1.default(amount).multipliedBy(10 ** tokenA.decimals).toFixed();
                const syncWallet = connectInfo.getSyncWallet();
                const restProvider = await this.baseApi.api().zkSyncProvider();
                const vout = await restProvider.swapView({
                    accountAddress: connectInfo.account,
                    accountId: await syncWallet.getAccountId(),
                    poolAccountId: poolAccountId,
                    tokenIn: this.baseApi.api().accountApi().getTokenId(tokenA),
                    tokenOut: this.baseApi.api().accountApi().getTokenId(tokenB),
                    vin: vin,
                });
                const outPutAmount = new bignumber_js_1.default(vout).dividedBy(10 ** tokenB.decimals).toFixed();
                return {
                    vin,
                    vout,
                    voutMin: new bignumber_js_1.default(vout).multipliedBy(1 - Number(slippage)).toFixed(0, bignumber_js_1.default.ROUND_DOWN),
                    outPutAmount
                };
            },
            swap: async (connectInfo, amount, slippage) => {
                const syncWallet = connectInfo.getSyncWallet();
                const preResult = await swapInfo.preSwap(connectInfo, amount, slippage);
                return await syncWallet.curveSwap('combine', {
                    poolAccountId: poolAccountId,
                    tokenIn: this.baseApi.api().accountApi().getTokenId(tokenA),
                    tokenOut: this.baseApi.api().accountApi().getTokenId(tokenB),
                    vin: preResult.vin,
                    vout: preResult.vout,
                    voutMin: preResult.voutMin,
                });
            }
        };
        return swapInfo;
    }
};
exports.SwapApi = SwapApi;
exports.SwapApi = SwapApi = __decorate([
    (0, tool_1.CacheKey)('SwapApi')
], SwapApi);
