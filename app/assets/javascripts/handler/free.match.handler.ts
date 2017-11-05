import {MatchDto} from "../data/match.dto"
import {ISelectMatchHandler} from "../handler/select.match.handler"
import {TableService} from "../services/table.service"
import {EventEmitter} from "@angular/core"

export class FreeMatchHandler implements ISelectMatchHandler {
    
    public onRefresh: EventEmitter<string>;

    constructor(private tableService: TableService){
        this.onRefresh = new EventEmitter<string>();
    }

    handleSelection(matches: MatchDto[]) {
        if(matches!== null && matches.length === 1){
            this.tableService.freeTable(matches[0].match.id).subscribe(this.onSuccessfullRefresh.bind(this));
        }
    }
    handleAll(matches: MatchDto[]) {
        throw new Error("Method not implemented.");
    }

    onSuccessfullRefresh(){
        this.onRefresh.emit("success");
    }
}