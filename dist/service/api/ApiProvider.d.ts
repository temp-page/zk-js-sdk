import type { BaseApi } from './BaseApi';
import { RestProvider } from "../../zksdk";
import { AccountApi } from "./AccountApi";
import { PoolApi } from "./PoolApi";
import { SwapApi } from "./SwapApi";
/**
 * 请求基类 详细信息查看
 */
declare class ApiProvider {
    baseApi: BaseApi;
    constructor();
    accountApi(): AccountApi;
    poolApi(): PoolApi;
    swapApi(): SwapApi;
    zkSyncProvider(): Promise<RestProvider>;
}
export { ApiProvider };
