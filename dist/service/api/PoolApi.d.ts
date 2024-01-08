import { BaseApi } from "./BaseApi";
import { Token } from "../vo";
import { PoolInfo } from "../vo/pool";
export declare class PoolApi {
    baseApi: BaseApi;
    poolInfo(tokens: Token[]): Promise<PoolInfo>;
}
