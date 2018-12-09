import {Component, EventEmitter, Input, Output} from "@angular/core"
import {TableDto} from "../data/table.dto"
import {MatchToStringService} from "../services/match.toString.service"
import {MatchService} from "../services/match.service"
import {TableService} from "../services/table.service"
import {IResultHandler} from "../handler/result.handler"
import {ResultEvent} from "../handler/result.event"
import {SelectMatchEvent} from "../handler/select.match.event"
import {IResult} from "../data/result"
import {TypeColors} from "../data/typeColors"
import {TakeBackMatchHandler} from "../handler/takeBack.match.handler";
import {FreeMatchHandler} from "../handler/free.match.handler";
import {ISelectMatchHandler} from "app/assets/javascripts/handler/select.match.handler";
import {AssignEvent} from "../handler/assign.event";
import {StatusDto} from "../data/status.dto";
import {ToastService} from "../services/toast.service";
import {SelectTableEvent} from "../handler/select.table.event";
import {AssignSecondTableHandler} from "../handler/assign.second.table.handler";
import {PrintMatchHandler} from "../handler/print.match.handler";

@Component({
    selector: "tt-table",
    templateUrl : "assets/javascripts/views/table.component.html"
})
export class TableComponent implements IResultHandler{

    public firstOpponent: string;
    public secondOpponent: string;
    public bgColor: string;

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
        if(this.table.matches && this.table.matches[0]){
            this.bgColor =TypeColors.TYPE_COLORS[this.table.matches[0].type.id];
        }
    }

    onMatchDrop(event){
        if(this.table.matches && this.table.matches[0]){
            return;
        }
        const matchIds = event.dragData.matches.map(x => x.match.id);;
        this.matchService.assignMatchToTable(matchIds, this.table.number).subscribe(
            this.onMatchAssigned.bind(this, event.dragData), 
            this.handleErrorsOnService.bind(this));
    };

    onMatchAssigned(dragData){
        this.toastService.toast("Tisch zugewiesen");
        // this.table.matchinfo=[];
        // this.table.matchinfo = dragData.matches;
        // this.onTableAssigned.emit(dragData);
        // this.onTableRefresh();
    }

    onResult(){
        if(this.isSingleMatch()){
            const resultEvent = new ResultEvent();
            resultEvent.handler = this;
            resultEvent.match = this.table.matches[0];
            this.onResultForMatch.emit(resultEvent);
        }
       
    }

    isSingleMatch(){
        return this.table.matches != null && this.table.matches.length === 1;
    }

    onLock(){
        this.tableService.lockTable(this.table.id).subscribe(this.lockTableAfterRequestSuccessfull.bind(this), this.handleErrorsOnService.bind(this));
    }

    onUnLock(){
        this.tableService.unlockTable(this.table.id).subscribe(this.unLockTableAfterRequestSuccessful.bind(this), this.handleErrorsOnService.bind(this));
    }
   
    onFree(){
        if(this.isSingleMatch()){
            const matchId = this.table.matches[0].id;
            this.tableService.freeTable([matchId]).subscribe(this.freeTableAfterRequestSuccessfull.bind(this), this.handleErrorsOnService.bind(this));
            return;
        }
        this.fireSelectMatchEvent(new FreeMatchHandler(this.tableService))
    }

    onTakeBack(){
        if(this.isSingleMatch()){
            const matchId = this.table.matches[0].id;
            this.tableService.takeBackTable([matchId]).subscribe(this.takeBackTableAfterRequestSuccessful.bind(this), this.handleErrorsOnService.bind(this));
            return;
        }
        this.fireSelectMatchEvent(new TakeBackMatchHandler(this.tableService))
    }

    fireSelectMatchEvent(selectHandler: ISelectMatchHandler){
        const selectEvent = new SelectMatchEvent();
        selectEvent.handler = selectHandler;
        selectEvent.handler.onRefresh.subscribe(this.onTableRefresh.bind(this));
        selectEvent.matches = this._table.matches;
        this.onSelectMatch.emit(selectEvent);
    }

    onTableRefresh(){
        // this.tableService.getTableById(this._table.table.id).subscribe(this.onGetTable.bind(this));
    }

    onGetTable(table: TableDto){
        this.table = table;
        this.setBgColorAndTextColorDependsOnType();
    }

    unLockTableAfterRequestSuccessful(){
        this.table.isLocked = false;
        this.setBgColorAndTextColorDependsOnType();
    }

    freeTableAfterRequestSuccessfull(){
        this.table.matches = null;
    }

    takeBackTableAfterRequestSuccessful(){
        this.table.matches = null;
    }

    assignToSecondTable(){
        const selectEvent = new SelectTableEvent();
        selectEvent.handler = new AssignSecondTableHandler(this.matchService);
        selectEvent.handler.onRefresh.subscribe(this.onTableRefresh.bind(this));
        selectEvent.matches = this._table.matches;
        this.onSelectTable.emit(selectEvent);
    }

    onPrint(){
        if(this.isSingleMatch()){
            const matchId = this.table.matches[0].id;
            this.tableService.printMatch(matchId).subscribe(
                this.onPrinted.bind(this),
                this.handleErrorsOnService.bind(this));
            return;
        }
        this.fireSelectMatchEvent(new PrintMatchHandler(this.tableService, this.toastService))
       
    }

    onPrinted(status: StatusDto){
        this.toastService.toastMessageOrShowStatus(status, "An Drucker gesendet");
    }

    lockTableAfterRequestSuccessfull(){
        this.table.isLocked = true;
        this.bgColor =TypeColors.TYPE_COLORS[0];
    }

    handleErrorsOnService(status: StatusDto){
        this.toastService.toast(status.message);
    }

    handleResult(resultToHandle: IResult[]){
        const matchId = this.table.matches[0].id;
        this.matchService.addResult(resultToHandle, matchId).subscribe(
            this.handleResultAfterRequestSuccessful.bind(this),
            this.handleErrorsOnService.bind(this));
    }

    handleResultAfterRequestSuccessful(){
        this.table.matches = null;
    }
   
}