import { BaseApi } from "./BaseApi";
import { AccountDto, L2BalanceInfo } from "../vo/account";
import { ConnectInfo } from "../../ConnectInfo";
import { Token } from "../vo";
export declare class AccountApi {
    baseApi: BaseApi;
    getTokenId(token: Token): number;
    getBalance(connectInfo: ConnectInfo | undefined): Promise<L2BalanceInfo[]>;
    getAccountInfo(connectInfo: ConnectInfo | undefined): Promise<AccountDto>;
}
