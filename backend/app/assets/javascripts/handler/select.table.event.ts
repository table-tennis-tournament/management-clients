import {ISelectTableHandler} from "./select.table.handler";
import {Match} from '../data/match';

export class SelectTableEvent {
    handler: ISelectTableHandler;
    matches: Match[];
}