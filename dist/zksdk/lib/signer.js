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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Signer_privateKey;
Object.defineProperty(exports, "__esModule", { value: true });
exports.unableToSign = exports.No2FAWalletSigner = exports.Create2WalletSigner = exports.Signer = void 0;
const crypto_1 = require("./crypto");
const ethers_1 = require("ethers");
const utils = __importStar(require("./utils"));
class Signer {
    constructor(privKey) {
        _Signer_privateKey.set(this, void 0);
        __classPrivateFieldSet(this, _Signer_privateKey, privKey, "f");
    }
    async pubKeyHash() {
        return await (0, crypto_1.privateKeyToPubKeyHash)(__classPrivateFieldGet(this, _Signer_privateKey, "f"));
    }
    async signMintNFT(mintNft) {
        const tx = {
            ...mintNft,
            type: 'MintNFT',
            feeToken: mintNft.feeTokenId
        };
        const msgBytes = utils.serializeMintNFT(tx);
        const signature = await (0, crypto_1.signTransactionBytes)(__classPrivateFieldGet(this, _Signer_privateKey, "f"), msgBytes);
        return {
            ...tx,
            fee: ethers_1.BigNumber.from(mintNft.fee).toString(),
            signature
        };
    }
    async signWithdrawNFT(withdrawNft) {
        const tx = {
            ...withdrawNft,
            type: 'WithdrawNFT',
            token: withdrawNft.tokenId,
            feeToken: withdrawNft.feeTokenId
        };
        const msgBytes = utils.serializeWithdrawNFT(tx);
        const signature = await (0, crypto_1.signTransactionBytes)(__classPrivateFieldGet(this, _Signer_privateKey, "f"), msgBytes);
        return {
            ...tx,
            fee: ethers_1.BigNumber.from(withdrawNft.fee).toString(),
            signature
        };
    }
    /**
     * @deprecated `Signer.*SignBytes` methods will be removed in future. Use `utils.serializeTx` instead.
     */
    transferSignBytes(transfer) {
        return utils.serializeTransfer({
            ...transfer,
            type: 'Transfer',
            token: transfer.tokenId
        });
    }
    async signSyncOrder(order) {
        const msgBytes = utils.serializeOrder(order);
        const signature = await (0, crypto_1.signTransactionBytes)(__classPrivateFieldGet(this, _Signer_privateKey, "f"), msgBytes);
        return {
            ...order,
            amount: ethers_1.BigNumber.from(order.amount).toString(),
            ratio: order.ratio.map((p) => ethers_1.BigNumber.from(p).toString()),
            signature
        };
    }
    async signSyncSwap(swap) {
        const tx = {
            ...swap,
            type: 'Swap'
        };
        const msgBytes = await utils.serializeSwap(tx);
        const signature = await (0, crypto_1.signTransactionBytes)(__classPrivateFieldGet(this, _Signer_privateKey, "f"), msgBytes);
        return {
            ...tx,
            amounts: [ethers_1.BigNumber.from(tx.amounts[0]).toString(), ethers_1.BigNumber.from(tx.amounts[1]).toString()],
            fee: ethers_1.BigNumber.from(tx.fee).toString(),
            signature
        };
    }
    async signSyncTransfer(transfer) {
        const tx = {
            ...transfer,
            type: 'Transfer',
            token: transfer.tokenId
        };
        const msgBytes = utils.serializeTransfer(tx);
        const signature = await (0, crypto_1.signTransactionBytes)(__classPrivateFieldGet(this, _Signer_privateKey, "f"), msgBytes);
        return {
            ...tx,
            amount: ethers_1.BigNumber.from(transfer.amount).toString(),
            fee: ethers_1.BigNumber.from(transfer.fee).toString(),
            signature
        };
    }
    async signAddLiquidity(transactionData) {
        const tx = {
            ...transactionData,
        };
        const msgBytes = utils.serializeAddLiquidity(tx);
        const signature = await (0, crypto_1.signTransactionBytes)(__classPrivateFieldGet(this, _Signer_privateKey, "f"), msgBytes);
        return {
            ...tx,
            signature
        };
    }
    async signRemoveLiquidity(transactionData) {
        const tx = {
            ...transactionData,
        };
        const msgBytes = utils.serializeRemoveLiquidity(tx);
        const signature = await (0, crypto_1.signTransactionBytes)(__classPrivateFieldGet(this, _Signer_privateKey, "f"), msgBytes);
        return {
            ...tx,
            signature
        };
    }
    async signCurveBaseSwap(transactionData) {
        const tx = {
            ...transactionData,
        };
        const msgBytes = utils.serializeCurveBaseSwap(tx);
        const signature = await (0, crypto_1.signTransactionBytes)(__classPrivateFieldGet(this, _Signer_privateKey, "f"), msgBytes);
        return {
            ...tx,
            signature
        };
    }
    async signCurveCombineSwap(transactionData) {
        const tx = {
            ...transactionData,
        };
        const msgBytes = utils.serializeCurveCombineSwap(tx);
        const signature = await (0, crypto_1.signTransactionBytes)(__classPrivateFieldGet(this, _Signer_privateKey, "f"), msgBytes);
        return {
            ...tx,
            signature
        };
    }
    async signSyncWithdraw(withdraw) {
        const tx = {
            ...withdraw,
            type: 'Withdraw',
            to: withdraw.ethAddress,
            token: withdraw.tokenId,
            chainId: withdraw.chainId
        };
        const msgBytes = utils.serializeWithdraw(tx);
        const signature = await (0, crypto_1.signTransactionBytes)(__classPrivateFieldGet(this, _Signer_privateKey, "f"), msgBytes);
        return {
            ...tx,
            amount: ethers_1.BigNumber.from(withdraw.amount).toString(),
            fee: ethers_1.BigNumber.from(withdraw.fee).toString(),
            signature
        };
    }
    /**
     * @deprecated `Signer.*SignBytes` methods will be removed in future. Use `utils.serializeTx` instead.
     */
    forcedExitSignBytes(forcedExit) {
        return utils.serializeForcedExit({
            ...forcedExit,
            type: 'ForcedExit',
            token: forcedExit.tokenId
        });
    }
    async signSyncForcedExit(forcedExit) {
        const tx = {
            ...forcedExit,
            type: 'ForcedExit',
            token: forcedExit.tokenId
        };
        const msgBytes = utils.serializeForcedExit(tx);
        const signature = await (0, crypto_1.signTransactionBytes)(__classPrivateFieldGet(this, _Signer_privateKey, "f"), msgBytes);
        return {
            ...tx,
            fee: ethers_1.BigNumber.from(forcedExit.fee).toString(),
            signature
        };
    }
    /**
     * @deprecated `Signer.*SignBytes` methods will be removed in future. Use `utils.serializeTx` instead.
     */
    changePubKeySignBytes(changePubKey) {
        return utils.serializeChangePubKey({
            ...changePubKey,
            type: 'ChangePubKey',
            feeToken: changePubKey.feeTokenId,
            // this is not important for serialization
            ethAuthData: { type: 'Onchain' }
        });
    }
    async signSyncChangePubKey(changePubKey) {
        const tx = {
            ...changePubKey,
            type: 'ChangePubKey',
            feeToken: changePubKey.feeTokenId
        };
        const msgBytes = utils.serializeChangePubKey(tx);
        const signature = await (0, crypto_1.signTransactionBytes)(__classPrivateFieldGet(this, _Signer_privateKey, "f"), msgBytes);
        return {
            ...tx,
            fee: ethers_1.BigNumber.from(changePubKey.fee).toString(),
            signature
        };
    }
    static fromPrivateKey(pk) {
        return new Signer(pk);
    }
    static async fromSeed(seed) {
        return new Signer(await (0, crypto_1.privateKeyFromSeed)(seed));
    }
    static async fromETHSignature(ethSigner) {
        let chainID = 1;
        if (ethSigner.provider) {
            const network = await ethSigner.provider.getNetwork();
            chainID = network.chainId;
        }
        let message = 'Access zkSync account.\n\nOnly sign this message for a trusted client!';
        if (chainID !== 1) {
            message += `\nChain ID: ${chainID}.`;
        }
        const signedBytes = utils.getSignedBytesFromMessage(message, false);
        const signature = await utils.signMessagePersonalAPI(ethSigner, signedBytes);
        const address = await ethSigner.getAddress();
        const ethSignatureType = await utils.getEthSignatureType(ethSigner.provider, message, signature, address);
        const seed = ethers_1.ethers.utils.arrayify(signature);
        const signer = await Signer.fromSeed(seed);
        return { signer, ethSignatureType };
    }
}
exports.Signer = Signer;
_Signer_privateKey = new WeakMap();
class Create2WalletSigner extends ethers_1.ethers.Signer {
    constructor(zkSyncPubkeyHash, create2WalletData, provider) {
        super();
        this.zkSyncPubkeyHash = zkSyncPubkeyHash;
        this.create2WalletData = create2WalletData;
        Object.defineProperty(this, 'provider', {
            enumerable: true,
            value: provider,
            writable: false
        });
        const create2Info = utils.getCREATE2AddressAndSalt(zkSyncPubkeyHash, create2WalletData);
        this.address = create2Info.address;
        this.salt = create2Info.salt;
    }
    async getAddress() {
        return this.address;
    }
    /**
     * This signer can't sign messages but we return zeroed signature bytes to comply with ethers API.
     */
    async signMessage(_message) {
        return ethers_1.ethers.utils.hexlify(new Uint8Array(65));
    }
    async signTransaction(_message) {
        throw new Error("Create2Wallet signer can't sign transactions");
    }
    async _signTypedData(_domain, _types, _value) {
        throw new Error("Create2Wallet signer can't sign TypedData");
    }
    connect(provider) {
        return new Create2WalletSigner(this.zkSyncPubkeyHash, this.create2WalletData, provider);
    }
}
exports.Create2WalletSigner = Create2WalletSigner;
class No2FAWalletSigner extends ethers_1.ethers.Signer {
    constructor(address, provider) {
        super();
        this.address = address;
        Object.defineProperty(this, 'provider', {
            enumerable: true,
            value: provider,
            writable: false
        });
    }
    async getAddress() {
        return this.address;
    }
    /**
     * This signer can't sign messages but we return zeroed signature bytes to comply with ethers API.
     */
    async signMessage(_message) {
        return ethers_1.ethers.utils.hexlify(new Uint8Array(65));
    }
    async signTransaction(_message) {
        throw new Error("No2FAWallet signer can't sign transactions");
    }
    async _signTypedData(_domain, _types, _value) {
        throw new Error("No2FAWallet signer can't sign TypedData");
    }
    connect(provider) {
        return new No2FAWalletSigner(this.address, provider);
    }
}
exports.No2FAWalletSigner = No2FAWalletSigner;
function unableToSign(signer) {
    return true;
    // return signer instanceof Create2WalletSigner || signer instanceof No2FAWalletSigner;
}
exports.unableToSign = unableToSign;
