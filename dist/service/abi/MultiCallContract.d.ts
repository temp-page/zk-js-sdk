import { ConnectInfo } from '../../ConnectInfo';
import { ContractCall, Provider } from '../../mulcall';
import { BaseAbi } from "./BaseAbi";
export interface ShapeWithLabel {
    [item: string]: ContractCall | string;
}
export declare class MultiCallContract extends BaseAbi {
    multiCallInstance: Provider;
    constructor(connectInfo: ConnectInfo);
    singleCall<T>(shapeWithLabel: ShapeWithLabel): Promise<T>;
    call<T>(...shapeWithLabels: ShapeWithLabel[]): Promise<T>;
}
