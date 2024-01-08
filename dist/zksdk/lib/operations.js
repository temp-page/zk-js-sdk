"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitSignedTransactionsBatch = exports.submitSignedTransaction = exports.Transaction = exports.ETHOperation = exports.ZKSyncTxError = void 0;
const utils_1 = require("./utils");
class ZKSyncTxError extends Error {
    constructor(message, value) {
        super(message);
        this.value = value;
    }
}
exports.ZKSyncTxError = ZKSyncTxError;
class ETHOperation {
    constructor(ethTx, zkSyncProvider) {
        this.ethTx = ethTx;
        this.zkSyncProvider = zkSyncProvider;
        this.state = 'Sent';
    }
    async awaitEthereumTxCommit() {
        if (this.state !== 'Sent')
            return;
        const txReceipt = await this.ethTx.wait();
        for (const log of txReceipt.logs) {
            try {
                const priorityQueueLog = utils_1.SYNC_MAIN_CONTRACT_INTERFACE.parseLog(log);
                if (priorityQueueLog && priorityQueueLog.args.serialId != null) {
                    this.priorityOpId = priorityQueueLog.args.serialId;
                }
            }
            catch { }
        }
        if (!this.priorityOpId) {
            throw new Error('Failed to parse tx logs');
        }
        this.state = 'Mined';
        return txReceipt;
    }
    async awaitReceipt() {
        this.throwErrorIfFailedState();
        await this.awaitEthereumTxCommit();
        if (this.state !== 'Mined')
            return;
        let query;
        if (this.zkSyncProvider.providerType === 'RPC') {
            query = this.priorityOpId.toNumber();
        }
        else {
            query = this.ethTx.hash;
        }
        const receipt = await this.zkSyncProvider.notifyPriorityOp(query, 'COMMIT');
        if (!receipt.executed) {
            this.setErrorState(new ZKSyncTxError('Priority operation failed', receipt));
            this.throwErrorIfFailedState();
        }
        this.state = 'Committed';
        return receipt;
    }
    async awaitVerifyReceipt() {
        await this.awaitReceipt();
        if (this.state !== 'Committed')
            return;
        let query;
        if (this.zkSyncProvider.providerType === 'RPC') {
            query = this.priorityOpId.toNumber();
        }
        else {
            query = this.ethTx.hash;
        }
        const receipt = await this.zkSyncProvider.notifyPriorityOp(query, 'VERIFY');
        this.state = 'Verified';
        return receipt;
    }
    setErrorState(error) {
        this.state = 'Failed';
        this.error = error;
    }
    throwErrorIfFailedState() {
        if (this.state === 'Failed')
            throw this.error;
    }
}
exports.ETHOperation = ETHOperation;
class Transaction {
    constructor(txData, txHash, sidechainProvider) {
        this.txData = txData;
        this.txHash = txHash;
        this.sidechainProvider = sidechainProvider;
        this.state = 'Sent';
    }
    async awaitReceipt() {
        this.throwErrorIfFailedState();
        if (this.state !== 'Sent')
            return;
        const receipt = await this.sidechainProvider.notifyTransaction(this.txHash, 'COMMIT');
        if (!receipt.success) {
            this.setErrorState(new ZKSyncTxError(`zkSync transaction failed: ${receipt.failReason}`, receipt));
            this.throwErrorIfFailedState();
        }
        this.state = 'Committed';
        return receipt;
    }
    async awaitVerifyReceipt() {
        await this.awaitReceipt();
        const receipt = await this.sidechainProvider.notifyTransaction(this.txHash, 'VERIFY');
        this.state = 'Verified';
        return receipt;
    }
    setErrorState(error) {
        this.state = 'Failed';
        this.error = error;
    }
    throwErrorIfFailedState() {
        if (this.state === 'Failed')
            throw this.error;
    }
}
exports.Transaction = Transaction;
async function submitSignedTransaction(signedTx, provider, fastProcessing) {
    const transactionHash = await provider.submitTx(signedTx.tx, signedTx.ethereumSignature, fastProcessing);
    return new Transaction(signedTx, transactionHash, provider);
}
exports.submitSignedTransaction = submitSignedTransaction;
async function submitSignedTransactionsBatch(provider, signedTxs, ethSignatures) {
    const transactionHashes = await provider.submitTxsBatch(signedTxs.map((tx) => {
        return { tx: tx.tx, signature: tx.ethereumSignature };
    }), ethSignatures);
    return transactionHashes.map((txHash, idx) => new Transaction(signedTxs[idx], txHash, provider));
}
exports.submitSignedTransactionsBatch = submitSignedTransactionsBatch;
