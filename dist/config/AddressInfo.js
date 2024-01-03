"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAddress = exports.getCurrentAddressInfo = exports.updateCurrentAddressInfo = exports.AddressInfo = void 0;
const ethers_1 = require("ethers");
const ConnectInfo_1 = require("../ConnectInfo");
const WalletConnect_1 = require("../WalletConnect");
const service_1 = require("../service");
const BasicException_1 = require("../BasicException");
const ApiProvider_1 = require("../service/api/ApiProvider");
/**
 * 地址信息
 */
class AddressInfo {
    constructor() {
        this.tokens = [];
        this.readonlyConnectInfoInstance = null;
    }
    getApi() {
        if (typeof this.api === 'undefined')
            this.api = (0, service_1.createProxy)(new ApiProvider_1.ApiProvider());
        return this.api;
    }
    readonlyConnectInfo() {
        if (typeof this.readonlyConnectInfoInstance === 'undefined') {
            const provider = new ethers_1.providers.StaticJsonRpcProvider(this.rpc, this.chainId);
            const connectInfo = new ConnectInfo_1.ConnectInfo();
            connectInfo.provider = provider;
            connectInfo.wallet = undefined;
            connectInfo.status = true;
            connectInfo.addressInfo = this;
            connectInfo.writeState = false;
            this.readonlyConnectInfoInstance = connectInfo;
        }
        return this.readonlyConnectInfoInstance;
    }
    getEtherscanAddress(address) {
        return this.getEtherscanLink(address, 'address');
    }
    getEtherscanTx(tx) {
        return this.getEtherscanLink(tx, 'transaction');
    }
    getEtherscanLink(data, type) {
        const prefix = this.scan;
        switch (type) {
            case 'transaction': {
                return `${prefix}/tx/${data}`;
            }
            case 'token': {
                return `${prefix}/token/${data}`;
            }
            case 'block': {
                return `${prefix}/block/${data}`;
            }
            case 'address':
            default: {
                return `${prefix}/address/${data}`;
            }
        }
    }
}
exports.AddressInfo = AddressInfo;
let currentAddressInfo;
function updateCurrentAddressInfo(addressInfo) {
    currentAddressInfo = addressInfo;
    (0, service_1.clearCache)();
}
exports.updateCurrentAddressInfo = updateCurrentAddressInfo;
function getCurrentAddressInfo() {
    if (currentAddressInfo === undefined)
        throw new BasicException_1.BasicException('not initialized');
    return currentAddressInfo;
}
exports.getCurrentAddressInfo = getCurrentAddressInfo;
function initAddress(ENV) {
    if (ENV === 'dev_goerli') {
        const addressInfo = new AddressInfo();
        addressInfo.chainId = 5;
        addressInfo.chainName = 'Goerli';
        addressInfo.scan = 'https://goerli.etherscan.io';
        addressInfo.rpc = 'https://rpc.ankr.com/eth_goerli';
        addressInfo.multicall = "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696";
        addressInfo.tokens = [
            {
                name: 'ETH',
                symbol: 'ETH',
                decimal: 18,
                address: 'ETH',
            },
            {
                name: 'aToken',
                symbol: 'aToken',
                decimal: 18,
                address: '0x8380fcff4218bd670f26c5699151a68ac92c400f',
            },
            {
                name: 'bToken',
                symbol: 'bToken',
                decimal: 18,
                address: '0x619c211793a2e04e158f33f4e4559506fecc641a',
            },
            {
                name: 'cToken',
                symbol: 'cToken',
                decimal: 8,
                address: '0x80c6ba2ecf21fbf9e69c34be3d33c7b4aaaa00e2',
            },
            {
                name: 'dToken',
                symbol: 'dToken',
                decimal: 6,
                address: '0xfc03db9c3192fa71ea7b9e61f22a3b1240bed74e',
            }
        ];
        updateCurrentAddressInfo(addressInfo);
    }
    else if (ENV === 'dev_holesky') {
        const addressInfo = new AddressInfo();
        addressInfo.chainId = 17000;
        addressInfo.chainName = 'Holesky';
        addressInfo.scan = 'https://holesky.etherscan.io';
        addressInfo.rpc = "https://rpc.holesky.ethpandaops.io";
        addressInfo.multicall = "0x3116B07D1a70B14a2bFC2706528d037d47a4636d";
        addressInfo.tokens = [];
        updateCurrentAddressInfo(addressInfo);
    }
    else {
        throw new Error(`${ENV} is not support`);
    }
    service_1.Trace.debug('address config init', ENV);
    WalletConnect_1.ConnectManager.chainMap.Goerli = '0x5';
    WalletConnect_1.ConnectManager.chainMap.Holesky = '0x4268';
}
exports.initAddress = initAddress;
