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
exports.EthMessageSigner = void 0;
const ethers = __importStar(require("ethers"));
const utils_1 = require("./utils");
const service_1 = require("../../service");
/**
 * Wrapper around `ethers.Signer` which provides convenient methods to get and sign messages required for zkSync.
 */
class EthMessageSigner {
    constructor(ethSigner, ethSignerType) {
        this.ethSigner = ethSigner;
        this.ethSignerType = ethSignerType;
    }
    async getEthMessageSignature(message) {
        if (this.ethSignerType == null) {
            throw new Error('ethSignerType is unknown');
        }
        const signedBytes = (0, utils_1.getSignedBytesFromMessage)(message, !this.ethSignerType.isSignedMsgPrefixed);
        const signature = await (0, utils_1.signMessagePersonalAPI)(this.ethSigner, signedBytes);
        return {
            type: this.ethSignerType.verificationMethod === 'ECDSA' ? 'EthereumSignature' : 'EIP1271Signature',
            signature
        };
    }
    getTransferEthSignMessage(transfer) {
        let humanReadableTxInfo = this.getTransferEthMessagePart(transfer);
        if (humanReadableTxInfo.length != 0) {
            humanReadableTxInfo += '\n';
        }
        humanReadableTxInfo += `Nonce: ${transfer.nonce}`;
        return humanReadableTxInfo;
    }
    async ethSignTransfer(transfer) {
        const message = this.getTransferEthSignMessage(transfer);
        return await this.getEthMessageSignature(message);
    }
    async ethSignSwap(swap) {
        const message = this.getSwapEthSignMessage(swap);
        return await this.getEthMessageSignature(message);
    }
    async ethSignOrder(order) {
        const message = this.getOrderEthSignMessage(order);
        return await this.getEthMessageSignature(message);
    }
    getSwapEthSignMessagePart(swap) {
        if (swap.fee != '0' && swap.fee) {
            return `Swap fee: ${swap.fee} ${swap.feeToken}`;
        }
        return '';
    }
    getSwapEthSignMessage(swap) {
        let message = this.getSwapEthSignMessagePart(swap);
        if (message != '') {
            message += '\n';
        }
        message += `Nonce: ${swap.nonce}`;
        return message;
    }
    getOrderEthSignMessage(order) {
        let message;
        if (order.amount == '0' || order.amount == null) {
            message = `Limit order for ${order.tokenSell} -> ${order.tokenBuy}\n`;
        }
        else {
            message = `Order for ${order.amount} ${order.tokenSell} -> ${order.tokenBuy}\n`;
        }
        message +=
            `Ratio: ${order.ratio[0].toString()}:${order.ratio[1].toString()}\n` +
                `Address: ${order.recipient.toLowerCase()}\n` +
                `Nonce: ${order.nonce}`;
        return message;
    }
    async ethSignForcedExit(forcedExit) {
        const message = this.getForcedExitEthSignMessage(forcedExit);
        return await this.getEthMessageSignature(message);
    }
    getMintNFTEthMessagePart(mintNFT) {
        let humanReadableTxInfo = `MintNFT ${mintNFT.contentHash} for: ${mintNFT.recipient.toLowerCase()}`;
        if (mintNFT.stringFee != null) {
            humanReadableTxInfo += `\nFee: ${mintNFT.stringFee} ${mintNFT.stringFeeToken}`;
        }
        return humanReadableTxInfo;
    }
    getMintNFTEthSignMessage(mintNFT) {
        let humanReadableTxInfo = this.getMintNFTEthMessagePart(mintNFT);
        humanReadableTxInfo += `\nNonce: ${mintNFT.nonce}`;
        return humanReadableTxInfo;
    }
    getWithdrawNFTEthMessagePart(withdrawNFT) {
        let humanReadableTxInfo = `WithdrawNFT ${withdrawNFT.token} to: ${withdrawNFT.to.toLowerCase()}`;
        if (withdrawNFT.stringFee != null) {
            humanReadableTxInfo += `\nFee: ${withdrawNFT.stringFee} ${withdrawNFT.stringFeeToken}`;
        }
        return humanReadableTxInfo;
    }
    getWithdrawNFTEthSignMessage(withdrawNFT) {
        let humanReadableTxInfo = this.getWithdrawNFTEthMessagePart(withdrawNFT);
        humanReadableTxInfo += `\nNonce: ${withdrawNFT.nonce}`;
        return humanReadableTxInfo;
    }
    getWithdrawEthSignMessage(withdraw) {
        let humanReadableTxInfo = this.getWithdrawEthMessagePart(withdraw);
        if (humanReadableTxInfo.length != 0) {
            humanReadableTxInfo += '\n';
        }
        humanReadableTxInfo += `Nonce: ${withdraw.nonce}`;
        return humanReadableTxInfo;
    }
    getForcedExitEthSignMessage(forcedExit) {
        let humanReadableTxInfo = this.getForcedExitEthMessagePart(forcedExit);
        humanReadableTxInfo += `\nNonce: ${forcedExit.nonce}`;
        return humanReadableTxInfo;
    }
    getTransferEthMessagePart(tx) {
        let txType, to;
        if (tx.ethAddress != undefined) {
            txType = 'Withdraw';
            to = tx.ethAddress;
        }
        else if (tx.to != undefined) {
            txType = 'Transfer';
            to = tx.to;
        }
        else {
            throw new Error('Either to or ethAddress field must be present');
        }
        let message = '';
        if (tx.stringAmount != null) {
            message += `${txType} ${tx.stringAmount} ${tx.stringToken} to: ${to.toLowerCase()}`;
        }
        if (tx.stringFee != null) {
            if (message.length != 0) {
                message += '\n';
            }
            message += `Fee: ${tx.stringFee} ${tx.stringToken}`;
        }
        return message;
    }
    getWithdrawEthMessagePart(tx) {
        return this.getTransferEthMessagePart(tx);
    }
    getChangePubKeyEthMessagePart(changePubKey) {
        let message = '';
        message += `Set signing key: ${changePubKey.pubKeyHash.replace('sync:', '').toLowerCase()}`;
        if (changePubKey.stringFee != null) {
            message += `\nFee: ${changePubKey.stringFee} ${changePubKey.stringToken}`;
        }
        return message;
    }
    getForcedExitEthMessagePart(forcedExit) {
        let message = `ForcedExit ${forcedExit.stringToken} to: ${forcedExit.target.toLowerCase()}`;
        if (forcedExit.stringFee != null) {
            message += `\nFee: ${forcedExit.stringFee} ${forcedExit.stringToken}`;
        }
        return message;
    }
    async ethSignMintNFT(mintNFT) {
        const message = this.getMintNFTEthSignMessage(mintNFT);
        return await this.getEthMessageSignature(message);
    }
    async ethSignWithdrawNFT(withdrawNFT) {
        const message = this.getWithdrawNFTEthSignMessage(withdrawNFT);
        return await this.getEthMessageSignature(message);
    }
    async ethSignWithdraw(withdraw) {
        const message = this.getWithdrawEthSignMessage(withdraw);
        service_1.Trace.debug("SignMessage", message);
        return await this.getEthMessageSignature(message);
    }
    getChangePubKeyEthSignMessage(changePubKey) {
        return (0, utils_1.getChangePubkeyMessage)(changePubKey.pubKeyHash, changePubKey.nonce, changePubKey.accountId);
    }
    async ethSignChangePubKey(changePubKey) {
        const message = this.getChangePubKeyEthSignMessage(changePubKey);
        return await this.getEthMessageSignature(message);
    }
    async ethSignRegisterFactoryMessage(factoryAddress, accountId, accountAddress) {
        const factoryAddressHex = ethers.utils.hexlify((0, utils_1.serializeAddress)(factoryAddress)).substr(2);
        const accountAddressHex = ethers.utils.hexlify((0, utils_1.serializeAddress)(accountAddress)).substr(2);
        const msgAccId = ethers.utils.hexlify((0, utils_1.serializeAccountId)(accountId)).substr(2);
        const message = `\nCreator's account ID in zkSync: ${msgAccId}\n` +
            `Creator: ${accountAddressHex}\n` +
            `Factory: ${factoryAddressHex}`;
        const msgBytes = ethers.utils.toUtf8Bytes(message);
        return await this.getEthMessageSignature(msgBytes);
    }
}
exports.EthMessageSigner = EthMessageSigner;
