"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectManager = exports.WalletConnect = exports.getCurrentConnect = exports.PrivateWallet = void 0;
const ConnectInfo_1 = require("./ConnectInfo");
const service_1 = require("./service");
const ethers_1 = require("ethers");
const BasicException_1 = require("./BasicException");
const zksdk_1 = require("./zksdk");
class PrivateWallet {
}
exports.PrivateWallet = PrivateWallet;
let currentConnect = null;
const getCurrentConnect = () => {
    return currentConnect;
};
exports.getCurrentConnect = getCurrentConnect;
class WalletConnect {
    constructor(walletName) {
        this.wallet = walletName;
        const connectInfo = new ConnectInfo_1.ConnectInfo();
        connectInfo.status = false;
        connectInfo.msg = 'Check your wallet!';
        this.connectInfo = connectInfo;
    }
    disConnect() {
        const connectInfo = this.connectInfo;
        connectInfo.status = false;
        connectInfo.msg = 'Check your wallet!';
        this.update();
    }
    update() {
        const connectInfo = this.connectInfo;
        connectInfo.walletConnect = this;
        if (typeof connectInfo.account === 'undefined' || connectInfo.account === '') {
            connectInfo.status = false;
        }
        const currentAddressInfo = (0, service_1.getCurrentAddressInfo)();
        if (connectInfo.status) {
            connectInfo.account = connectInfo.account.toLowerCase();
            connectInfo.addressInfo = currentAddressInfo;
            service_1.Trace.debug('connect success ', connectInfo.account);
        }
        if (connectInfo.status) {
            connectInfo.clear();
        }
    }
    // 测试用，直接私钥+rpc链接
    async privateWallet() {
        const connectInfo = this.connectInfo;
        const privateWallet = this.wallet;
        const provider = privateWallet.provider;
        const wallet = privateWallet.wallet;
        const currentAddressInfo = (0, service_1.getCurrentAddressInfo)();
        const restProvider = await currentAddressInfo.getApi().zkSyncProvider();
        connectInfo.syncWallet = await zksdk_1.zksync.Wallet.fromEthSigner(wallet, restProvider);
        connectInfo.chainId = (await provider.getNetwork()).chainId;
        connectInfo.msg = 'success';
        connectInfo.provider = provider;
        connectInfo.account = wallet.address;
        connectInfo.status = true;
        connectInfo.wallet = wallet;
        this.update();
    }
    async web3Provider() {
        const connectInfo = this.connectInfo;
        const web3Provider = this.wallet;
        const signer = web3Provider.getSigner();
        const currentAddressInfo = (0, service_1.getCurrentAddressInfo)();
        const restProvider = await currentAddressInfo.getApi().zkSyncProvider();
        connectInfo.syncWallet = await zksdk_1.zksync.Wallet.fromEthSigner(signer, restProvider);
        connectInfo.chainId = (await web3Provider.getNetwork()).chainId;
        connectInfo.msg = 'success';
        connectInfo.provider = web3Provider;
        connectInfo.account = await signer.getAddress();
        connectInfo.status = true;
        connectInfo.wallet = signer;
        this.update();
    }
    static async connectMetaMask() {
        const _ethereum = WalletConnect.getEthereum();
        if (!_ethereum) {
            throw new BasicException_1.BasicException("Check your wallet!");
        }
        await _ethereum.enable();
        const provider = new ethers_1.providers.Web3Provider(_ethereum, 'any');
        const walletConnect = new WalletConnect(provider);
        walletConnect.provider = _ethereum;
        return walletConnect;
    }
    static getEthereum() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return window.ethereum;
    }
    /**
     * 链接钱包
     * @returns
     */
    async connect() {
        try {
            if (this.wallet instanceof PrivateWallet) {
                await this.privateWallet();
            }
            else if (this.wallet instanceof ethers_1.providers.Web3Provider) {
                await this.web3Provider();
            }
            else if (this.wallet.provider) {
                await this.web3Provider();
            }
            else {
                throw new BasicException_1.BasicException('Wallet type error');
            }
            currentConnect = this.connectInfo;
            return this.connectInfo;
        }
        catch (e) {
            this.connectInfo.status = false;
            this.connectInfo.msg = e.message || e.toString();
            this.update();
            throw e;
        }
    }
}
exports.WalletConnect = WalletConnect;
class ConnectManager {
    /**
     * 初始化
     * @param wallet
     */
    static async connect(wallet) {
        ConnectManager.walletConnect = wallet;
        ConnectManager.connectInfo = await wallet.connect();
        return ConnectManager.connectInfo;
    }
    /**
     * 断开连接
     */
    static async disConnect() {
        if (ConnectManager.walletConnect) {
            ConnectManager.walletConnect.disConnect();
            ConnectManager.walletConnect = null;
        }
        if (ConnectManager.connectInfo) {
            ConnectManager.connectInfo = null;
        }
    }
    /**
     * 获取连接
     */
    static getConnect() {
        if (ConnectManager.connectInfo) {
            if (ConnectManager.connectInfo.status) {
                return ConnectManager.connectInfo;
            }
        }
        throw new Error("Wallet not connected");
    }
    static addMetamaskChain(chainName) {
        // @ts-ignore
        const _ethereum = WalletConnect.getEthereum();
        if (!_ethereum) {
            return;
        }
        const data = ConnectManager.chainMap[chainName];
        if (!data) {
            return;
        }
        if (typeof data === 'string') {
            _ethereum
                .request({
                method: 'wallet_switchEthereumChain',
                params: [
                    {
                        chainId: data,
                    },
                ],
            })
                .catch();
            return;
        }
        _ethereum.request({ method: 'wallet_addEthereumChain', params: data }).catch();
    }
}
exports.ConnectManager = ConnectManager;
ConnectManager.chainMap = {
    rinkeby: '0x4',
    mainnet: '0x1',
};
