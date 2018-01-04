import {MatchDto} from "../data/match.dto"
import {EventEmitter} from "@angular/core"

export class ShowMatchEvent {
    public onRefresh: EventEmitter<string>;
    public tableId: any;

    constructor(){
        this.onRefresh = new EventEmitter<string>();
    }
}