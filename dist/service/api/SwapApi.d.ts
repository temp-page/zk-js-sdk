import { BaseApi } from "./BaseApi";
import { SwapInfo, Token } from "../vo";
export declare class SwapApi {
    baseApi: BaseApi;
    swapInfo(tokenA: Token, tokenB: Token): Promise<SwapInfo>;
}
