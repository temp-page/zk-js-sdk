"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyTransport = exports.HTTPTransport = exports.JRPCError = exports.AbstractJSONRPCTransport = void 0;
const ethers_1 = require("ethers");
const ethers = __importStar(require("ethers"));
const axios_1 = __importDefault(require("axios"));
const signer_1 = require("./signer");
class AbstractJSONRPCTransport {
    subscriptionsSupported() {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async subscribe(subMethod, subParams, unsubMethod, cb) {
        throw new Error('subscription are not supported for this transport');
    }
}
exports.AbstractJSONRPCTransport = AbstractJSONRPCTransport;
// Has jrpcError field which is JRPC error object.
// https://www.jsonrpc.org/specification#error_object
class JRPCError extends Error {
    constructor(message, jrpcError) {
        super(message);
        this.jrpcError = jrpcError;
    }
}
exports.JRPCError = JRPCError;
class Subscription {
    constructor(unsubscribe) {
        this.unsubscribe = unsubscribe;
    }
}
class HTTPTransport extends AbstractJSONRPCTransport {
    constructor(address) {
        super();
        this.address = address;
    }
    // JSON RPC request
    async request(method, params = null, config) {
        const request = {
            id: 1,
            jsonrpc: '2.0',
            method,
            params
        };
        const response = await axios_1.default.post(this.address, request, config).then((resp) => {
            return resp.data;
        });
        if ('result' in response) {
            return response.result;
        }
        else if ('error' in response) {
            throw new JRPCError(`zkSync API response error: code ${response.error.code}; message: ${response.error.message}`, response.error);
        }
        else {
            throw new Error('Unknown JRPC Error');
        }
    }
    async disconnect() { }
}
exports.HTTPTransport = HTTPTransport;
class DummyTransport extends AbstractJSONRPCTransport {
    constructor(network, ethPrivateKey, getTokens) {
        super();
        this.network = network;
        this.ethPrivateKey = ethPrivateKey;
        this.getTokens = getTokens;
    }
    async getPubKeyHash() {
        const ethWallet = new ethers.Wallet(this.ethPrivateKey);
        const { signer } = await signer_1.Signer.fromETHSignature(ethWallet);
        return await signer.pubKeyHash();
    }
    async request(method, params = null) {
        if (method == 'contract_address') {
            return {
                // The HEX-encoded sequence of bytes [0..20) provided as the `mainContract`.
                mainContract: '0x000102030405060708090a0b0c0d0e0f10111213',
                //  The `govContract` is not used in tests and it is simply an empty string.
                govContract: ''
            };
        }
        if (method == 'tokens') {
            const tokensList = this.getTokens();
            const tokens = {};
            let id = 1;
            for (const tokenItem of tokensList.slice(0, 3)) {
                const token = {
                    address: tokenItem.address,
                    id: id,
                    symbol: tokenItem.symbol,
                    decimals: tokenItem.decimals
                };
                tokens[tokenItem.symbol] = token;
                id++;
            }
            return tokens;
        }
        if (method == 'account_info') {
            // The example `AccountState` instance:
            //  - assigns the '42' value to account_id;
            //  - assigns the committed.pubKeyHash to match the wallet's signer's PubKeyHash
            //  - adds single entry of "DAI" token to the committed balances;
            //  - adds single entry of "USDC" token to the verified balances.
            return {
                address: params[0],
                id: 42,
                depositing: {},
                committed: {
                    balances: {
                        DAI: ethers_1.BigNumber.from(12345)
                    },
                    nonce: 0,
                    pubKeyHash: await this.getPubKeyHash()
                },
                verified: {
                    balances: {
                        USDC: ethers_1.BigNumber.from(98765)
                    },
                    nonce: 0,
                    pubKeyHash: ''
                }
            };
        }
        return {
            method,
            params
        };
    }
    async disconnect() { }
}
exports.DummyTransport = DummyTransport;
