"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETHProxy = exports.Provider = void 0;
const transport_1 = require("./transport");
const ethers_1 = require("ethers");
const utils_1 = require("./utils");
const typechain_1 = require("./typechain");
const provider_interface_1 = require("./provider-interface");
class Provider extends provider_interface_1.SyncProvider {
    constructor(transport) {
        super();
        this.transport = transport;
        this.providerType = 'RPC';
    }
    static async newHttpProvider(address = 'http://127.0.0.1:3030', pollIntervalMilliSecs, network) {
        const transport = new transport_1.HTTPTransport(address);
        const provider = new Provider(transport);
        if (pollIntervalMilliSecs) {
            provider.pollIntervalMilliSecs = pollIntervalMilliSecs;
        }
        const contractsAndTokens = await Promise.all([provider.getContractAddress(), provider.getTokens()]);
        provider.contractAddress = contractsAndTokens[0];
        provider.tokenSet = new utils_1.TokenSet(contractsAndTokens[1]);
        provider.network = network;
        return provider;
    }
    // return transaction hash (e.g. sync-tx:dead..beef)
    async submitTx(tx, signature, fastProcessing) {
        return await this.transport.request('tx_submit', [tx, signature, fastProcessing]);
    }
    // Requests `zkSync` server to execute several transactions together.
    // return transaction hash (e.g. sync-tx:dead..beef)
    async submitTxsBatch(transactions, ethSignatures) {
        let signatures = [];
        // For backwards compatibility we allow sending single signature as well
        // as no signatures at all.
        if (ethSignatures == undefined) {
            signatures = [];
        }
        else if (ethSignatures instanceof Array) {
            signatures = ethSignatures;
        }
        else {
            signatures.push(ethSignatures);
        }
        return await this.transport.request('submit_txs_batch', [transactions, signatures]);
    }
    async getContractAddress() {
        return await this.transport.request('contract_address', null);
    }
    async getTokens() {
        return await this.transport.request('tokens', null);
    }
    async getState(address) {
        return await this.transport.request('account_info', [address]);
    }
    // get transaction status by its hash (e.g. 0xdead..beef)
    async getTxReceipt(txHash) {
        return await this.transport.request('tx_info', [txHash]);
    }
    async getPriorityOpStatus(serialId) {
        return await this.transport.request('ethop_info', [serialId]);
    }
    async getConfirmationsForEthOpAmount() {
        return await this.transport.request('get_confirmations_for_eth_op_amount', []);
    }
    async getEthTxForWithdrawal(withdrawal_hash) {
        return await this.transport.request('get_eth_tx_for_withdrawal', [withdrawal_hash]);
    }
    async getNFT(id) {
        const nft = await this.transport.request('get_nft', [id]);
        // If the NFT does not exist, throw an exception
        if (nft == null) {
            throw new Error(`Requested NFT doesn't exist or the corresponding mintNFT operation is not verified yet`);
        }
        return nft;
    }
    async getNFTOwner(id) {
        return await this.transport.request('get_nft_owner', [id]);
    }
    async notifyPriorityOp(serialId, action) {
        if (this.transport.subscriptionsSupported()) {
            return await new Promise((resolve) => {
                const subscribe = this.transport.subscribe('ethop_subscribe', [serialId, action], 'ethop_unsubscribe', (resp) => {
                    subscribe
                        .then((sub) => sub.unsubscribe())
                        .catch((err) => console.log(`WebSocket connection closed with reason: ${err}`));
                    resolve(resp);
                });
            });
        }
        else {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const priorOpStatus = await this.getPriorityOpStatus(serialId);
                const notifyDone = action === 'COMMIT'
                    ? priorOpStatus.block && priorOpStatus.block.committed
                    : priorOpStatus.block && priorOpStatus.block.verified;
                if (notifyDone) {
                    return priorOpStatus;
                }
                else {
                    await (0, utils_1.sleep)(this.pollIntervalMilliSecs);
                }
            }
        }
    }
    async notifyTransaction(hash, action) {
        if (this.transport.subscriptionsSupported()) {
            return await new Promise((resolve) => {
                const subscribe = this.transport.subscribe('tx_subscribe', [hash, action], 'tx_unsubscribe', (resp) => {
                    subscribe
                        .then((sub) => sub.unsubscribe())
                        .catch((err) => console.log(`WebSocket connection closed with reason: ${err}`));
                    resolve(resp);
                });
            });
        }
        else {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const transactionStatus = await this.getTxReceipt(hash);
                const notifyDone = action == 'COMMIT'
                    ? transactionStatus.block && transactionStatus.block.committed
                    : transactionStatus.block && transactionStatus.block.verified;
                if (notifyDone) {
                    return transactionStatus;
                }
                else {
                    await (0, utils_1.sleep)(this.pollIntervalMilliSecs);
                }
            }
        }
    }
    async getTransactionFee(txType, address, tokenLike) {
        const transactionFee = await this.transport.request('get_tx_fee', [txType, address.toString(), tokenLike]);
        return {
            feeType: transactionFee.feeType,
            gasTxAmount: ethers_1.BigNumber.from(transactionFee.gasTxAmount),
            gasPriceWei: ethers_1.BigNumber.from(transactionFee.gasPriceWei),
            gasFee: ethers_1.BigNumber.from(transactionFee.gasFee),
            zkpFee: ethers_1.BigNumber.from(transactionFee.zkpFee),
            totalFee: ethers_1.BigNumber.from(transactionFee.totalFee)
        };
    }
    async getTransactionsBatchFee(txTypes, addresses, tokenLike) {
        const batchFee = await this.transport.request('get_txs_batch_fee_in_wei', [txTypes, addresses, tokenLike]);
        return ethers_1.BigNumber.from(batchFee.totalFee);
    }
    async getTokenPrice(tokenLike) {
        const tokenPrice = await this.transport.request('get_token_price', [tokenLike]);
        return parseFloat(tokenPrice);
    }
    async toggle2FA(toggle2FA) {
        const result = await this.transport.request('toggle_2fa', [toggle2FA]);
        return result.success;
    }
    async getNFTIdByTxHash(txHash) {
        return await this.transport.request('get_nft_id_by_tx_hash', [txHash]);
    }
    async disconnect() {
        return await this.transport.disconnect();
    }
}
exports.Provider = Provider;
class ETHProxy {
    constructor(ethersProvider, contractAddress) {
        this.ethersProvider = ethersProvider;
        this.contractAddress = contractAddress;
        this.dummySigner = new ethers_1.ethers.VoidSigner(ethers_1.ethers.constants.AddressZero, this.ethersProvider);
        const governanceFactory = new typechain_1.GovernanceFactory(this.dummySigner);
        this.governanceContract = governanceFactory.attach(contractAddress.govContract);
        const zkSyncFactory = new typechain_1.ZkSyncFactory(this.dummySigner);
        this.zkSyncContract = zkSyncFactory.attach(contractAddress.mainContract);
    }
    getGovernanceContract() {
        return this.governanceContract;
    }
    getZkSyncContract() {
        return this.zkSyncContract;
    }
    // This method is very helpful for those who have already fetched the
    // default factory and want to avoid asynchorouns execution from now on
    getCachedNFTDefaultFactory() {
        return this.zksyncNFTFactory;
    }
    async getDefaultNFTFactory() {
        if (this.zksyncNFTFactory) {
            return this.zksyncNFTFactory;
        }
        const nftFactoryAddress = await this.governanceContract.defaultFactory();
        const nftFactory = new typechain_1.ZkSyncNFTFactoryFactory(this.dummySigner);
        this.zksyncNFTFactory = nftFactory.attach(nftFactoryAddress);
        return this.zksyncNFTFactory;
    }
    async resolveTokenId(token) {
        if ((0, utils_1.isTokenETH)(token)) {
            return 0;
        }
        else {
            const tokenId = await this.governanceContract.tokenIds(token);
            if (tokenId == 0) {
                throw new Error(`ERC20 token ${token} is not supported`);
            }
            return tokenId;
        }
    }
}
exports.ETHProxy = ETHProxy;
