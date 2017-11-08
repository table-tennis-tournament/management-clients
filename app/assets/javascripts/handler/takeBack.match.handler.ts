import {MatchDto} from "../data/match.dto"
import {StatusDto} from "../data/status.dto"
import {ISelectMatchHandler} from "../handler/select.match.handler"
import {TableService} from "../services/table.service"
import {EventEmitter} from "@angular/core"

export class TakeBackMatchHandler implements ISelectMatchHandler {

    public onRefresh: EventEmitter<string>;

    constructor(private tableService: TableService){
        this.onRefresh = new EventEmitter<string>();
    }

    handleSelection(matches: MatchDto[]) {
        if(matches!== null && matches.length > 0){
            var matchIds = [];
            matches.map(x=> matchIds.push(x.match.id));
            this.tableService.takeBackTable(matchIds).subscribe(this.onSuccessfullRefresh.bind(this));
        }
    }
    handleAll(matches: MatchDto[]) {
        this.handleSelection(matches);
    }

    onSuccessfullRefresh(result: StatusDto){
        if(result.successful === true){
            this.onRefresh.emit("success");
        }
    }
}