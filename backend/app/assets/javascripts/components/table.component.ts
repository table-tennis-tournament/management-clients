import {Component, Input} from "@angular/core"
import {Match} from "../data/match"
import {TableDto} from "../data/table.dto"
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

     constructor(private matchToStringService: MatchToStringService, public modal: Modal, private tableService: TableService,
        private matchService: MatchService){

    }
    
    _table: TableDto;
    get table(): TableDto {
        return this._table;
    }

    @Input("table")
    set table(value: TableDto){
        this._table = value;
        if(this._table.matchinfo){
            this.firstOpponent = this.matchToStringService.getPlayersNamesLong(this._table.matchinfo.team1);
            this.secondOpponent = this.matchToStringService.getPlayersNamesLong(this._table.matchinfo.team2);
            this.setBgColorAndTextColorDependsOnType();
        }
        
    } 

    setBgColorAndTextColorDependsOnType(){
        if(this.table.matchinfo){
            this.bgColor =TypeColors.TYPE_COLORS[this.table.matchinfo.type.id];
            this.textColor = this.table.matchinfo.type.kind ===2?"": "white-text";
        }
        
    }

    onResult(){
        var dialog = this.modal.open(CustomModal,  overlayConfigFactory({ currentMatch: this.table.matchinfo, handler: this }, BSModalContext));
    }

    onFree(){
        this.tableService.freeTable(this.table.table.id).subscribe(this.freeTableAfterRequestSuccessfull.bind(this), this.handleErrorsOnService);
    }

    onLock(){
        this.tableService.lockTable(this.table.table.id).subscribe(this.lockTableAfterRequestSuccessfull.bind(this), this.handleErrorsOnService);
    }

    onUnLock(){
        
        this.tableService.unlockTable(this.table.table.id).subscribe(this.unLockTableAfterRequestSuccessful.bind(this), this.handleErrorsOnService);
    }

    onTakeBack(){
        this.tableService.takeBackTable(this.table.table.id).subscribe(this.takeBackTableAfterRequestSuccessful.bind(this), this.handleErrorsOnService);
    }

    unLockTableAfterRequestSuccessful(){
        this.table.table.isLocked = false;
        this.setBgColorAndTextColorDependsOnType();
    }

    freeTableAfterRequestSuccessfull(){
        this.table.matchinfo = null;
    }

    takeBackTableAfterRequestSuccessful(){
        this.table.matchinfo = null;
    }

    lockTableAfterRequestSuccessfull(){
        console.log("successful lock table request");
        this.table.table.isLocked = true;
        this.bgColor =TypeColors.TYPE_COLORS[0];
        this.textColor = "white-text";
    }

    handleErrorsOnService(e){
        console.log("An error ocurred: "+e.Message);
    }

    handleResult(resultToHandle: IResult[]){
        var matchId = this.table.matchinfo.match.id;
        this.matchService.addResult(resultToHandle, matchId).subscribe(this.handleResultAfterRequestSuccessful.bind(this),
        this.handleErrorsOnService);
    }

    handleResultAfterRequestSuccessful(){
        console.log("sucessfully added result");
        this.table.matchinfo = null;
    }
   
}