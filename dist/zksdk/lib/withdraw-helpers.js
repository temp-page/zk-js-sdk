"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const wallet_1 = require("./wallet");
const utils_1 = require("./utils");
function checkEthProvider(ethersWallet) {
    if (!ethersWallet.provider) {
        throw new Error('The Ethereum Wallet must be connected to a provider');
    }
}
// The addresses are taken from here:
// https://github.com/makerdao/multicall
function getMulticallAddressByNetwork(network) {
    switch (network) {
        case 'rinkeby-beta':
            return '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821';
        case 'goerli':
        case 'goerli-beta':
            return '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e';
        case 'mainnet':
            return '0xeefba1e63905ef1d7acba5a8513c70307c1ce441';
        default:
            throw new Error('There is no default multicall contract address for this network');
    }
}
wallet_1.Wallet.prototype.withdrawPendingBalance = async function (from, token, amount) {
    checkEthProvider(this.ethSigner());
    const zksyncContract = this.getZkSyncMainContract();
    const gasPrice = await this.ethSigner().getGasPrice();
    const tokenAddress = this.provider.tokenSet.resolveTokenAddress(token);
    const withdrawAmount = amount ? amount : await zksyncContract.getPendingBalance(from, tokenAddress);
    return zksyncContract.withdrawPendingBalance(from, tokenAddress, withdrawAmount, {
        gasLimit: ethers_1.BigNumber.from('200000'),
        gasPrice
    });
};
wallet_1.Wallet.prototype.withdrawPendingBalances = async function (addresses, tokens, multicallParams, amounts) {
    checkEthProvider(this.ethSigner());
    if (tokens.length != addresses.length) {
        throw new Error('The array of addresses and the tokens should be the same length');
    }
    const multicallAddress = multicallParams.address || getMulticallAddressByNetwork(multicallParams.network);
    const zksyncContract = this.getZkSyncMainContract();
    const gasPrice = await this.ethSigner().getGasPrice();
    const tokensAddresses = tokens.map((token) => this.provider.tokenSet.resolveTokenAddress(token));
    if (!amounts) {
        const pendingWithdrawalsPromises = addresses.map((address, i) => zksyncContract.getPendingBalance(address, tokensAddresses[i]));
        amounts = await Promise.all(pendingWithdrawalsPromises);
    }
    if (amounts.length != tokens.length) {
        throw new Error('The amounts array should be the same length as tokens array');
    }
    const calls = addresses.map((address, i) => {
        const callData = zksyncContract.interface.encodeFunctionData('withdrawPendingBalance', [
            address,
            tokensAddresses[i],
            amounts[i]
        ]);
        return [zksyncContract.address, callData];
    });
    const multicallContract = new ethers_1.Contract(multicallAddress, utils_1.MULTICALL_INTERFACE, this.ethSigner());
    return multicallContract.aggregate(calls, {
        gasLimit: multicallParams.gasLimit || ethers_1.BigNumber.from('300000'),
        gasPrice
    });
};
wallet_1.Wallet.prototype.withdrawPendingNFTBalance = async function (tokenId) {
    checkEthProvider(this.ethSigner());
    const zksyncContract = this.getZkSyncMainContract();
    const gasPrice = await this.ethSigner().getGasPrice();
    return zksyncContract.withdrawPendingNFTBalance(tokenId, {
        gasLimit: ethers_1.BigNumber.from('200000'),
        gasPrice
    });
};
