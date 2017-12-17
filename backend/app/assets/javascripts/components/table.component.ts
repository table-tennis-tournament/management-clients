import {Component, Input, Output, EventEmitter} from "@angular/core"
import {Match} from "../data/match"
import {MatchDto} from "../data/match.dto"
import {Group} from "../data/group"
import {TableDto} from "../data/table.dto"
import {MatchToStringService} from "../services/match.toString.service"
import {MatchService} from "../services/match.service"
import {TableService} from "../services/table.service"
import {Overlay, overlayConfigFactory } from "angular2-modal"
import {IResultHandler} from "../handler/result.handler"
import {ResultEvent} from "../handler/result.event"
import {SelectMatchEvent} from "../handler/select.match.event"
import {IResult} from "../data/result"
import {TypeColors} from "../data/typeColors"
import {MaterializeAction} from "angular2-materialize"
import {TakeBackMatchHandler} from "../handler/takeBack.match.handler";
import {FreeMatchHandler} from "../handler/free.match.handler";
import { ISelectMatchHandler } from "app/assets/javascripts/handler/select.match.handler";
import { AssignEvent } from "../handler/assign.event";
import { StatusDto } from "../data/status.dto";
import { ToastService } from "../services/toast.service";
import { SelectTableEvent } from "../handler/select.table.event";
import { AssignSecondTableHandler } from "../handler/assign.second.table.handler";

@Component({
    selector: "tt-table",
    templateUrl : "assets/javascripts/views/table.component.html"
})
export class TableComponent implements IResultHandler{

    public firstOpponent: string;
    public secondOpponent: string;
    public bgColor: string;
    public textColor: string;

    constructor(private matchToStringService: MatchToStringService, private tableService: TableService,
        private matchService: MatchService, private toastService:ToastService){

    }
    
    _table: TableDto;
    get table(): TableDto {
        return this._table;
    }

    @Input("table")
    set table(value: TableDto){
        this._table = value;
        this.setBgColorAndTextColorDependsOnType();
    } 

    @Output() onResultForMatch = new EventEmitter<ResultEvent>();

    @Output() onTableAssigned = new EventEmitter<AssignEvent>();

    @Output() onSelectMatch = new EventEmitter<SelectMatchEvent>();

    @Output() onSelectTable = new EventEmitter<SelectTableEvent>();


    setBgColorAndTextColorDependsOnType(){
        if(this.table.matchinfo && this.table.matchinfo[0]){
            this.bgColor =TypeColors.TYPE_COLORS[this.table.matchinfo[0].type.id];
            this.textColor = this.table.matchinfo[0].type.kind ===2?"": "white-text";
        }
    }

    onMatchDrop(event){
        if(this.table.matchinfo && this.table.matchinfo[0]){
            return;
        }
        var matchIds = event.dragData.matches.map(x=>x.match.id);;
        this.matchService.assignMatchToTable(matchIds, this.table.table.number).subscribe(this.onMatchAssigned.bind(this, event.dragData), this.handleErrorsOnService);
    };

    onMatchAssigned(dragData){
        this.table.matchinfo=[];
        this.table.matchinfo = dragData.matches;
        this.onTableAssigned.emit(dragData);
        this.onTableRefresh();
    }

    onResult(){
        var resultEvent = new ResultEvent();
        resultEvent.handler = this;
        resultEvent.match = this.table.matchinfo[0];
        this.onResultForMatch.emit(resultEvent);
    }

    isSingleMatch(){
        return this.table.matchinfo != null && this.table.matchinfo.length === 1;
    }

    onLock(){
        this.tableService.lockTable(this.table.table.id).subscribe(this.lockTableAfterRequestSuccessfull.bind(this), this.handleErrorsOnService);
    }

    onUnLock(){
        this.tableService.unlockTable(this.table.table.id).subscribe(this.unLockTableAfterRequestSuccessful.bind(this), this.handleErrorsOnService);
    }
   
    onFree(){
        if(this.isSingleMatch()){
            var matchId = this.table.matchinfo[0].match.id;
            this.tableService.freeTable([matchId]).subscribe(this.freeTableAfterRequestSuccessfull.bind(this), this.handleErrorsOnService);
            return;
        }
        this.fireSelectMatchEvent(new FreeMatchHandler(this.tableService))
    }

    onTakeBack(){
        if(this.isSingleMatch()){
            var matchId = this.table.matchinfo[0].match.id;
            this.tableService.takeBackTable([matchId]).subscribe(this.takeBackTableAfterRequestSuccessful.bind(this), this.handleErrorsOnService);
            return;
        }
        this.fireSelectMatchEvent(new TakeBackMatchHandler(this.tableService))
    }

    fireSelectMatchEvent(selectHandler: ISelectMatchHandler){
        var selectEvent = new SelectMatchEvent();
        selectEvent.handler = selectHandler;
        selectEvent.handler.onRefresh.subscribe(this.onTableRefresh.bind(this));
        selectEvent.matches = this._table.matchinfo;
        this.onSelectMatch.emit(selectEvent);
    }

    onTableRefresh(){
        this.tableService.getTableById(this._table.table.id).subscribe(this.onGetTable.bind(this));
    }

    onGetTable(table: TableDto){
        this.table = table;
        this.setBgColorAndTextColorDependsOnType();
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

    assignToSecondTable(){
        var selectEvent = new SelectTableEvent();
        selectEvent.handler = new AssignSecondTableHandler(this.matchService);
        selectEvent.handler.onRefresh.subscribe(this.onTableRefresh.bind(this));
        selectEvent.matches = this._table.matchinfo;
        this.onSelectTable.emit(selectEvent);
    }

    onPrint(){
        this.tableService.printMatch(this.table.matchinfo[0].match.id).subscribe(this.onPrinted.bind(this));
    }

    onPrinted(status: StatusDto){
        if(status.successful){
            this.toastService.toast("An Drucker gesendet");
            return;
        }
        this.toastService.toast(status.message);
        
    }

    lockTableAfterRequestSuccessfull(){
        this.table.table.isLocked = true;
        this.bgColor =TypeColors.TYPE_COLORS[0];
        this.textColor = "white-text";
    }

    handleErrorsOnService(e){
        console.log("An error ocurred: "+e.Message);
    }

    handleResult(resultToHandle: IResult[]){
        var matchId = this.table.matchinfo[0].match.id;
        this.matchService.addResult(resultToHandle, matchId).subscribe(this.handleResultAfterRequestSuccessful.bind(this),
        this.handleErrorsOnService);
    }

    handleResultAfterRequestSuccessful(){
        this.table.matchinfo = null;
    }
   
}