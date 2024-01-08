"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncMainContract = void 0;
const tool_1 = require("../tool");
const BaseAbi_1 = require("./BaseAbi");
const ConnectInfo_1 = require("../../ConnectInfo");
const abi_1 = require("../../abi");
let SyncMainContract = class SyncMainContract extends BaseAbi_1.BaseAbi {
    constructor(connectInfo) {
        super(connectInfo, connectInfo.addressInfo.zkSyncMainContract, abi_1.SyncMain);
    }
    async withdrawPendingBalance(from, tokenAddress, withdrawAmount) {
        // eslint-disable-next-line prefer-rest-params
        const args = Array.from(arguments);
        return await this.connectInfo.tx().sendContractTransaction(this.contract, 'withdrawPendingBalance', args, {});
    }
    async depositETH(address, value) {
        return await this.connectInfo.tx().sendContractTransaction(this.contract, 'depositETH', [
            address
        ], {
            value
        });
    }
    async depositERC20(tokenAddress, address, value) {
        return await this.connectInfo.tx().sendContractTransaction(this.contract, 'depositERC20', [
            tokenAddress, value, address
        ], {});
    }
};
exports.SyncMainContract = SyncMainContract;
__decorate([
    (0, tool_1.EnableLogs)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SyncMainContract.prototype, "withdrawPendingBalance", null);
__decorate([
    (0, tool_1.EnableLogs)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SyncMainContract.prototype, "depositETH", null);
__decorate([
    (0, tool_1.EnableLogs)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SyncMainContract.prototype, "depositERC20", null);
exports.SyncMainContract = SyncMainContract = __decorate([
    (0, tool_1.CacheKey)('SyncMainContract'),
    __metadata("design:paramtypes", [ConnectInfo_1.ConnectInfo])
], SyncMainContract);
