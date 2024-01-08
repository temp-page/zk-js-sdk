import { BaseAbi } from "./BaseAbi";
import { ConnectInfo } from "../../ConnectInfo";
import { TransactionEvent } from "../vo";
export declare class SyncMainContract extends BaseAbi {
    constructor(connectInfo: ConnectInfo);
    withdrawPendingBalance(from: string, tokenAddress: string, withdrawAmount: string): Promise<TransactionEvent>;
    depositETH(address: string, value: string): Promise<TransactionEvent>;
    depositERC20(tokenAddress: string, address: string, value: string): Promise<TransactionEvent>;
}
