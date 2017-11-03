import {MatchDto} from "../data/match.dto"
import {EventEmitter} from "@angular/core";

export interface ISelectMatchHandler {
    handleSelection(matches: MatchDto[])
    handleAll(matches: MatchDto[])
    onRefresh: EventEmitter<string>
}