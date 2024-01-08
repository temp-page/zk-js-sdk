"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapApi = void 0;
const tool_1 = require("../tool");
const BaseApi_1 = require("./BaseApi");
let SwapApi = class SwapApi {
    constructor() {
        this.baseApi = BaseApi_1.BASE_API;
    }
    async swapInfo(tokenA, tokenB) {
        const lpTokenId = 0;
        const poolAccountId = 0;
        const l2BalanceInfos = await this.baseApi.api().accountApi().getBalance(this.baseApi.connectInfo());
        const type = 'base';
        const swapInfo = {
            lpTokenId: lpTokenId,
            poolAccountId: poolAccountId,
            tokenAL2Balance: l2BalanceInfos.find((info) => info.token.address === tokenA.address),
            tokenBL2Balance: l2BalanceInfos.find((info) => info.token.address === tokenB.address),
            tokenA: tokenA,
            tokenB: tokenB,
            type,
            swap: async (connectInfo, vin, vout, voutMint) => {
                const syncWallet = connectInfo.getSyncWallet();
                if (type == 'base') {
                    return await syncWallet.curveCombineSwap({
                        poolAccountId: poolAccountId,
                        tokenIn: this.baseApi.api().accountApi().getTokenId(tokenA),
                        tokenOut: this.baseApi.api().accountApi().getTokenId(tokenB),
                        vin: vin,
                        vout: vout,
                        voutMin: voutMint,
                    });
                }
                else {
                    return await syncWallet.curveCombineSwap({
                        poolAccountId: poolAccountId,
                        tokenIn: this.baseApi.api().accountApi().getTokenId(tokenA),
                        tokenOut: this.baseApi.api().accountApi().getTokenId(tokenB),
                        vin: vin,
                        vout: vout,
                        voutMin: voutMint,
                    });
                }
            }
        };
        return swapInfo;
    }
};
exports.SwapApi = SwapApi;
exports.SwapApi = SwapApi = __decorate([
    (0, tool_1.CacheKey)('SwapApi')
], SwapApi);
