import { ConnectInfo } from "../../../ConnectInfo";
import { L2BalanceInfo } from "../account";
import { Token } from "../Types";
import { Transaction } from "../../../zksdk";
export interface PoolInfo {
    lpTokenId: number;
    poolAccountId: number;
    L2Balances: L2BalanceInfo[];
    tokens: Token[];
    add: (connectInfo: ConnectInfo, amounts: string[]) => Promise<Transaction>;
    remove: (connectInfo: ConnectInfo, amounts: string[]) => Promise<Transaction>;
}
