import {Component, Input} from "@angular/core"
import {Match} from "../data/match"
import {Table} from "../data/table"
import {MatchToStringService} from "../services/match.toString.service"
import {MatchService} from "../services/match.service"
import {TableService} from "../services/table.service"
import {Overlay, overlayConfigFactory } from "angular2-modal";
import {Modal, BSModalContext } from "angular2-modal/plugins/bootstrap";
import {CustomModalContext, CustomModal } from "./result.modal.view.component";
import {IResultHandler} from "../handler/result.handler"
import {IResult} from "../data/result"
import {TypeColors} from "../data/typeColors"

@Component({
    selector: "tt-table",
    templateUrl : "assets/javascripts/views/table.component.html"
})
export class TableComponent implements IResultHandler{

    public firstOpponent: string;
    public secondOpponent: string;
    public bgColor: string;
    public textColor: string;
    public tableNumber: string;

     constructor(private matchToStringService: MatchToStringService, public modal: Modal, private tableService: TableService,
        private matchService: MatchService){

    }
    
    _table: Table;
    get table(): Table {
        return this._table;
    }

    @Input("table")
    set table(value: Table){
        console.log("Start set Table");
        this._table = value;
        this.firstOpponent = this.matchToStringService.getPlayersNamesLong(this._table.match.team1);
        this.secondOpponent = this.matchToStringService.getPlayersNamesLong(this._table.match.team2);
        this.bgColor =TypeColors.TYPE_COLORS[this._table.match.type.id];
        this.textColor = this._table.match.type.id % 2 ===1?"": "white-text";
    } 

    onResult(){
        var dialog = this.modal.open(CustomModal,  overlayConfigFactory({ currentMatch: this.table.match, handler: this }, BSModalContext));
    }

    onFree(){
        this.tableService.freeTable(this.table.match.id).subscribe(this.freeTableAfterRequestSuccessfull.bind(this), this.handleErrorsOnService);
    }

    onLock(){
        this.tableService.lockTable(this.table.id).subscribe(this.lockTableAfterRequestSuccessfull.bind(this), this.handleErrorsOnService);
    }

    onUnLock(){
        this.table.isLocked = false;
    }

    onTakeBack(){
        this.tableService.takeBackTable(this.table.match.id).subscribe(this.takeBackTableAfterRequestSuccessful.bind(this), this.handleErrorsOnService);
    }

    freeTableAfterRequestSuccessfull(){
        this.table.match = null;
    }

    takeBackTableAfterRequestSuccessful(){
        this.table.match = null;
    }

    lockTableAfterRequestSuccessfull(){
        console.log("successful lock table request");
        this.table.isLocked = true;
        this.table.match = null;
    }

    handleErrorsOnService(e){
        console.log("An error ocurred: "+e.Message);
    }

    handleResult(resultToHandle: IResult[]){
        this.matchService.addResult(resultToHandle, this.table.match.id).subscribe(this.handleResultAfterRequestSuccessful,
        this.handleErrorsOnService);
    }

    handleResultAfterRequestSuccessful(){
        this.table.match = null;
    }
   
}