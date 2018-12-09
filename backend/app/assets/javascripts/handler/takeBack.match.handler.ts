import {StatusDto} from "../data/status.dto"
import {ISelectMatchHandler} from "./select.match.handler"
import {TableService} from "../services/table.service"
import {EventEmitter} from "@angular/core"
import {Match} from '../data/match';

export class TakeBackMatchHandler implements ISelectMatchHandler {

    public onRefresh: EventEmitter<string>;

    constructor(private tableService: TableService){
        this.onRefresh = new EventEmitter<string>();
    }

    handleSelection(matches: Match[]) {
        if(matches!== null && matches.length > 0){
            const matchIds = [];
            matches.map(x=> matchIds.push(x.id));
            this.tableService.takeBackTable(matchIds).subscribe(this.onSuccessfullRefresh.bind(this));
        }
    }
    handleAll(matches: Match[]) {
        this.handleSelection(matches);
    }

    onSuccessfullRefresh(result: StatusDto){
        if(result.successful === true){
            this.onRefresh.emit("success");
        }
    }
}