"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.l1ChainId = void 0;
const MAINNET_NETWORK_CHAIN_ID = 1;
const RINKEBY_NETWORK_CHAIN_ID = 4;
const GOERLI_NETWORK_CHAIN_ID = 5;
const LOCALHOST_NETWORK_CHAIN_ID = 9;
function l1ChainId(network) {
    if (network === 'rinkeby-beta') {
        return RINKEBY_NETWORK_CHAIN_ID;
    }
    if (network === 'goerli' || network === 'goerli-beta') {
        return GOERLI_NETWORK_CHAIN_ID;
    }
    if (network === 'mainnet') {
        return MAINNET_NETWORK_CHAIN_ID;
    }
    if (network === 'localhost') {
        return LOCALHOST_NETWORK_CHAIN_ID;
    }
    throw new Error('Unsupported netwrok');
}
exports.l1ChainId = l1ChainId;
