import {MatchDto} from "../data/match.dto"
import {EventEmitter} from "@angular/core";

export interface ISelectTableHandler {
    handleSelection(matches: MatchDto[], tableNumber: number)
    onRefresh: EventEmitter<string>
}