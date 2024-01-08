"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractWallet = void 0;
const ethers_1 = require("ethers");
const logger_1 = require("@ethersproject/logger");
const batch_builder_1 = require("./batch-builder");
const types_1 = require("./types");
const utils_1 = require("./utils");
const operations_1 = require("./operations");
class AbstractWallet {
    constructor(cachedAddress, accountId) {
        this.cachedAddress = cachedAddress;
        this.accountId = accountId;
    }
    connect(provider) {
        this.provider = provider;
        return this;
    }
    // *************
    // Basic getters
    //
    address() {
        return this.cachedAddress;
    }
    async getCurrentPubKeyHash() {
        return (await this.provider.getState(this.address())).committed.pubKeyHash;
    }
    async getNonce(nonce = 'committed') {
        if (nonce === 'committed') {
            return (await this.provider.getState(this.address())).committed.nonce;
        }
        else if (typeof nonce === 'number') {
            return nonce;
        }
    }
    async getAccountId() {
        return (await this.getAccountState()).accountId;
    }
    async getAccountState() {
        return await this.provider.getState(this.address());
    }
    async resolveAccountId() {
        if (this.accountId !== undefined) {
            return this.accountId;
        }
        else {
            const accountState = await this.getAccountState();
            if (!accountState.accountId) {
                throw new Error("Can't resolve account id from the zkSync node");
            }
            return accountState.accountId;
        }
    }
    async isCorrespondingSigningKeySet() {
        if (!this.syncSignerConnected()) {
            throw new Error('ZKSync signer is required for current pubkey calculation.');
        }
        const currentPubKeyHash = await this.getCurrentPubKeyHash();
        const signerPubKeyHash = await this.syncSignerPubKeyHash();
        return currentPubKeyHash === signerPubKeyHash;
    }
    async isSigningKeySet() {
        if (!this.syncSignerConnected()) {
            throw new Error('ZKSync signer is required for current pubkey calculation.');
        }
        const currentPubKeyHash = await this.getCurrentPubKeyHash();
        const zeroPubKeyHash = 'sync:0000000000000000000000000000000000000000';
        return zeroPubKeyHash !== currentPubKeyHash;
    }
    async getNFT(tokenId, type = 'committed') {
        const accountState = await this.getAccountState();
        let token;
        if (type === 'committed') {
            token = accountState.committed.nfts[tokenId];
        }
        else {
            token = accountState.verified.nfts[tokenId];
        }
        return token;
    }
    async getBalance(token, type = 'committed') {
        const accountState = await this.getAccountState();
        const tokenSymbol = this.provider.tokenSet.resolveTokenSymbol(token);
        let balance;
        if (type === 'committed') {
            balance = accountState.committed.balances[tokenSymbol] || '0';
        }
        else {
            balance = accountState.verified.balances[tokenSymbol] || '0';
        }
        return ethers_1.BigNumber.from(balance);
    }
    async getEthereumBalance(token) {
        try {
            return await (0, utils_1.getEthereumBalance)(this.ethSigner().provider, this.provider, this.cachedAddress, token);
        }
        catch (e) {
            this.modifyEthersError(e);
        }
    }
    // *********************
    // Batch builder methods
    //
    /**
     * Creates a batch builder instance.
     *
     * @param nonce Nonce that should be used as the nonce of the first transaction in the batch.
     * @returns Batch builder object
     */
    batchBuilder(nonce) {
        return batch_builder_1.BatchBuilder.fromWallet(this, nonce);
    }
    // Swap part
    async signLimitOrder(order) {
        return await this.signOrder({
            ...order,
            amount: 0
        });
    }
    // Toggle 2FA part
    async getToggle2FA(enable, pubKeyHash) {
        const accountId = await this.getAccountId();
        const timestamp = new Date().getTime();
        const signature = await this.ethMessageSigner().getEthMessageSignature((0, utils_1.getToggle2FAMessage)(enable, timestamp, pubKeyHash));
        return {
            accountId,
            signature,
            timestamp,
            enable,
            pubKeyHash
        };
    }
    async toggle2FA(enable, pubKeyHash) {
        await this.setRequiredAccountIdFromServer('Toggle 2FA');
        return await this.provider.toggle2FA(await this.getToggle2FA(enable, pubKeyHash));
    }
    // *************
    // L1 operations
    //
    // Priority operations, ones that sent through Ethereum.
    //
    async approveERC20TokenDeposits(token, max_erc20_approve_amount = utils_1.MAX_ERC20_APPROVE_AMOUNT) {
        if ((0, utils_1.isTokenETH)(token)) {
            throw Error('ETH token does not need approval.');
        }
        const tokenAddress = this.provider.tokenSet.resolveTokenAddress(token);
        const erc20contract = new ethers_1.Contract(tokenAddress, utils_1.IERC20_INTERFACE, this.ethSigner());
        try {
            return erc20contract.approve(this.provider.contractAddress.mainContract, max_erc20_approve_amount);
        }
        catch (e) {
            this.modifyEthersError(e);
        }
    }
    async depositToSyncFromEthereum(deposit) {
        const gasPrice = await this.ethSigner().provider.getGasPrice();
        const mainZkSyncContract = this.getZkSyncMainContract();
        let ethTransaction;
        if ((0, utils_1.isTokenETH)(deposit.token)) {
            try {
                ethTransaction = await mainZkSyncContract.depositETH(deposit.depositTo, {
                    value: ethers_1.BigNumber.from(deposit.amount),
                    gasLimit: ethers_1.BigNumber.from(utils_1.ETH_RECOMMENDED_DEPOSIT_GAS_LIMIT),
                    gasPrice,
                    ...deposit.ethTxOptions
                });
            }
            catch (e) {
                this.modifyEthersError(e);
            }
        }
        else {
            const tokenAddress = this.provider.tokenSet.resolveTokenAddress(deposit.token);
            // ERC20 token deposit
            const erc20contract = new ethers_1.Contract(tokenAddress, utils_1.IERC20_INTERFACE, this.ethSigner());
            let nonce;
            if (deposit.approveDepositAmountForERC20) {
                try {
                    const approveTx = await erc20contract.approve(this.provider.contractAddress.mainContract, deposit.amount);
                    nonce = approveTx.nonce + 1;
                }
                catch (e) {
                    this.modifyEthersError(e);
                }
            }
            const args = [
                tokenAddress,
                deposit.amount,
                deposit.depositTo,
                {
                    nonce,
                    gasPrice,
                    ...deposit.ethTxOptions
                }
            ];
            // We set gas limit only if user does not set it using ethTxOptions.
            const txRequest = args[args.length - 1];
            if (txRequest.gasLimit == null) {
                try {
                    const gasEstimate = await mainZkSyncContract.estimateGas.depositERC20(...args).then((estimate) => estimate, () => ethers_1.BigNumber.from('0'));
                    const isMainnet = (await this.ethSigner().getChainId()) == 1;
                    const recommendedGasLimit = isMainnet && utils_1.ERC20_DEPOSIT_GAS_LIMIT[tokenAddress]
                        ? ethers_1.BigNumber.from(utils_1.ERC20_DEPOSIT_GAS_LIMIT[tokenAddress])
                        : utils_1.ERC20_RECOMMENDED_DEPOSIT_GAS_LIMIT;
                    txRequest.gasLimit = gasEstimate.gte(recommendedGasLimit) ? gasEstimate : recommendedGasLimit;
                    args[args.length - 1] = txRequest;
                }
                catch (e) {
                    this.modifyEthersError(e);
                }
            }
            try {
                ethTransaction = await mainZkSyncContract.depositERC20(...args);
            }
            catch (e) {
                this.modifyEthersError(e);
            }
        }
        return new operations_1.ETHOperation(ethTransaction, this.provider);
    }
    async onchainAuthSigningKey(nonce = 'committed', ethTxOptions) {
        if (!this.syncSignerConnected()) {
            throw new Error('ZKSync signer is required for current pubkey calculation.');
        }
        const currentPubKeyHash = await this.getCurrentPubKeyHash();
        const newPubKeyHash = await this.syncSignerPubKeyHash();
        if (currentPubKeyHash === newPubKeyHash) {
            throw new Error('Current PubKeyHash is the same as new');
        }
        const numNonce = await this.getNonce(nonce);
        const mainZkSyncContract = this.getZkSyncMainContract();
        try {
            return mainZkSyncContract.setAuthPubkeyHash(newPubKeyHash.replace('sync:', '0x'), numNonce, {
                gasLimit: ethers_1.BigNumber.from('200000'),
                ...ethTxOptions
            });
        }
        catch (e) {
            this.modifyEthersError(e);
        }
    }
    async emergencyWithdraw(withdraw) {
        const gasPrice = await this.ethSigner().provider.getGasPrice();
        let accountId = withdraw.accountId != null ? withdraw.accountId : await this.resolveAccountId();
        const mainZkSyncContract = this.getZkSyncMainContract();
        const tokenAddress = this.provider.tokenSet.resolveTokenAddress(withdraw.token);
        try {
            const ethTransaction = await mainZkSyncContract.requestFullExit(accountId, tokenAddress, {
                gasLimit: ethers_1.BigNumber.from('500000'),
                gasPrice,
                ...withdraw.ethTxOptions
            });
            return new operations_1.ETHOperation(ethTransaction, this.provider);
        }
        catch (e) {
            this.modifyEthersError(e);
        }
    }
    async emergencyWithdrawNFT(withdrawNFT) {
        const gasPrice = await this.ethSigner().provider.getGasPrice();
        let accountId = withdrawNFT.accountId != null ? withdrawNFT.accountId : await this.resolveAccountId();
        const mainZkSyncContract = this.getZkSyncMainContract();
        try {
            const ethTransaction = await mainZkSyncContract.requestFullExitNFT(accountId, withdrawNFT.tokenId, {
                gasLimit: ethers_1.BigNumber.from('500000'),
                gasPrice,
                ...withdrawNFT.ethTxOptions
            });
            return new operations_1.ETHOperation(ethTransaction, this.provider);
        }
        catch (e) {
            this.modifyEthersError(e);
        }
    }
    async signRegisterFactory(factoryAddress) {
        await this.setRequiredAccountIdFromServer('Sign register factory');
        const signature = await this.ethMessageSigner().ethSignRegisterFactoryMessage(factoryAddress, this.accountId, this.address());
        return {
            signature,
            accountId: this.accountId,
            accountAddress: this.address()
        };
    }
    // **********
    // L1 getters
    //
    // Getter methods that query information from Web3.
    //
    async isOnchainAuthSigningKeySet(nonce = 'committed') {
        const mainZkSyncContract = this.getZkSyncMainContract();
        const numNonce = await this.getNonce(nonce);
        try {
            const onchainAuthFact = await mainZkSyncContract.authFacts(this.address(), numNonce);
            return onchainAuthFact !== '0x0000000000000000000000000000000000000000000000000000000000000000';
        }
        catch (e) {
            this.modifyEthersError(e);
        }
    }
    async isERC20DepositsApproved(token, erc20ApproveThreshold = utils_1.ERC20_APPROVE_TRESHOLD) {
        if ((0, utils_1.isTokenETH)(token)) {
            throw Error('ETH token does not need approval.');
        }
        const tokenAddress = this.provider.tokenSet.resolveTokenAddress(token);
        const erc20contract = new ethers_1.Contract(tokenAddress, utils_1.IERC20_INTERFACE, this.ethSigner());
        try {
            const currentAllowance = await erc20contract.allowance(this.address(), this.provider.contractAddress.mainContract);
            return ethers_1.BigNumber.from(currentAllowance).gte(erc20ApproveThreshold);
        }
        catch (e) {
            this.modifyEthersError(e);
        }
    }
    getZkSyncMainContract() {
        return new ethers_1.ethers.Contract(this.provider.contractAddress.mainContract, utils_1.SYNC_MAIN_CONTRACT_INTERFACE, this.ethSigner());
    }
    // ****************
    // Internal methods
    //
    async verifyNetworks() {
        if (this.provider.network != undefined && this.ethSigner().provider != undefined) {
            const ethNetwork = await this.ethSigner().provider.getNetwork();
            if ((0, types_1.l1ChainId)(this.provider.network) !== ethNetwork.chainId) {
                throw new Error(`ETH network ${ethNetwork.name} and ZkSync network ${this.provider.network} don't match`);
            }
        }
    }
    modifyEthersError(error) {
        if (this.ethSigner instanceof ethers_1.ethers.providers.JsonRpcSigner) {
            // List of errors that can be caused by user's actions, which have to be forwarded as-is.
            const correct_errors = [
                logger_1.ErrorCode.NONCE_EXPIRED,
                logger_1.ErrorCode.INSUFFICIENT_FUNDS,
                logger_1.ErrorCode.REPLACEMENT_UNDERPRICED,
                logger_1.ErrorCode.UNPREDICTABLE_GAS_LIMIT
            ];
            if (!correct_errors.includes(error.code)) {
                // This is an error which we don't expect
                error.message = `Ethereum smart wallet JSON RPC server returned the following error while executing an operation: "${error.message}". Please contact your smart wallet support for help.`;
            }
        }
        throw error;
    }
    async setRequiredAccountIdFromServer(actionName) {
        if (this.accountId === undefined) {
            const accountIdFromServer = await this.getAccountId();
            if (accountIdFromServer == null) {
                throw new Error(`Failed to ${actionName}: Account does not exist in the zkSync network`);
            }
            else {
                this.accountId = accountIdFromServer;
            }
        }
    }
}
exports.AbstractWallet = AbstractWallet;
