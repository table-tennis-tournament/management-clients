import {MatchDto} from "../data/match.dto"
import {ISelectTableHandler} from "./select.table.handler";

export class SelectTableEvent {
    handler: ISelectTableHandler;
    matches: MatchDto[];
}