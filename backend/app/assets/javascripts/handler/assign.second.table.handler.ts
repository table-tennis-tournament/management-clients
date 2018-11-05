import {MatchDto} from "../data/match.dto"
import {StatusDto} from "../data/status.dto"
import {EventEmitter} from "@angular/core"
import {ISelectTableHandler} from "./select.table.handler";
import {MatchService} from "../services/match.service";

export class AssignSecondTableHandler implements ISelectTableHandler {
    
    public onRefresh: EventEmitter<string>;

    constructor(private matchService: MatchService){
        this.onRefresh = new EventEmitter<string>();
    }

    handleSelection(matches: MatchDto[], tableNumber: number) {
        if(matches!== null && matches.length > 0){
            var matchIds = [];
            matches.map(x=> matchIds.push(x.match.id));
            this.matchService.assignSecondMatchToTable(matchIds, tableNumber).subscribe(this.onSuccessfullRefresh.bind(this));
        }
    }

    onSuccessfullRefresh(result: StatusDto){
        if(result.successful === true){
            this.onRefresh.emit("success");
        }
    }
}