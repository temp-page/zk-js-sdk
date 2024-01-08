import { ConnectInfo } from "../../../ConnectInfo";
import { L2BalanceInfo } from "../account";
import { Token } from "../Types";
import { Transaction } from "../../../zksdk";
export interface SwapInfo {
    lpTokenId: number;
    poolAccountId: number;
    tokenAL2Balance: L2BalanceInfo;
    tokenBL2Balance: L2BalanceInfo;
    tokenA: Token;
    tokenB: Token;
    type: 'base' | 'stable';
    swap: (connectInfo: ConnectInfo, vin: string, vout: string, voutMint: string) => Promise<Transaction>;
}
