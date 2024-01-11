import { ConnectInfo } from "../../../ConnectInfo";
import { L2BalanceInfo } from "../account";
import { Token } from "../Types";
import { Transaction } from "../../../zksdk";
export interface PoolInfo {
    lpTokenId: number;
    poolAccountId: number;
    L2Balances: L2BalanceInfo[];
    tokens: Token[];
    preAdd: (connectInfo: ConnectInfo, amounts: string[], slippage: string | number) => Promise<{
        lpAmount: string;
        lpAmountMin: string;
    }>;
    add: (connectInfo: ConnectInfo, amounts: string[], slippage: string | number) => Promise<Transaction>;
    remove: (connectInfo: ConnectInfo, amounts: string[], slippage: string | number) => Promise<Transaction>;
}
