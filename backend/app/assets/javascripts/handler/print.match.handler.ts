import {StatusDto} from "../data/status.dto"
import {ISelectMatchHandler} from "./select.match.handler"
import {TableService} from "../services/table.service"
import {EventEmitter} from "@angular/core"
import {ToastService} from "../services/toast.service";
import {Match} from '../data/match';

export class PrintMatchHandler implements ISelectMatchHandler {
    
    public onRefresh: EventEmitter<string>;

    constructor(private tableService: TableService, private toastService: ToastService){
        this.onRefresh = new EventEmitter<string>();
    }

    handleSelection(matches: Match[]) {
        if(matches!== null && matches.length > 0){
            const matchIds = [];
            matches.map(x=> matchIds.push(x.id));
            this.tableService.printMatches(matchIds).subscribe(this.onSuccessfullRefresh.bind(this));
        }
    }

    handleAll(matches: Match[]) {
        this.handleSelection(matches);
    }

    onSuccessfullRefresh(result: StatusDto){
        this.toastService.toastMessageOrShowStatus(result, "Spiele gedruckt");
    }
}