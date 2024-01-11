import { ConnectInfo } from '../../ConnectInfo';
import { AddressInfo } from '../vo';
import { ApiProvider } from "./ApiProvider";
export declare class BaseApi {
    request<T = any>(path: string, method: 'get' | 'post' | 'put' | 'delete', data: any, config?: any): Promise<T>;
    connectInfo(): ConnectInfo;
    address(): AddressInfo;
    api(): ApiProvider;
}
export declare const BASE_API: BaseApi;
