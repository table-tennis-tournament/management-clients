import {EventEmitter} from "@angular/core";
import {Match} from '../data/match';

export interface ISelectMatchHandler {
    handleSelection(matches: Match[])
    handleAll(matches: Match[])
    onRefresh: EventEmitter<string>
}