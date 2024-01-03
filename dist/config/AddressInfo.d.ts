import { ConnectInfo } from "../ConnectInfo";
import { ApiProvider } from "../service/api/ApiProvider";
/**
 * 地址信息
 */
export declare class AddressInfo {
    /**
     * chainID
     */
    chainId: number;
    chainName: string;
    /**
     * 链上区块浏览器地址
     */
    scan: string;
    rpc: string;
    multicall: string;
    tokens: Array<{
        name: string;
        symbol: string;
        decimal: number;
        address: string;
    }>;
    private api;
    getApi(): ApiProvider;
    private readonlyConnectInfoInstance;
    readonlyConnectInfo(): ConnectInfo;
    getEtherscanAddress(address: string): string;
    getEtherscanTx(tx: string): string;
    getEtherscanLink(data: string, type: 'transaction' | 'token' | 'address' | 'block'): string;
}
export declare function updateCurrentAddressInfo(addressInfo: AddressInfo): void;
export declare function getCurrentAddressInfo(): AddressInfo;
export declare function initAddress(ENV: 'dev_goerli' | 'dev_holesky'): void;
