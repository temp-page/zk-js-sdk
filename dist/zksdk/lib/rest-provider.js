"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestProvider = exports.RESTError = void 0;
const axios_1 = __importDefault(require("axios"));
const provider_interface_1 = require("./provider-interface");
const utils_1 = require("./utils");
const service_1 = require("../../service");
const operations_1 = require("./operations");
class RESTError extends Error {
    constructor(message, restError) {
        super(message);
        this.restError = restError;
    }
}
exports.RESTError = RESTError;
class RestProvider extends provider_interface_1.SyncProvider {
    constructor(address, curveBaseUrl, chainId) {
        super();
        this.address = address;
        this.curveBaseUrl = curveBaseUrl;
        this.chainId = chainId;
        this.providerType = 'Rest';
    }
    static async newProvider(address, chainId, tokensBySymbol, pollIntervalMilliSecs, network) {
        const provider = new RestProvider(address + '/api/v0.2', address, chainId);
        if (pollIntervalMilliSecs) {
            provider.pollIntervalMilliSecs = pollIntervalMilliSecs;
        }
        provider.contractAddress = await provider.getContractAddress();
        provider.tokenSet = new utils_1.TokenSet(tokensBySymbol);
        provider.network = network;
        return provider;
    }
    parseResponse(response, zk = true) {
        if (zk) {
            if (response.status === 'success') {
                return response.result;
            }
            else {
                throw new RESTError(`zkSync API response error: errorType: ${response.error.errorType};` +
                    ` code ${response.error.code}; message: ${response.error.message}`, response.error);
            }
        }
        else {
            if (response.code === 0) {
                return response.data;
            }
            else {
                throw new RESTError(`API response error: errorType: code ${response.code}; message: ${response.message}`, response.error);
            }
        }
    }
    async get(url) {
        service_1.Trace.debug('RestProvider get', url);
        return await axios_1.default.get(url).then((resp) => {
            service_1.Trace.debug('RestProvider get Success', url, resp.data);
            return resp.data;
        });
    }
    async post(url, body) {
        service_1.Trace.debug('RestProvider Post', url, body);
        return await axios_1.default.post(url, body).then((resp) => {
            service_1.Trace.debug('RestProvider Post Success', url, body, resp.data);
            return resp.data;
        });
    }
    async accountInfoDetailed(idOrAddress, infoType) {
        return await this.get(`${this.address}/accounts/${idOrAddress}/${infoType}`);
    }
    async accountInfo(idOrAddress, infoType) {
        return this.parseResponse(await this.accountInfoDetailed(idOrAddress, infoType));
    }
    async toggle2FADetailed(data) {
        return await this.post(`${this.address}/transactions/toggle2FA`, data);
    }
    async toggle2FA(data) {
        const response = this.parseResponse(await this.toggle2FADetailed(data));
        return response.success;
    }
    async accountFullInfoDetailed(idOrAddress) {
        return await this.get(`${this.address}/accounts/${idOrAddress}`);
    }
    async accountFullInfo(idOrAddress) {
        return this.parseResponse(await this.accountFullInfoDetailed(idOrAddress));
    }
    async accountTxsDetailed(idOrAddress, paginationQuery, token, secondIdOrAddress) {
        let url = `${this.address}/accounts/${idOrAddress}/transactions?from=${paginationQuery.from}` +
            `&limit=${paginationQuery.limit}&direction=${paginationQuery.direction}`;
        if (token)
            url += `&token=${token}`;
        if (secondIdOrAddress)
            url += `&secondAccount=${secondIdOrAddress}`;
        return await this.get(url);
    }
    async accountTxs(idOrAddress, paginationQuery, token, secondIdOrAddress) {
        return this.parseResponse(await this.accountTxsDetailed(idOrAddress, paginationQuery, token, secondIdOrAddress));
    }
    async accountPendingTxsDetailed(idOrAddress, paginationQuery) {
        return await this.get(`${this.address}/accounts/${idOrAddress}/transactions/pending?from=${paginationQuery.from}` +
            `&limit=${paginationQuery.limit}&direction=${paginationQuery.direction}`);
    }
    async accountPendingTxs(idOrAddress, paginationQuery) {
        return this.parseResponse(await this.accountPendingTxsDetailed(idOrAddress, paginationQuery));
    }
    async blockPaginationDetailed(paginationQuery) {
        return await this.get(`${this.address}/blocks?from=${paginationQuery.from}&limit=${paginationQuery.limit}` +
            `&direction=${paginationQuery.direction}`);
    }
    async blockPagination(paginationQuery) {
        return this.parseResponse(await this.blockPaginationDetailed(paginationQuery));
    }
    async blockByPositionDetailed(blockPosition) {
        return await this.get(`${this.address}/blocks/${blockPosition}`);
    }
    async blockByPosition(blockPosition) {
        return this.parseResponse(await this.blockByPositionDetailed(blockPosition));
    }
    async blockTransactionsDetailed(blockPosition, paginationQuery) {
        return await this.get(`${this.address}/blocks/${blockPosition}/transactions?from=${paginationQuery.from}` +
            `&limit=${paginationQuery.limit}&direction=${paginationQuery.direction}`);
    }
    async blockTransactions(blockPosition, paginationQuery) {
        return this.parseResponse(await this.blockTransactionsDetailed(blockPosition, paginationQuery));
    }
    async configDetailed() {
        return await this.get(`${this.address}/config`);
    }
    async config() {
        return this.parseResponse(await this.configDetailed());
    }
    async getTransactionFeeDetailed(txType, address, tokenLike) {
        throw new Error('Method not implemented.');
    }
    async getTransactionFee(txType, address, tokenLike) {
        return this.parseResponse(await this.getTransactionFeeDetailed(txType, address, tokenLike));
    }
    async getBatchFullFeeDetailed(transactions, tokenLike) {
        throw new Error('Method not implemented.');
    }
    async getBatchFullFee(transactions, tokenLike) {
        return this.parseResponse(await this.getBatchFullFeeDetailed(transactions, tokenLike));
    }
    async networkStatusDetailed() {
        return await this.get(`${this.address}/networkStatus`);
    }
    async networkStatus() {
        return this.parseResponse(await this.networkStatusDetailed());
    }
    async tokenPaginationDetailed(paginationQuery) {
        return await this.get(`${this.address}/tokens?from=${paginationQuery.from}&limit=${paginationQuery.limit}` +
            `&direction=${paginationQuery.direction}`);
    }
    async tokenPagination(paginationQuery) {
        return this.parseResponse(await this.tokenPaginationDetailed(paginationQuery));
    }
    async tokenInfoDetailed(tokenLike) {
        return await this.get(`${this.address}/tokens/${tokenLike}`);
    }
    async tokenInfo(tokenLike) {
        return this.parseResponse(await this.tokenInfoDetailed(tokenLike));
    }
    async tokenPriceInfoDetailed(tokenLike, tokenIdOrUsd) {
        return await this.get(`${this.address}/tokens/${tokenLike}/priceIn/${tokenIdOrUsd}`);
    }
    async tokenPriceInfo(tokenLike, tokenIdOrUsd) {
        return this.parseResponse(await this.tokenPriceInfoDetailed(tokenLike, tokenIdOrUsd));
    }
    async submitTxNewDetailed(tx, signature) {
        return await this.post(`${this.address}/transactions`, { tx, signature });
    }
    async submitTxNew(tx, signature) {
        return this.parseResponse(await this.submitTxNewDetailed(tx, signature));
    }
    /**
     * @deprecated Use submitTxNew method instead
     */
    async submitTx(tx, signature, fastProcessing) {
        if (fastProcessing) {
            tx.fastProcessing = fastProcessing;
        }
        const txHash = await this.submitTxNew(tx, signature);
        txHash.replace('0x', 'sync-tx:');
        return txHash;
    }
    async txStatusDetailed(txHash) {
        return await this.get(`${this.address}/transactions/${txHash}`);
    }
    async txStatus(txHash) {
        return this.parseResponse(await this.txStatusDetailed(txHash));
    }
    async txDataDetailed(txHash) {
        return await this.get(`${this.address}/transactions/${txHash}/data`);
    }
    async txData(txHash) {
        return this.parseResponse(await this.txDataDetailed(txHash));
    }
    async submitTxsBatchNewDetailed(txs, signature) {
        return await this.post(`${this.address}/transactions/batches`, { txs, signature });
    }
    async submitTxsBatchNew(txs, signature) {
        return this.parseResponse(await this.submitTxsBatchNewDetailed(txs, signature));
    }
    /**
     * @deprecated Use submitTxsBatchNew method instead.
     */
    async submitTxsBatch(transactions, ethSignatures) {
        return (await this.submitTxsBatchNew(transactions, ethSignatures)).transactionHashes;
    }
    async getBatchDetailed(batchHash) {
        return await this.get(`${this.address}/transactions/batches/${batchHash}`);
    }
    async getBatch(batchHash) {
        return this.parseResponse(await this.getBatchDetailed(batchHash));
    }
    async getNFTDetailed(id) {
        return await this.get(`${this.address}/tokens/nft/${id}`);
    }
    async getNFT(id) {
        const nft = this.parseResponse(await this.getNFTDetailed(id));
        // If the NFT does not exist, throw an exception
        if (nft == null) {
            throw new Error(`Requested NFT doesn't exist or the corresponding mintNFT operation is not verified yet`);
        }
        return nft;
    }
    async getNFTOwnerDetailed(id) {
        return await this.get(`${this.address}/tokens/nft/${id}/owner`);
    }
    async getNFTOwner(id) {
        return this.parseResponse(await this.getNFTOwnerDetailed(id));
    }
    async getNFTIdByTxHashDetailed(txHash) {
        return await this.get(`${this.address}/tokens/nft_id_by_tx_hash/${txHash}`);
    }
    async getNFTIdByTxHash(txHash) {
        return this.parseResponse(await this.getNFTIdByTxHashDetailed(txHash));
    }
    async addLiquidityView(addLiquidity) {
        const response = await this.post(`${this.curveBaseUrl}/curveView/addliquidity`, {
            "amounts": addLiquidity.amounts,
            "lpAmountMin": null,
            "tokenIds": addLiquidity.tokenIds,
            "lpTokenId": addLiquidity.lpTokenId,
            "poolAccountId": addLiquidity.poolAccountId,
            "accountAddress": addLiquidity.accountAddress,
            "accountId": addLiquidity.accountId,
            "nonce": 0,
            "signature": null,
            "cachedSigner": null
        });
        return this.parseResponse(response, false);
    }
    async addLiquidity(addLiquidity) {
        const response = await this.post(`${this.curveBaseUrl}/curve/addliquidity`, {
            "amounts": addLiquidity.amounts,
            "lpAmountMin": addLiquidity.lpAmountMin,
            "tokenIds": addLiquidity.tokenIds,
            "lpTokenId": addLiquidity.lpTokenId,
            "poolAccountId": addLiquidity.poolAccountId,
            "accountAddress": addLiquidity.accountAddress,
            "accountId": addLiquidity.accountId,
            "nonce": addLiquidity.nonce,
            "signature": addLiquidity.signature,
            "cachedSigner": null
        });
        const transactionHash = this.parseResponse(response, false);
        return new operations_1.Transaction(undefined, transactionHash, this);
    }
    async removeLiquidity(removeLiquidity) {
        const response = await this.post(`${this.curveBaseUrl}/curve/removeliquidity`, {
            "amounts": removeLiquidity.amounts,
            "lpAmount": removeLiquidity.lpAmount,
            "tokenIds": removeLiquidity.tokenIds,
            "lpTokenId": removeLiquidity.lpTokenId,
            "poolAccountId": removeLiquidity.poolAccountId,
            "accountAddress": removeLiquidity.accountAddress,
            "accountId": removeLiquidity.accountId,
            "nonce": removeLiquidity.nonce,
            "signature": removeLiquidity.signature
        });
        const transactionHash = this.parseResponse(response, false);
        return new operations_1.Transaction(undefined, transactionHash, this);
    }
    async swapView(requestBody) {
        const response = await this.post(`${this.curveBaseUrl}/curveView/exchange`, {
            "tokenIn": requestBody.tokenIn,
            "tokenOut": requestBody.tokenOut,
            "poolAccountId": requestBody.poolAccountId,
            "accountAddress": requestBody.accountAddress,
            "accountId": requestBody.accountId,
            "vin": requestBody.vin,
            "vout": "0",
            "voutMin": "0",
            "nonce": 0,
            "signature": null,
            "cachedSigner": null,
            "model0": null,
            "model1": null,
            "model2": null
        });
        return this.parseResponse(response, false);
    }
    async curveSwap(requestBody) {
        // const response = await this.post<string>(
        //   `${this.curveBaseUrl}/curve/exchange`,
        //   {
        //     "tokenIn": requestBody.tokenIn,
        //     "tokenOut": requestBody.tokenOut,
        //     "poolAccountId": requestBody.poolAccountId,
        //     "accountAddress": requestBody.accountAddress,
        //     "accountId": requestBody.accountId,
        //     "vin": requestBody.vin,
        //     "vout": requestBody.vout,
        //     "voutMin": requestBody.voutMin,
        //     "nonce": requestBody.nonce,
        //     "signature": requestBody.signature,
        //     "cachedSigner": null,
        //     "model0": null,
        //     "model1": null,
        //     "model2": null
        //   }
        // );
        // const transactionHash = this.parseResponse(response,false);
        // return new Transaction(undefined, transactionHash, this);
        console.log(JSON.stringify({
            "tokenIn": requestBody.tokenIn,
            "tokenOut": requestBody.tokenOut,
            "poolAccountId": requestBody.poolAccountId,
            "accountAddress": requestBody.accountAddress,
            "accountId": requestBody.accountId,
            "vin": requestBody.vin,
            "vout": requestBody.vout,
            "voutMin": requestBody.voutMin,
            "nonce": requestBody.nonce,
            "signature": requestBody.signature,
            "cachedSigner": null,
            "model0": null,
            "model1": null,
            "model2": null
        }));
        throw new Error('Method not implemented.');
    }
    async curveChangePubKey(requestBody) {
        const response = await this.post(`${this.curveBaseUrl}/curve/changepubKey`, {
            ...requestBody
        });
        const transactionHash = this.parseResponse(response, false);
        return new operations_1.Transaction(undefined, transactionHash, this);
    }
    async notifyAnyTransaction(hash, action) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const transactionStatus = await this.txStatus(hash);
            let notifyDone;
            if (action === 'COMMIT') {
                notifyDone = transactionStatus && transactionStatus.rollupBlock;
            }
            else {
                if (transactionStatus && transactionStatus.rollupBlock) {
                    if (transactionStatus.status === 'rejected') {
                        // If the transaction status is rejected
                        // it cannot be known if transaction is queued, committed or finalized.
                        // That is why there is separate `blockByPosition` query.
                        // const blockStatus = await this.blockByPosition(transactionStatus.rollupBlock);
                        notifyDone = true;
                    }
                    else {
                        notifyDone = transactionStatus.status === 'finalized';
                    }
                }
            }
            if (notifyDone) {
                // Transaction status needs to be recalculated because it can
                // be updated between `txStatus` and `blockByPosition` calls.
                return await this.txStatus(hash);
            }
            else {
                await (0, utils_1.sleep)(this.pollIntervalMilliSecs);
            }
        }
    }
    async notifyTransaction(hash, action) {
        await this.notifyAnyTransaction(hash, action);
        return await this.getTxReceipt(hash);
    }
    async notifyPriorityOp(hash, action) {
        await this.notifyAnyTransaction(hash, action);
        return await this.getPriorityOpStatus(hash);
    }
    async getContractAddress() {
        const config = await this.config();
        return {
            mainContract: config.contract[this.chainId],
            govContract: config.govContract[this.chainId]
        };
    }
    async getTokens(limit) {
        const tokens = {};
        let tmpId = 0;
        limit = limit ? limit : RestProvider.MAX_LIMIT;
        let tokenPage;
        do {
            tokenPage = await this.tokenPagination({
                from: tmpId,
                limit,
                direction: 'newer'
            });
            for (const token of tokenPage.list) {
                tokens[token.symbol] = {
                    address: token.address,
                    id: token.id,
                    symbol: token.symbol,
                    decimals: token.decimals,
                    enabledForFees: token.enabledForFees
                };
            }
            tmpId += limit;
        } while (tokenPage.list.length == limit);
        return tokens;
    }
    async getState(address) {
        const fullInfo = await this.accountFullInfo(address);
        const defaultInfo = {
            balances: {},
            nonce: 0,
            pubKeyHash: 'sync:0000000000000000000000000000000000000000',
            nfts: {},
            mintedNfts: {}
        };
        if (fullInfo.finalized) {
            return {
                address,
                accountId: fullInfo.committed.accountId,
                accountType: fullInfo.committed.accountType,
                depositing: fullInfo.depositing,
                committed: {
                    balances: fullInfo.committed.balances,
                    nonce: fullInfo.committed.nonce,
                    pubKeyHash: fullInfo.committed.pubKeyHash,
                    nfts: fullInfo.committed.nfts,
                    mintedNfts: fullInfo.committed.mintedNfts
                },
                verified: {
                    balances: fullInfo.finalized.balances,
                    nonce: fullInfo.finalized.nonce,
                    pubKeyHash: fullInfo.finalized.pubKeyHash,
                    nfts: fullInfo.finalized.nfts,
                    mintedNfts: fullInfo.finalized.mintedNfts
                }
            };
        }
        else if (fullInfo.committed) {
            return {
                address,
                accountId: fullInfo.committed.accountId,
                accountType: fullInfo.committed.accountType,
                depositing: fullInfo.depositing,
                committed: {
                    balances: fullInfo.committed.balances,
                    nonce: fullInfo.committed.nonce,
                    pubKeyHash: fullInfo.committed.pubKeyHash,
                    nfts: fullInfo.committed.nfts,
                    mintedNfts: fullInfo.committed.mintedNfts
                },
                verified: defaultInfo
            };
        }
        else {
            return {
                address,
                depositing: fullInfo.depositing,
                committed: defaultInfo,
                verified: defaultInfo
            };
        }
    }
    async getConfirmationsForEthOpAmount() {
        const config = await this.config();
        return config.depositConfirmations;
    }
    async getTransactionsBatchFee(txTypes, addresses, tokenLike) {
        const transactions = [];
        for (let i = 0; i < txTypes.length; ++i) {
            transactions.push({ txType: txTypes[i], address: addresses[i] });
        }
        const fee = await this.getBatchFullFee(transactions, tokenLike);
        return fee.totalFee;
    }
    async getTokenPrice(tokenLike) {
        const price = await this.tokenPriceInfo(tokenLike, 'usd');
        return parseFloat(price.price);
    }
    async getTxReceipt(txHash) {
        const receipt = await this.txStatus(txHash);
        if (!receipt || !receipt.rollupBlock) {
            return {
                executed: false
            };
        }
        else {
            if (receipt.status === 'rejected') {
                // const blockFullInfo = await this.blockByPosition(receipt.rollupBlock);
                return {
                    executed: true,
                    success: false,
                    failReason: receipt.failReason,
                    block: {
                        blockNumber: receipt.rollupBlock,
                        committed: true,
                        verified: false
                    }
                };
            }
            else {
                return {
                    executed: true,
                    success: true,
                    block: {
                        blockNumber: receipt.rollupBlock,
                        committed: true,
                        verified: receipt.status === 'finalized'
                    }
                };
            }
        }
    }
    async getPriorityOpStatus(hash) {
        const receipt = await this.txStatus(hash);
        if (!receipt || !receipt.rollupBlock) {
            return {
                executed: false
            };
        }
        else {
            return {
                executed: true,
                block: {
                    blockNumber: receipt.rollupBlock,
                    committed: true,
                    verified: receipt.status === 'finalized'
                }
            };
        }
    }
    async getEthTxForWithdrawal(withdrawalHash) {
        const txData = await this.txData(withdrawalHash);
        if (txData.tx.op.type === 'Withdraw' ||
            txData.tx.op.type === 'ForcedExit' ||
            txData.tx.op.type === 'WithdrawNFT') {
            return txData.tx.op.ethTxHash;
        }
        else {
            return null;
        }
    }
}
exports.RestProvider = RestProvider;
RestProvider.MAX_LIMIT = 100;
