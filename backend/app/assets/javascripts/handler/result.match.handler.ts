import {StatusDto} from "../data/status.dto"
import {IResultHandler} from "./result.handler"
import {MatchService} from "../services/match.service"
import {EventEmitter} from "@angular/core"
import {Match} from '../data/match';

export class ResultMatchHandler implements IResultHandler {

    public onRefresh: EventEmitter<string>;

    constructor(private matchService: MatchService){
        this.onRefresh = new EventEmitter<string>();
    }

    handleResult(resultToHandle: [number, number][], match: Match) {
        this.matchService.addResult(resultToHandle, match.id).subscribe(this.onResultAdded.bind(this));
    }

    onResultAdded(result: StatusDto) {
        if(result.successful === true){
            this.onRefresh.emit("success");
        }
    }

}