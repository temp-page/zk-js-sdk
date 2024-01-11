import { ConnectInfo } from "../../../ConnectInfo";
import { L2BalanceInfo } from "../account";
import { Token } from "../Types";
import { Transaction } from "../../../zksdk";
export interface SwapInfo {
    poolAccountId: number;
    tokenAL2Balance: L2BalanceInfo;
    tokenBL2Balance: L2BalanceInfo;
    tokenA: Token;
    tokenB: Token;
    preSwap: (connectInfo: ConnectInfo, inputAmount: string, slippage: string) => Promise<{
        vin: string;
        vout: string;
        voutMin: string;
        outPutAmount: string;
    }>;
    swap: (connectInfo: ConnectInfo, inputAmount: string, slippage: string) => Promise<Transaction>;
}
