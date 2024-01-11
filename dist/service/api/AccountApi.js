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
exports.AccountApi = void 0;
const BaseApi_1 = require("./BaseApi");
const tool_1 = require("../tool");
const abi_1 = require("../abi");
const vo_1 = require("../vo");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const get_1 = __importDefault(require("lodash/get"));
let AccountApi = class AccountApi {
    constructor() {
        this.baseApi = BaseApi_1.BASE_API;
    }
    getTokenId(token) {
        return (0, vo_1.getCurrentAddressInfo)().tokens.findIndex(it => it.address === token.address);
    }
    async getBalance(connectInfo) {
        if (!connectInfo) {
            return [];
        }
        const addressInfo = this.baseApi.address();
        const restProvider = await addressInfo.getApi().zkSyncProvider();
        const accountState = await restProvider.getState(connectInfo.account);
        return addressInfo.tokens.map((it) => {
            return {
                token: it,
                l2CommittedBalance: new bignumber_js_1.default((0, get_1.default)(accountState.committed.balances, it.symbol, '0').toString()).div(10 ** it.decimals).toFixed(),
                l2FinalizedBalance: new bignumber_js_1.default((0, get_1.default)(accountState.verified.balances, it.symbol, '0').toString()).div(10 ** it.decimals).toFixed(),
            };
        });
    }
    async getAccountInfo(connectInfo) {
        const datas = {
            balances: [],
            tokens: [],
            address: '',
            deposit: async (connectInfo, token, amount) => {
                const value = new bignumber_js_1.default(amount).times(10 ** token.decimals).toFixed();
                const syncMainContractIns = connectInfo.create(abi_1.SyncMainContract);
                if (token.isNative) {
                    return await syncMainContractIns.depositETH(connectInfo.account, value);
                }
                else {
                    return await syncMainContractIns.depositERC20(token.address, connectInfo.account, value);
                }
            },
            withdraw: async (connectInfo, token, amount) => {
                const syncWallet = connectInfo.getSyncWallet();
                const transaction = await syncWallet.withdrawFromSyncToEthereum({
                    ethAddress: syncWallet.address(),
                    token: this.getTokenId(token),
                    amount: new bignumber_js_1.default(amount).multipliedBy(10 ** token.decimals).toFixed(),
                    fee: "0",
                    fastProcessing: false
                });
                return transaction;
            },
            withdrawPending: async (connectInfo, token, amount) => {
                const value = new bignumber_js_1.default(amount).times(10 ** token.decimals).toFixed();
                const syncMainContractIns = connectInfo.create(abi_1.SyncMainContract);
                return await syncMainContractIns.withdrawPendingBalance(connectInfo.account, token.address, value);
            },
            showToggle2fa: false,
            showChangePublicKey: false,
            toggle2faSubmit: () => Promise.resolve(),
            changePublicSubmit: () => Promise.resolve(),
        };
        if (!connectInfo) {
            return datas;
        }
        const addressInfo = this.baseApi.address();
        const restProvider = await addressInfo.getApi().zkSyncProvider();
        const accountState = await restProvider.getState(connectInfo.account);
        const syncMainContract = connectInfo.create(abi_1.SyncMainContract);
        const pendingBalance = await connectInfo.multiCall()
            .call(...connectInfo.addressInfo.tokens.map(it => {
            return {
                getPendingBalance: syncMainContract.mulContract.getPendingBalance(connectInfo.account, it.address === vo_1.ETH_ADDRESS ? tool_1.ZERO_ADDRESS : it.address),
            };
        }));
        const balanceAndAllowances = await connectInfo.erc20().batchGetBalanceAndAllowance(connectInfo.account, connectInfo.addressInfo.zkSyncMainContract, connectInfo.addressInfo.tokens);
        addressInfo.tokens.forEach((it, index) => {
            const l2Balance = {
                token: it,
                l1PendingWithdraw: pendingBalance[index].getPendingBalance,
                l1Balances: balanceAndAllowances[it.address],
                l2CommittedBalance: new bignumber_js_1.default((0, get_1.default)(accountState.committed.balances, it.symbol, '0').toString()).div(10 ** it.decimals).toFixed(),
                l2FinalizedBalance: new bignumber_js_1.default((0, get_1.default)(accountState.verified.balances, it.symbol, '0').toString()).div(10 ** it.decimals).toFixed(),
            };
            datas.balances.push(l2Balance);
            datas.tokens.push(it);
        });
        datas.address = connectInfo.account;
        datas.showToggle2fa = accountState.accountType === 'Owned';
        datas.showChangePublicKey = accountState.committed.pubKeyHash === 'sync:0000000000000000000000000000000000000000';
        datas.changePublicSubmit = async (connectInfo) => {
            const syncWallet = connectInfo.getSyncWallet();
            const changePubkey = await syncWallet.setSigningKey({
                feeToken: 1,
                fee: "0",
                ethAuthType: "ECDSA"
            });
            await changePubkey.awaitReceipt();
        };
        datas.toggle2faSubmit = async (connectInfo) => {
            const syncWallet = connectInfo.getSyncWallet();
            await syncWallet.toggle2FA(false);
        };
        return datas;
    }
};
exports.AccountApi = AccountApi;
exports.AccountApi = AccountApi = __decorate([
    (0, tool_1.CacheKey)('AccountApi')
], AccountApi);
