import {EventEmitter} from "@angular/core";
import {Match} from '../data/match';

export interface ISelectTableHandler {
    handleSelection(matches: Match[], tableNumber: number)
    onRefresh: EventEmitter<string>
}