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
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadZkSyncCrypto = exports.rescueHashOrders = exports.privateKeyToPubKeyHash = exports.signTransactionBytes = exports.privateKeyFromSeed = void 0;
const zks = __importStar(require("zksync-crypto"));
const ethers_1 = require("ethers");
/**
 * This variable stores the zksync-crypto module compiled into
 * asm.js for environments without WebAssembly support (e.g. React Native).
 * It's either loaded once or left to be undefined, so whenever
 * we are using the crypto package, we do it in the following way:
 * ```
 * const _zks = asmJs || zks;
 * const signature = _zks.sign_musig(privKey, bytes);
 * ```
 */
let asmJs = undefined;
async function privateKeyFromSeed(seed) {
    await loadZkSyncCrypto();
    const _zks = asmJs || zks;
    return _zks.privateKeyFromSeed(seed);
}
exports.privateKeyFromSeed = privateKeyFromSeed;
async function signTransactionBytes(privKey, bytes) {
    await loadZkSyncCrypto();
    const _zks = asmJs || zks;
    const signaturePacked = _zks.sign_musig(privKey, bytes);
    const pubKey = ethers_1.utils.hexlify(signaturePacked.slice(0, 32)).substr(2);
    const signature = ethers_1.utils.hexlify(signaturePacked.slice(32)).substr(2);
    return {
        pubKey,
        signature
    };
}
exports.signTransactionBytes = signTransactionBytes;
async function privateKeyToPubKeyHash(privateKey) {
    await loadZkSyncCrypto();
    const _zks = asmJs || zks;
    return `sync:${ethers_1.utils.hexlify(_zks.private_key_to_pubkey_hash(privateKey)).substr(2)}`;
}
exports.privateKeyToPubKeyHash = privateKeyToPubKeyHash;
async function rescueHashOrders(orders) {
    await loadZkSyncCrypto();
    const _zks = asmJs || zks;
    return _zks.rescueHashOrders(orders);
}
exports.rescueHashOrders = rescueHashOrders;
let zksyncCryptoLoaded = false;
async function loadZkSyncCrypto(wasmFileUrl) {
    if (zksyncCryptoLoaded) {
        return;
    }
    // Only runs in the browser
    const _zks = zks;
    if (_zks.loadZkSyncCrypto) {
        if (!_zks.wasmSupported()) {
            // Load the asm.js build which will be used instead.
            // wasmFileUrl will be ignored.
            asmJs = await _zks.loadZkSyncCrypto(wasmFileUrl);
        }
        else {
            // It is ok if wasmFileUrl is not specified.
            // Actually, typically it should not be specified,
            // since the content of the `.wasm` file is read
            // from the `.js` file itself.
            await _zks.loadZkSyncCrypto(wasmFileUrl);
        }
        zksyncCryptoLoaded = true;
    }
}
exports.loadZkSyncCrypto = loadZkSyncCrypto;
