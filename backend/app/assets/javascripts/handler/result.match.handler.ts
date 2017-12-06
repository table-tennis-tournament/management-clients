import {MatchDto} from "../data/match.dto"
import {StatusDto} from "../data/status.dto"
import {IResultHandler} from "../handler/result.handler"
import {MatchService} from "../services/match.service"
import {EventEmitter} from "@angular/core"

export class ResultMatchHandler implements IResultHandler {
    
    
   
    public onRefresh: EventEmitter<string>;

    constructor(private matchService: MatchService){
        this.onRefresh = new EventEmitter<string>();
    }

    handleResult(resultToHandle: [number, number][], match: MatchDto) {
        this.matchService.addResult(resultToHandle, match.match.id).subscribe(this.onResultAdded.bind(this));
    }

    onResultAdded(result: StatusDto) {
        if(result.successful === true){
            this.onRefresh.emit("success");
        }
    }

}