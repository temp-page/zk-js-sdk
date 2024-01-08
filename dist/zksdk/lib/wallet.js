"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = exports.submitSignedTransactionsBatch = exports.submitSignedTransaction = exports.ETHOperation = exports.Transaction = void 0;
const ethers_1 = require("ethers");
const eth_message_signer_1 = require("./eth-message-signer");
const signer_1 = require("./signer");
const utils_1 = require("./utils");
const operations_1 = require("./operations");
const abstract_wallet_1 = require("./abstract-wallet");
var operations_2 = require("./operations");
Object.defineProperty(exports, "Transaction", { enumerable: true, get: function () { return operations_2.Transaction; } });
Object.defineProperty(exports, "ETHOperation", { enumerable: true, get: function () { return operations_2.ETHOperation; } });
Object.defineProperty(exports, "submitSignedTransaction", { enumerable: true, get: function () { return operations_2.submitSignedTransaction; } });
Object.defineProperty(exports, "submitSignedTransactionsBatch", { enumerable: true, get: function () { return operations_2.submitSignedTransactionsBatch; } });
class Wallet extends abstract_wallet_1.AbstractWallet {
    constructor(_ethSigner, _ethMessageSigner, cachedAddress, signer, accountId, ethSignerType) {
        super(cachedAddress, accountId);
        this._ethSigner = _ethSigner;
        this._ethMessageSigner = _ethMessageSigner;
        this.signer = signer;
        this.ethSignerType = ethSignerType;
    }
    // ************
    // Constructors
    //
    static async fromEthSigner(ethWallet, provider, signer, accountId, ethSignerType) {
        if (signer == null) {
            const signerResult = await signer_1.Signer.fromETHSignature(ethWallet);
            signer = signerResult.signer;
            ethSignerType = ethSignerType || signerResult.ethSignatureType;
        }
        else if (ethSignerType == null) {
            throw new Error('If you passed signer, you must also pass ethSignerType.');
        }
        const ethMessageSigner = new eth_message_signer_1.EthMessageSigner(ethWallet, ethSignerType);
        const wallet = new Wallet(ethWallet, ethMessageSigner, await ethWallet.getAddress(), signer, accountId, ethSignerType);
        wallet.connect(provider);
        await wallet.verifyNetworks();
        return wallet;
    }
    static async fromCreate2Data(syncSigner, provider, create2Data, accountId) {
        const create2Signer = new signer_1.Create2WalletSigner(await syncSigner.pubKeyHash(), create2Data);
        return await Wallet.fromEthSigner(create2Signer, provider, syncSigner, accountId, {
            verificationMethod: 'ERC-1271',
            isSignedMsgPrefixed: true
        });
    }
    static async fromEthSignerNoKeys(ethWallet, provider, accountId, ethSignerType) {
        const ethMessageSigner = new eth_message_signer_1.EthMessageSigner(ethWallet, ethSignerType);
        const wallet = new Wallet(ethWallet, ethMessageSigner, await ethWallet.getAddress(), undefined, accountId, ethSignerType);
        wallet.connect(provider);
        await wallet.verifyNetworks();
        return wallet;
    }
    static async fromSyncSigner(ethWallet, syncSigner, provider, accountId) {
        return await Wallet.fromEthSigner(ethWallet, provider, syncSigner, accountId, {
            verificationMethod: 'ERC-1271',
            isSignedMsgPrefixed: true
        });
    }
    // ****************
    // Abstract getters
    //
    ethSigner() {
        return this._ethSigner;
    }
    ethMessageSigner() {
        return this._ethMessageSigner;
    }
    syncSignerConnected() {
        return this.signer != null;
    }
    async syncSignerPubKeyHash() {
        return await this.signer.pubKeyHash();
    }
    // *********************
    // Batch builder methods
    //
    async processBatchBuilderTransactions(startNonce, txs) {
        const processedTxs = [];
        const messages = [];
        let nonce = await this.getNonce(startNonce);
        const batchNonce = nonce;
        for (const tx of txs) {
            tx.tx.nonce = nonce++;
            switch (tx.type) {
                case 'Withdraw': {
                    messages.push(this.getWithdrawEthMessagePart(tx.tx));
                    const withdraw = { tx: await this.getWithdrawFromSyncToEthereum(tx.tx) };
                    processedTxs.push(withdraw);
                    break;
                }
                case 'Transfer': {
                    messages.push(await this.getTransferEthMessagePart(tx.tx));
                    const transfer = { tx: await this.getTransfer(tx.tx) };
                    processedTxs.push(transfer);
                    break;
                }
                case 'ChangePubKey': {
                    // ChangePubKey requires its own Ethereum signature, we either expect
                    // it to be signed already or do it here.
                    const changePubKey = tx.alreadySigned
                        ? tx.tx
                        : (await this.signSetSigningKey(tx.tx)).tx;
                    const currentPubKeyHash = await this.getCurrentPubKeyHash();
                    if (currentPubKeyHash === changePubKey.newPkHash) {
                        throw new Error('Current signing key is already set');
                    }
                    messages.push(this.getChangePubKeyEthMessagePart({
                        pubKeyHash: changePubKey.newPkHash,
                        feeToken: tx.token,
                        fee: changePubKey.fee
                    }));
                    processedTxs.push({ tx: changePubKey });
                    break;
                }
                case 'ForcedExit': {
                    messages.push(this.getForcedExitEthMessagePart(tx.tx));
                    const forcedExit = { tx: await this.getForcedExit(tx.tx) };
                    processedTxs.push(forcedExit);
                    break;
                }
                case 'MintNFT': {
                    messages.push(this.getMintNFTEthMessagePart(tx.tx));
                    const mintNft = { tx: await this.getMintNFT(tx.tx) };
                    processedTxs.push(mintNft);
                    break;
                }
                case 'Swap': {
                    messages.push(this.getSwapEthSignMessagePart(tx.tx));
                    const swap = {
                        tx: await this.getSwap(tx.tx),
                        ethereumSignature: [
                            null,
                            tx.tx.orders[0].ethSignature || null,
                            tx.tx.orders[1].ethSignature || null
                        ]
                    };
                    processedTxs.push(swap);
                    break;
                }
                case 'WithdrawNFT': {
                    messages.push(this.getWithdrawNFTEthMessagePart(tx.tx));
                    const withdrawNft = { tx: await this.getWithdrawNFT(tx.tx) };
                    processedTxs.push(withdrawNft);
                    break;
                }
            }
        }
        messages.push(`Nonce: ${batchNonce}`);
        const message = messages.filter((part) => part.length != 0).join('\n');
        const signature = await this.ethMessageSigner().getEthMessageSignature(message);
        return {
            txs: processedTxs,
            signature
        };
    }
    // **************
    // L2 operations
    //
    async signSyncTransfer(transfer) {
        transfer.validFrom = transfer.validFrom || 0;
        transfer.validUntil = transfer.validUntil || utils_1.MAX_TIMESTAMP;
        const signedTransferTransaction = await this.getTransfer(transfer);
        const stringAmount = ethers_1.BigNumber.from(transfer.amount).isZero()
            ? null
            : this.provider.tokenSet.formatToken(transfer.token, transfer.amount);
        const stringFee = ethers_1.BigNumber.from(transfer.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(transfer.token, transfer.fee);
        const stringToken = this.provider.tokenSet.resolveTokenSymbol(transfer.token);
        const ethereumSignature = (0, signer_1.unableToSign)(this.ethSigner())
            ? null
            : await this.ethMessageSigner().ethSignTransfer({
                stringAmount,
                stringFee,
                stringToken,
                to: transfer.to,
                nonce: transfer.nonce,
                accountId: this.accountId
            });
        return {
            tx: signedTransferTransaction,
            ethereumSignature
        };
    }
    async syncTransfer(transfer) {
        transfer.nonce = transfer.nonce != null ? await this.getNonce(transfer.nonce) : await this.getNonce();
        if (transfer.fee == null) {
            const fullFee = await this.provider.getTransactionFee('Transfer', transfer.to, transfer.token);
            transfer.fee = fullFee.totalFee;
        }
        const signedTransferTransaction = await this.signSyncTransfer(transfer);
        return (0, operations_1.submitSignedTransaction)(signedTransferTransaction, this.provider);
    }
    // ChangePubKey part
    async signSetSigningKey(changePubKey) {
        const newPubKeyHash = await this.signer.pubKeyHash();
        let ethAuthData;
        let ethSignature;
        if (changePubKey.ethAuthType === 'Onchain') {
            ethAuthData = {
                type: 'Onchain'
            };
        }
        else if (changePubKey.ethAuthType === 'ECDSA') {
            await this.setRequiredAccountIdFromServer('ChangePubKey authorized by ECDSA.');
            const changePubKeyMessage = (0, utils_1.getChangePubkeyMessage)(newPubKeyHash, changePubKey.nonce, this.accountId, changePubKey.batchHash);
            const ethSignature = (await this.ethMessageSigner().getEthMessageSignature(changePubKeyMessage)).signature;
            ethAuthData = {
                type: 'ECDSA',
                ethSignature,
                batchHash: changePubKey.batchHash
            };
        }
        else if (changePubKey.ethAuthType === 'EIP712') {
            const domain = (0, utils_1.getDomain)(await this.ethSigner().getChainId());
            const types = (0, utils_1.changePubKeyEIP712Types)();
            const pubKeyHash = newPubKeyHash.replace('sync:', '0x');
            const changePubKeyMessage = {
                pubKeyHash,
                nonce: changePubKey.nonce,
                accountId: await this.getAccountId()
            };
            const ethSignature = await this.ethSigner()._signTypedData(domain, types, changePubKeyMessage);
            ethAuthData = {
                type: 'EIP712',
                ethSignature,
                batchHash: changePubKey.batchHash
            };
        }
        else if (changePubKey.ethAuthType === 'CREATE2') {
            const ethSigner = this.ethSigner();
            if (ethSigner instanceof signer_1.Create2WalletSigner) {
                const create2data = ethSigner.create2WalletData;
                ethAuthData = {
                    type: 'CREATE2',
                    creatorAddress: create2data.creatorAddress,
                    saltArg: create2data.saltArg,
                    codeHash: create2data.codeHash
                };
            }
            else {
                throw new Error('CREATE2 wallet authentication is only available for CREATE2 wallets');
            }
        }
        else if (changePubKey.ethAuthType === 'ECDSALegacyMessage') {
            await this.setRequiredAccountIdFromServer('ChangePubKey authorized by ECDSALegacyMessage.');
            const changePubKeyMessage = (0, utils_1.getChangePubkeyLegacyMessage)(newPubKeyHash, changePubKey.nonce, this.accountId);
            ethSignature = (await this.ethMessageSigner().getEthMessageSignature(changePubKeyMessage)).signature;
        }
        else {
            throw new Error('Unsupported SetSigningKey type');
        }
        const changePubkeyTxUnsigned = Object.assign(changePubKey, { ethAuthData, ethSignature });
        changePubkeyTxUnsigned.validFrom = changePubKey.validFrom || 0;
        changePubkeyTxUnsigned.validUntil = changePubKey.validUntil || utils_1.MAX_TIMESTAMP;
        const changePubKeyTx = await this.getChangePubKey(changePubkeyTxUnsigned);
        return {
            tx: changePubKeyTx
        };
    }
    async setSigningKey(changePubKey) {
        changePubKey.nonce =
            changePubKey.nonce != null ? await this.getNonce(changePubKey.nonce) : await this.getNonce();
        if (changePubKey.fee == null) {
            changePubKey.fee = 0;
            if (changePubKey.ethAuthType === 'ECDSALegacyMessage') {
                const feeType = {
                    ChangePubKey: {
                        onchainPubkeyAuth: false
                    }
                };
                const fullFee = await this.provider.getTransactionFee(feeType, this.address(), changePubKey.feeToken);
                changePubKey.fee = fullFee.totalFee;
            }
            else {
                const feeType = {
                    ChangePubKey: changePubKey.ethAuthType
                };
                const fullFee = await this.provider.getTransactionFee(feeType, this.address(), changePubKey.feeToken);
                changePubKey.fee = fullFee.totalFee;
            }
        }
        const txData = await this.signSetSigningKey(changePubKey);
        const currentPubKeyHash = await this.getCurrentPubKeyHash();
        if (currentPubKeyHash === txData.tx.newPkHash) {
            throw new Error('Current signing key is already set');
        }
        return this.provider.curveChangePubKey(txData.tx);
    }
    // Withdraw part
    async signWithdrawFromSyncToEthereum(withdraw) {
        withdraw.validFrom = withdraw.validFrom || 0;
        withdraw.validUntil = withdraw.validUntil || utils_1.MAX_TIMESTAMP;
        const signedWithdrawTransaction = await this.getWithdrawFromSyncToEthereum(withdraw);
        const stringAmount = ethers_1.BigNumber.from(withdraw.amount).isZero()
            ? null
            : this.provider.tokenSet.formatToken(withdraw.token, withdraw.amount);
        const stringFee = ethers_1.BigNumber.from(withdraw.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(withdraw.token, withdraw.fee);
        const stringToken = this.provider.tokenSet.resolveTokenSymbol(withdraw.token);
        const ethereumSignature = (0, signer_1.unableToSign)(this.ethSigner())
            ? null
            : await this.ethMessageSigner().ethSignWithdraw({
                stringAmount,
                stringFee,
                stringToken,
                ethAddress: withdraw.ethAddress,
                nonce: withdraw.nonce,
                accountId: this.accountId
            });
        return {
            tx: signedWithdrawTransaction,
            ethereumSignature
        };
    }
    async withdrawFromSyncToEthereum(withdraw) {
        withdraw.nonce = withdraw.nonce != null ? await this.getNonce(withdraw.nonce) : await this.getNonce();
        if (withdraw.fee == null) {
            const feeType = withdraw.fastProcessing === true ? 'FastWithdraw' : 'Withdraw';
            const fullFee = await this.provider.getTransactionFee(feeType, withdraw.ethAddress, withdraw.token);
            withdraw.fee = fullFee.totalFee;
        }
        const signedWithdrawTransaction = await this.signWithdrawFromSyncToEthereum(withdraw);
        return (0, operations_1.submitSignedTransaction)(signedWithdrawTransaction, this.provider, withdraw.fastProcessing);
    }
    // Forced exit part
    async signSyncForcedExit(forcedExit) {
        const signedForcedExitTransaction = await this.getForcedExit(forcedExit);
        const stringFee = ethers_1.BigNumber.from(forcedExit.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(forcedExit.token, forcedExit.fee);
        const stringToken = this.provider.tokenSet.resolveTokenSymbol(forcedExit.token);
        const ethereumSignature = (0, signer_1.unableToSign)(this.ethSigner())
            ? null
            : await this.ethMessageSigner().ethSignForcedExit({
                stringToken,
                stringFee,
                target: forcedExit.target,
                nonce: forcedExit.nonce
            });
        return {
            tx: signedForcedExitTransaction,
            ethereumSignature
        };
    }
    async syncForcedExit(forcedExit) {
        forcedExit.nonce = forcedExit.nonce != null ? await this.getNonce(forcedExit.nonce) : await this.getNonce();
        if (forcedExit.fee == null) {
            const fullFee = await this.provider.getTransactionFee('ForcedExit', forcedExit.target, forcedExit.token);
            forcedExit.fee = fullFee.totalFee;
        }
        const signedForcedExitTransaction = await this.signSyncForcedExit(forcedExit);
        return (0, operations_1.submitSignedTransaction)(signedForcedExitTransaction, this.provider);
    }
    // Swap part
    async signOrder(orderData) {
        const order = await this.getPartialOrder(orderData);
        const stringAmount = ethers_1.BigNumber.from(order.amount).isZero()
            ? null
            : this.provider.tokenSet.formatToken(order.tokenSell, order.amount);
        const stringTokenSell = await this.provider.getTokenSymbol(order.tokenSell);
        const stringTokenBuy = await this.provider.getTokenSymbol(order.tokenBuy);
        const ethereumSignature = (0, signer_1.unableToSign)(this.ethSigner())
            ? null
            : await this.ethMessageSigner().ethSignOrder({
                amount: stringAmount,
                tokenSell: stringTokenSell,
                tokenBuy: stringTokenBuy,
                nonce: order.nonce,
                recipient: order.recipient,
                ratio: order.ratio
            });
        order.ethSignature = ethereumSignature;
        return order;
    }
    async signSyncSwap(swap) {
        const signedSwapTransaction = await this.getSwap(swap);
        const stringFee = ethers_1.BigNumber.from(swap.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(swap.feeToken, swap.fee);
        const stringToken = this.provider.tokenSet.resolveTokenSymbol(swap.feeToken);
        const ethereumSignature = (0, signer_1.unableToSign)(this.ethSigner())
            ? null
            : await this.ethMessageSigner().ethSignSwap({
                fee: stringFee,
                feeToken: stringToken,
                nonce: swap.nonce
            });
        return {
            tx: signedSwapTransaction,
            ethereumSignature: [
                ethereumSignature,
                swap.orders[0].ethSignature || null,
                swap.orders[1].ethSignature || null
            ]
        };
    }
    async syncSwap(swap) {
        swap.nonce = swap.nonce != null ? await this.getNonce(swap.nonce) : await this.getNonce();
        if (swap.fee == null) {
            const fullFee = await this.provider.getTransactionFee('Swap', this.address(), swap.feeToken);
            swap.fee = fullFee.totalFee;
        }
        if (swap.amounts == null) {
            const amount0 = ethers_1.BigNumber.from(swap.orders[0].amount);
            const amount1 = ethers_1.BigNumber.from(swap.orders[1].amount);
            if (!amount0.eq(0) && !amount1.eq(0)) {
                swap.amounts = [amount0, amount1];
            }
            else {
                throw new Error('If amounts in orders are implicit, you must specify them during submission');
            }
        }
        const signedSwapTransaction = await this.signSyncSwap(swap);
        return (0, operations_1.submitSignedTransaction)(signedSwapTransaction, this.provider);
    }
    // Mint NFT part
    async signMintNFT(mintNFT) {
        const signedMintNFTTransaction = await this.getMintNFT(mintNFT);
        const stringFee = ethers_1.BigNumber.from(mintNFT.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(mintNFT.feeToken, mintNFT.fee);
        const stringFeeToken = this.provider.tokenSet.resolveTokenSymbol(mintNFT.feeToken);
        const ethereumSignature = (0, signer_1.unableToSign)(this.ethSigner())
            ? null
            : await this.ethMessageSigner().ethSignMintNFT({
                stringFeeToken,
                stringFee,
                recipient: mintNFT.recipient,
                contentHash: mintNFT.contentHash,
                nonce: mintNFT.nonce
            });
        return {
            tx: signedMintNFTTransaction,
            ethereumSignature
        };
    }
    async mintNFT(mintNFT) {
        mintNFT.nonce = mintNFT.nonce != null ? await this.getNonce(mintNFT.nonce) : await this.getNonce();
        mintNFT.contentHash = ethers_1.ethers.utils.hexlify(mintNFT.contentHash);
        if (mintNFT.fee == null) {
            const fullFee = await this.provider.getTransactionFee('MintNFT', mintNFT.recipient, mintNFT.feeToken);
            mintNFT.fee = fullFee.totalFee;
        }
        const signedMintNFTTransaction = await this.signMintNFT(mintNFT);
        return (0, operations_1.submitSignedTransaction)(signedMintNFTTransaction, this.provider, false);
    }
    // Withdraw NFT part
    async signWithdrawNFT(withdrawNFT) {
        withdrawNFT.validFrom = withdrawNFT.validFrom || 0;
        withdrawNFT.validUntil = withdrawNFT.validUntil || utils_1.MAX_TIMESTAMP;
        const signedWithdrawNFTTransaction = await this.getWithdrawNFT(withdrawNFT);
        const stringFee = ethers_1.BigNumber.from(withdrawNFT.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(withdrawNFT.feeToken, withdrawNFT.fee);
        const stringFeeToken = this.provider.tokenSet.resolveTokenSymbol(withdrawNFT.feeToken);
        const ethereumSignature = (0, signer_1.unableToSign)(this.ethSigner())
            ? null
            : await this.ethMessageSigner().ethSignWithdrawNFT({
                token: withdrawNFT.token,
                to: withdrawNFT.to,
                stringFee,
                stringFeeToken,
                nonce: withdrawNFT.nonce
            });
        return {
            tx: signedWithdrawNFTTransaction,
            ethereumSignature
        };
    }
    async withdrawNFT(withdrawNFT) {
        withdrawNFT.nonce = withdrawNFT.nonce != null ? await this.getNonce(withdrawNFT.nonce) : await this.getNonce();
        if (!(0, utils_1.isNFT)(withdrawNFT.token)) {
            throw new Error('This token ID does not correspond to an NFT');
        }
        if (withdrawNFT.fee == null) {
            const feeType = withdrawNFT.fastProcessing === true ? 'FastWithdrawNFT' : 'WithdrawNFT';
            const fullFee = await this.provider.getTransactionFee(feeType, withdrawNFT.to, withdrawNFT.feeToken);
            withdrawNFT.fee = fullFee.totalFee;
        }
        const signedWithdrawNFTTransaction = await this.signWithdrawNFT(withdrawNFT);
        return (0, operations_1.submitSignedTransaction)(signedWithdrawNFTTransaction, this.provider, withdrawNFT.fastProcessing);
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
    async syncMultiTransfer(transfers) {
        if (!this.signer) {
            throw new Error('ZKSync signer is required for sending zksync transactions.');
        }
        if (transfers.length == 0)
            return [];
        await this.setRequiredAccountIdFromServer('Transfer funds');
        const batch = [];
        const messages = [];
        let nextNonce = transfers[0].nonce != null ? await this.getNonce(transfers[0].nonce) : await this.getNonce();
        const batchNonce = nextNonce;
        for (let i = 0; i < transfers.length; i++) {
            const transfer = transfers[i];
            const nonce = nextNonce;
            nextNonce += 1;
            const tx = await this.getTransfer({
                to: transfer.to,
                token: transfer.token,
                amount: transfer.amount,
                fee: transfer.fee,
                nonce,
                validFrom: transfer.validFrom || 0,
                validUntil: transfer.validUntil || utils_1.MAX_TIMESTAMP
            });
            const message = await this.getTransferEthMessagePart(transfer);
            messages.push(message);
            batch.push({ tx, signature: null });
        }
        messages.push(`Nonce: ${batchNonce}`);
        const message = messages.filter((part) => part.length != 0).join('\n');
        const ethSignatures = (0, signer_1.unableToSign)(this.ethSigner())
            ? []
            : [await this.ethMessageSigner().getEthMessageSignature(message)];
        const transactionHashes = await this.provider.submitTxsBatch(batch, ethSignatures);
        return transactionHashes.map((txHash, idx) => new operations_1.Transaction(batch[idx], txHash, this.provider));
    }
    // ****************
    // Internal methods
    //
    async getTransfer(transfer) {
        if (!this.signer) {
            throw new Error('ZKSync signer is required for sending zksync transactions.');
        }
        await this.setRequiredAccountIdFromServer('Transfer funds');
        const tokenId = this.provider.tokenSet.resolveTokenId(transfer.token);
        const transactionData = {
            accountId: this.accountId,
            from: this.address(),
            to: transfer.to,
            tokenId,
            amount: transfer.amount,
            fee: transfer.fee,
            nonce: transfer.nonce,
            validFrom: transfer.validFrom,
            validUntil: transfer.validUntil
        };
        return this.signer.signSyncTransfer(transactionData);
    }
    async getChangePubKey(changePubKey) {
        if (!this.signer) {
            throw new Error('ZKSync signer is required for current pubkey calculation.');
        }
        const feeTokenId = this.provider.tokenSet.resolveTokenId(changePubKey.feeToken);
        const newPkHash = await this.signer.pubKeyHash();
        await this.setRequiredAccountIdFromServer('Set Signing Key');
        const changePubKeyTx = await this.signer.signSyncChangePubKey({
            accountId: this.accountId,
            account: this.address(),
            newPkHash,
            nonce: changePubKey.nonce,
            feeTokenId,
            fee: ethers_1.BigNumber.from(changePubKey.fee).toString(),
            ethAuthData: changePubKey.ethAuthData,
            ethSignature: changePubKey.ethSignature,
            validFrom: changePubKey.validFrom,
            validUntil: changePubKey.validUntil
        });
        return changePubKeyTx;
    }
    async getWithdrawFromSyncToEthereum(withdraw) {
        if (!this.signer) {
            throw new Error('ZKSync signer is required for sending zksync transactions.');
        }
        await this.setRequiredAccountIdFromServer('Withdraw funds');
        const tokenId = this.provider.tokenSet.resolveTokenId(withdraw.token);
        const transactionData = {
            accountId: this.accountId,
            from: this.address(),
            ethAddress: withdraw.ethAddress,
            tokenId,
            amount: withdraw.amount,
            fee: withdraw.fee,
            nonce: withdraw.nonce,
            validFrom: withdraw.validFrom,
            validUntil: withdraw.validUntil,
            chainId: this.provider.chainId
        };
        return await this.signer.signSyncWithdraw(transactionData);
    }
    async addLiquidity(param) {
        if (!this.signer) {
            throw new Error('ZKSync signer is required for sending zksync transactions.');
        }
        await this.setRequiredAccountIdFromServer('Add Liquidity');
        const transactionData = {
            poolAccountId: param.poolAccountId,
            tokenIds: param.tokenIds,
            lpTokenId: param.lpTokenId,
            lpAmountMin: param.lpAmountMin,
            amounts: param.amounts,
            accountId: this.accountId,
            accountAddress: this.address(),
            nonce: await this.getNonce(),
        };
        const addLiquidity = await this.signer.signAddLiquidity(transactionData);
        return this.provider.addLiquidity(addLiquidity);
    }
    async removeLiquidity(param) {
        if (!this.signer) {
            throw new Error('ZKSync signer is required for sending zksync transactions.');
        }
        await this.setRequiredAccountIdFromServer('Remove Liquidity');
        const transactionData = {
            poolAccountId: param.poolAccountId,
            tokenIds: param.tokenIds,
            lpTokenId: param.lpTokenId,
            lpAmountMax: param.lpAmountMax,
            lpAmount: param.lpAmount,
            amounts: param.amounts,
            amountsMin: param.amountsMin,
            accountId: this.accountId,
            accountAddress: this.address(),
            nonce: await this.getNonce(),
        };
        const removeLiquidity = await this.signer.signRemoveLiquidity(transactionData);
        return this.provider.removeLiquidity(removeLiquidity);
    }
    async curveBaseSwap(param) {
        if (!this.signer) {
            throw new Error('ZKSync signer is required for sending zksync transactions.');
        }
        await this.setRequiredAccountIdFromServer('Remove Liquidity');
        const transactionData = {
            poolAccountId: param.poolAccountId,
            accountId: this.accountId,
            accountAddress: this.address(),
            nonce: await this.getNonce(),
            tokenIn: param.tokenIn,
            tokenOut: param.tokenOut,
            vin: param.vin,
            vout: param.vout,
            voutMin: param.voutMin
        };
        const result = await this.signer.signCurveBaseSwap(transactionData);
        return this.provider.curveBaseSwap(result);
    }
    async curveCombineSwap(param) {
        if (!this.signer) {
            throw new Error('ZKSync signer is required for sending zksync transactions.');
        }
        await this.setRequiredAccountIdFromServer('Remove Liquidity');
        const transactionData = {
            poolAccountId: param.poolAccountId,
            accountId: this.accountId,
            accountAddress: this.address(),
            nonce: await this.getNonce(),
            tokenIn: param.tokenIn,
            tokenOut: param.tokenOut,
            vin: param.vin,
            vout: param.vout,
            voutMin: param.voutMin
        };
        const result = await this.signer.signCurveCombineSwap(transactionData);
        return this.provider.curveCombineSwap(result);
    }
    async getForcedExit(forcedExit) {
        if (!this.signer) {
            throw new Error('ZKSync signer is required for sending zksync transactions.');
        }
        await this.setRequiredAccountIdFromServer('perform a Forced Exit');
        const tokenId = this.provider.tokenSet.resolveTokenId(forcedExit.token);
        const transactionData = {
            initiatorAccountId: this.accountId,
            target: forcedExit.target,
            tokenId,
            fee: forcedExit.fee,
            nonce: forcedExit.nonce,
            validFrom: forcedExit.validFrom || 0,
            validUntil: forcedExit.validUntil || utils_1.MAX_TIMESTAMP
        };
        return await this.signer.signSyncForcedExit(transactionData);
    }
    async getSwap(swap) {
        if (!this.signer) {
            throw new Error('zkSync signer is required for swapping funds');
        }
        await this.setRequiredAccountIdFromServer('Swap submission');
        const feeToken = this.provider.tokenSet.resolveTokenId(swap.feeToken);
        return this.signer.signSyncSwap({
            ...swap,
            submitterId: await this.getAccountId(),
            submitterAddress: this.address(),
            feeToken
        });
    }
    async getMintNFT(mintNFT) {
        if (!this.signer) {
            throw new Error('ZKSync signer is required for sending zksync transactions.');
        }
        await this.setRequiredAccountIdFromServer('MintNFT');
        const feeTokenId = this.provider.tokenSet.resolveTokenId(mintNFT.feeToken);
        const transactionData = {
            creatorId: this.accountId,
            creatorAddress: this.address(),
            recipient: mintNFT.recipient,
            contentHash: mintNFT.contentHash,
            feeTokenId,
            fee: mintNFT.fee,
            nonce: mintNFT.nonce
        };
        return await this.signer.signMintNFT(transactionData);
    }
    async getWithdrawNFT(withdrawNFT) {
        if (!this.signer) {
            throw new Error('ZKSync signer is required for sending zksync transactions.');
        }
        await this.setRequiredAccountIdFromServer('WithdrawNFT');
        const tokenId = this.provider.tokenSet.resolveTokenId(withdrawNFT.token);
        const feeTokenId = this.provider.tokenSet.resolveTokenId(withdrawNFT.feeToken);
        const transactionData = {
            accountId: this.accountId,
            from: this.address(),
            to: withdrawNFT.to,
            tokenId,
            feeTokenId,
            fee: withdrawNFT.fee,
            nonce: withdrawNFT.nonce,
            validFrom: withdrawNFT.validFrom,
            validUntil: withdrawNFT.validUntil
        };
        return await this.signer.signWithdrawNFT(transactionData);
    }
    getWithdrawNFTEthMessagePart(withdrawNFT) {
        const stringFee = ethers_1.BigNumber.from(withdrawNFT.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(withdrawNFT.feeToken, withdrawNFT.fee);
        const stringFeeToken = this.provider.tokenSet.resolveTokenSymbol(withdrawNFT.feeToken);
        return this.ethMessageSigner().getWithdrawNFTEthMessagePart({
            token: withdrawNFT.token,
            to: withdrawNFT.to,
            stringFee,
            stringFeeToken
        });
    }
    // The following methods are needed in case user decided to build
    // a message for the batch himself (e.g. in case of multi-authors batch).
    // It might seem that these belong to ethMessageSigner, however, we have
    // to resolve the token and format amount/fee before constructing the
    // transaction.
    async getTransferEthMessagePart(transfer) {
        const stringAmount = ethers_1.BigNumber.from(transfer.amount).isZero()
            ? null
            : this.provider.tokenSet.formatToken(transfer.token, transfer.amount);
        const stringFee = ethers_1.BigNumber.from(transfer.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(transfer.token, transfer.fee);
        const stringToken = await this.provider.getTokenSymbol(transfer.token);
        return this.ethMessageSigner().getTransferEthMessagePart({
            stringAmount,
            stringFee,
            stringToken,
            to: transfer.to
        });
    }
    getWithdrawEthMessagePart(withdraw) {
        const stringAmount = ethers_1.BigNumber.from(withdraw.amount).isZero()
            ? null
            : this.provider.tokenSet.formatToken(withdraw.token, withdraw.amount);
        const stringFee = ethers_1.BigNumber.from(withdraw.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(withdraw.token, withdraw.fee);
        const stringToken = this.provider.tokenSet.resolveTokenSymbol(withdraw.token);
        return this.ethMessageSigner().getWithdrawEthMessagePart({
            stringAmount,
            stringFee,
            stringToken,
            ethAddress: withdraw.ethAddress
        });
    }
    getChangePubKeyEthMessagePart(changePubKey) {
        const stringFee = ethers_1.BigNumber.from(changePubKey.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(changePubKey.feeToken, changePubKey.fee);
        const stringToken = this.provider.tokenSet.resolveTokenSymbol(changePubKey.feeToken);
        return this.ethMessageSigner().getChangePubKeyEthMessagePart({
            pubKeyHash: changePubKey.pubKeyHash,
            stringToken,
            stringFee
        });
    }
    getMintNFTEthMessagePart(mintNFT) {
        const stringFee = ethers_1.BigNumber.from(mintNFT.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(mintNFT.feeToken, mintNFT.fee);
        const stringFeeToken = this.provider.tokenSet.resolveTokenSymbol(mintNFT.feeToken);
        return this.ethMessageSigner().getMintNFTEthMessagePart({
            stringFeeToken,
            stringFee,
            recipient: mintNFT.recipient,
            contentHash: mintNFT.contentHash
        });
    }
    getSwapEthSignMessagePart(swap) {
        const stringFee = ethers_1.BigNumber.from(swap.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(swap.feeToken, swap.fee);
        const stringToken = this.provider.tokenSet.resolveTokenSymbol(swap.feeToken);
        return this.ethMessageSigner().getSwapEthSignMessagePart({
            fee: stringFee,
            feeToken: stringToken
        });
    }
    getForcedExitEthMessagePart(forcedExit) {
        const stringFee = ethers_1.BigNumber.from(forcedExit.fee).isZero()
            ? null
            : this.provider.tokenSet.formatToken(forcedExit.token, forcedExit.fee);
        const stringToken = this.provider.tokenSet.resolveTokenSymbol(forcedExit.token);
        return this.ethMessageSigner().getForcedExitEthMessagePart({
            stringToken,
            stringFee,
            target: forcedExit.target
        });
    }
    async getPartialOrder(order) {
        if (!this.signer) {
            throw new Error('zkSync signer is required for signing an order');
        }
        await this.setRequiredAccountIdFromServer('Swap order');
        const nonce = order.nonce != null ? await this.getNonce(order.nonce) : await this.getNonce();
        const recipient = order.recipient || this.address();
        let ratio;
        const sell = order.tokenSell;
        const buy = order.tokenBuy;
        if (!order.ratio[sell] || !order.ratio[buy]) {
            throw new Error(`Wrong tokens in the ratio object: should be ${sell} and ${buy}`);
        }
        if (order.ratio.type == 'Wei') {
            ratio = [order.ratio[sell], order.ratio[buy]];
        }
        else if (order.ratio.type == 'Token') {
            ratio = [
                this.provider.tokenSet.parseToken(sell, order.ratio[sell].toString()),
                this.provider.tokenSet.parseToken(buy, order.ratio[buy].toString())
            ];
        }
        const partialOrder = await this.signer.signSyncOrder({
            accountId: this.accountId,
            recipient,
            nonce,
            amount: order.amount || ethers_1.BigNumber.from(0),
            tokenSell: this.provider.tokenSet.resolveTokenId(order.tokenSell),
            tokenBuy: this.provider.tokenSet.resolveTokenId(order.tokenBuy),
            validFrom: order.validFrom || 0,
            validUntil: order.validUntil || utils_1.MAX_TIMESTAMP,
            ratio
        });
        return partialOrder;
    }
}
exports.Wallet = Wallet;
