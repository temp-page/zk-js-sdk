import { BalanceAndAllowance, Token } from "../Types";
import { ConnectInfo } from "../../../ConnectInfo";
import { TransactionEvent } from "../TransactionEvent";
import { Transaction } from "../../../zksdk";
export interface L2BalanceInfo {
    token: Token;
    l2FinalizedBalance: string;
    l2CommittedBalance: string;
}
export interface BalanceInfo extends L2BalanceInfo {
    token: Token;
    l1Balances: BalanceAndAllowance;
    l2FinalizedBalance: string;
    l2CommittedBalance: string;
    l1PendingWithdraw: string;
}
export interface AccountDto {
    balances: BalanceInfo[];
    tokens: Token[];
    address: string;
    deposit: (connectInfo: ConnectInfo, token: Token, amount: string) => Promise<TransactionEvent>;
    withdraw: (connectInfo: ConnectInfo, token: Token, amount: string) => Promise<Transaction>;
    withdrawPending: (connectInfo: ConnectInfo, token: Token, amount: string) => Promise<TransactionEvent>;
    showToggle2fa: boolean;
    showChangePublicKey: boolean;
    toggle2faSubmit: (connectInfo: ConnectInfo) => Promise<void>;
    changePublicSubmit: (connectInfo: ConnectInfo) => Promise<void>;
}
