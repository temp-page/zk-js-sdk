"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteWallet = exports.submitSignedTransactionsBatch = exports.submitSignedTransaction = exports.ETHOperation = exports.Transaction = void 0;
const ethers_1 = require("ethers");
const eth_message_signer_1 = require("./eth-message-signer");
const operations_1 = require("./operations");
const abstract_wallet_1 = require("./abstract-wallet");
var operations_2 = require("./operations");
Object.defineProperty(exports, "Transaction", { enumerable: true, get: function () { return operations_2.Transaction; } });
Object.defineProperty(exports, "ETHOperation", { enumerable: true, get: function () { return operations_2.ETHOperation; } });
Object.defineProperty(exports, "submitSignedTransaction", { enumerable: true, get: function () { return operations_2.submitSignedTransaction; } });
Object.defineProperty(exports, "submitSignedTransactionsBatch", { enumerable: true, get: function () { return operations_2.submitSignedTransactionsBatch; } });
class RemoteWallet extends abstract_wallet_1.AbstractWallet {
    constructor(web3Provider, _ethMessageSigner, cachedAddress, accountId) {
        super(cachedAddress, accountId);
        this.web3Provider = web3Provider;
        this._ethMessageSigner = _ethMessageSigner;
        this.web3Signer = web3Provider.getSigner();
    }
    // ************
    // Constructors
    //
    static async fromEthSigner(web3Provider, provider, accountId) {
        // Since this wallet implementation requires the signer to support custom RPC method,
        // we can assume that eth signer type is a constant to avoid requesting a signature each time
        // user connects.
        const ethSignerType = {
            verificationMethod: 'ERC-1271',
            isSignedMsgPrefixed: true
        };
        const ethMessageSigner = new eth_message_signer_1.EthMessageSigner(web3Provider.getSigner(), ethSignerType);
        const wallet = new RemoteWallet(web3Provider, ethMessageSigner, await web3Provider.getSigner().getAddress(), accountId);
        wallet.connect(provider);
        await wallet.verifyNetworks();
        return wallet;
    }
    // ****************
    // Abstract getters
    //
    ethSigner() {
        return this.web3Signer;
    }
    ethMessageSigner() {
        return this._ethMessageSigner;
    }
    syncSignerConnected() {
        // Sync signer is the Eth signer, which is always connected.
        return true;
    }
    async syncSignerPubKeyHash() {
        let pubKeyHash = await this.callExtSignerPubKeyHash();
        pubKeyHash = pubKeyHash.replace('0x', 'sync:');
        return pubKeyHash;
    }
    // *********************
    // Batch builder methods
    //
    async processBatchBuilderTransactions(startNonce, txs) {
        let nonce = await this.getNonce(startNonce);
        // Collect transaction bodies and set nonces in it.
        const txsToSign = txs.map((tx) => {
            tx.tx.nonce = nonce;
            nonce += 1;
            return { type: tx.type, ...tx.tx };
        });
        const signedTransactions = await this.callExtSignZkSyncBatch(txsToSign);
        // Each transaction will have its own Ethereum signature, if it's required.
        // There will be no umbrella signature for the whole batch.
        return { txs: signedTransactions };
    }
    // **************
    // L2 operations
    //
    async signSyncTransfer(transfer) {
        const signed = await this.callExtSignZkSyncBatch([{ type: 'Transfer', ...transfer }]);
        return signed[0];
    }
    async syncTransfer(transfer) {
        const signed = await this.signSyncTransfer(transfer);
        return (0, operations_1.submitSignedTransaction)(signed, this.provider);
    }
    // ChangePubKey part
    async signSetSigningKey(changePubKey) {
        const signed = await this.callExtSignZkSyncBatch([{ type: 'ChangePubKey', ...changePubKey }]);
        return signed[0];
    }
    async setSigningKey(changePubKey) {
        const signed = await this.signSetSigningKey(changePubKey);
        return (0, operations_1.submitSignedTransaction)(signed, this.provider);
    }
    // Withdraw part
    async signWithdrawFromSyncToEthereum(withdraw) {
        const signed = await this.callExtSignZkSyncBatch([{ type: 'Withdraw', ...withdraw }]);
        return signed[0];
    }
    async withdrawFromSyncToEthereum(withdraw) {
        const fastProcessing = withdraw.fastProcessing;
        const signed = await this.signWithdrawFromSyncToEthereum(withdraw);
        return (0, operations_1.submitSignedTransaction)(signed, this.provider, fastProcessing);
    }
    // Forced exit part
    async signSyncForcedExit(forcedExit) {
        const signed = await this.callExtSignZkSyncBatch([{ type: 'ForcedExit', ...forcedExit }]);
        return signed[0];
    }
    async syncForcedExit(forcedExit) {
        const signed = await this.signSyncForcedExit(forcedExit);
        return (0, operations_1.submitSignedTransaction)(signed, this.provider);
    }
    // Swap part
    async signOrder(order) {
        return await this.callExtSignOrder({ type: 'Order', ...order });
    }
    async signSyncSwap(swap) {
        const signed = await this.callExtSignZkSyncBatch([{ type: 'Swap', ...swap }]);
        return signed[0];
    }
    async syncSwap(swap) {
        const signed = await this.signSyncSwap(swap);
        return (0, operations_1.submitSignedTransaction)(signed, this.provider);
    }
    // Mint NFT part
    async signMintNFT(mintNFT) {
        const signed = await this.callExtSignZkSyncBatch([{ type: 'MintNFT', ...mintNFT }]);
        return signed[0];
    }
    async mintNFT(mintNFT) {
        const signed = await this.signMintNFT(mintNFT);
        return (0, operations_1.submitSignedTransaction)(signed, this.provider);
    }
    // Withdraw NFT part
    async signWithdrawNFT(withdrawNFT) {
        const signed = await this.callExtSignZkSyncBatch([{ type: 'WithdrawNFT', ...withdrawNFT }]);
        return signed[0];
    }
    async withdrawNFT(withdrawNFT) {
        const fastProcessing = withdrawNFT.fastProcessing;
        const signed = await this.signWithdrawNFT(withdrawNFT);
        return (0, operations_1.submitSignedTransaction)(signed, this.provider, fastProcessing);
    }
    // Transfer NFT part
    async syncTransferNFT(transfer) {
        transfer.nonce = transfer.nonce != null ? await this.getNonce(transfer.nonce) : await this.getNonce();
        let fee;
        if (transfer.fee == null) {
            fee = await this.provider.getTransactionsBatchFee(['Transfer', 'Transfer'], [transfer.to, this.address()], transfer.feeToken);
        }
        else {
            fee = transfer.fee;
        }
        const txNFT = {
            to: transfer.to,
            token: transfer.token.id,
            amount: 1,
            fee: 0
        };
        const txFee = {
            to: this.address(),
            token: transfer.feeToken,
            amount: 0,
            fee
        };
        return await this.syncMultiTransfer([txNFT, txFee]);
    }
    // Multi-transfer part
    // Note: this method signature requires to specify fee in each transaction.
    // For details, see the comment on this method in `AbstractWallet` class.
    async syncMultiTransfer(_transfers) {
        const transfers = _transfers.map((transfer) => {
            return {
                type: 'Transfer',
                ...transfer
            };
        });
        const signed = await this.callExtSignZkSyncBatch(transfers);
        return (0, operations_1.submitSignedTransactionsBatch)(this.provider, signed);
    }
    // ****************
    // Internal methods
    //
    /**
     *
     * Makes all fields that represent amount to be of `string` type
     * and all fields that represent tokens to be token ids i.e. of `number` type.
     * Also, it renames `ethAddress` parameter to `to` for withdrawals.
     *
     * @param txs A list of transactions
     *
     * @returns A list of prepared transactions
     */
    prepareTxsBeforeSending(txs) {
        const amountFields = ['amount', 'fee'];
        const tokenFields = ['token', 'feeToken', 'tokenSell', 'tokenBuy'];
        return txs.map((tx) => {
            for (const field of amountFields) {
                if (field in tx) {
                    tx[field] = ethers_1.BigNumber.from(tx[field]).toString();
                }
            }
            for (const field of tokenFields) {
                if (field in tx) {
                    tx[field] = this.provider.tokenSet.resolveTokenId(tx[field]);
                }
            }
            if ('amounts' in tx) {
                tx.amounts = [ethers_1.BigNumber.from(tx.amounts[0]).toString(), ethers_1.BigNumber.from(tx.amounts[1]).toString()];
            }
            if ('ethAddress' in tx) {
                tx.to = tx.ethAddress;
                delete tx.ethAddress;
            }
            return tx;
        });
    }
    /**
     * Performs an RPC call to the custom `zkSync_signBatch` method.
     * This method is specified here: https://github.com/argentlabs/argent-contracts-l2/discussions/4
     *
     * Basically, it's an addition to the WalletConnect server that accepts intentionally incomplete
     * transactions (e.g. with no account IDs resolved), and returns transactions with both L1 and L2
     * signatures.
     *
     * @param txs A list of transactions to be signed.
     *
     * @returns A list of singed transactions.
     */
    async callExtSignZkSyncBatch(txs) {
        try {
            const preparedTxs = this.prepareTxsBeforeSending(txs);
            // Response must be an array of signed transactions.
            // Transactions are flattened (ethereum signatures are on the same level as L2 signatures),
            // so we need to "unflat" each one.
            const response = await this.web3Provider.send('zkSync_signBatch', [preparedTxs]);
            const transactions = response.map((tx) => {
                const ethereumSignature = tx['ethereumSignature'];
                // Remove the L1 signature from the transaction data.
                delete tx['ethereumSignature'];
                return {
                    tx,
                    ethereumSignature
                };
            });
            return transactions;
        }
        catch (e) {
            console.error(`Received an error performing 'zkSync_signBatch' request: ${e.toString()}`);
            throw new Error('Wallet server returned a malformed response to the sign batch request');
        }
    }
    /**
     * Performs an RPC call to the custom `zkSync_signBatch` method.
     *
     * @param txs An order data to be signed.
     *
     * @returns The completed and signed offer.
     */
    async callExtSignOrder(order) {
        try {
            const preparedOrder = this.prepareTxsBeforeSending([order]);
            // For now, we assume that the same method will be used for both signing transactions and orders.
            const signedOrder = (await this.web3Provider.send('zkSync_signBatch', [preparedOrder]))[0];
            // Sanity check
            if (!signedOrder['signature']) {
                throw new Error('Wallet server returned a malformed response to the sign order request');
            }
            return signedOrder;
        }
        catch (e) {
            // TODO: Catching general error is a bad idea, as a lot of things can throw an exception.
            console.error(`Received an error performing 'zkSync_signOrder' request: ${e.toString()}`);
            throw new Error('Wallet server returned a malformed response to the sign order request');
        }
    }
    /**
     * Performs an RPC call to the custom `zkSync_signerPubKeyHash` method.
     *
     * This method should return a public key hash associated with the wallet
     */
    async callExtSignerPubKeyHash() {
        try {
            const response = await this.web3Provider.send('zkSync_signerPubKeyHash', null);
            if (!response['pubKeyHash']) {
                throw new Error('Wallet server returned a malformed response to the PubKeyHash request');
            }
            return response['pubKeyHash'];
        }
        catch (e) {
            // TODO: Catching general error is a bad idea, as a lot of things can throw an exception.
            console.error(`Received an error performing 'zkSync_signerPubKeyHash' request: ${e.toString()}`);
            throw new Error('Wallet server returned a malformed response to the PubKeyHash request');
        }
    }
}
exports.RemoteWallet = RemoteWallet;
