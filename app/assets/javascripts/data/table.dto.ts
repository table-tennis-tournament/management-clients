import {Match} from './match';

export interface TableDto{
    id?: number;
    number?: number;
    isLocked?: boolean;
    matches?: Match[];
}