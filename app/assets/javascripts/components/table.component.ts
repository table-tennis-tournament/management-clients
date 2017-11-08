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
        private matchService: MatchService){

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

    @Output() onTableAssigned = new EventEmitter<any>();

    @Output() onSelectMatch = new EventEmitter<SelectMatchEvent>();


    setBgColorAndTextColorDependsOnType(){
        if(this.table.matchinfo[0]){
            this.bgColor =TypeColors.TYPE_COLORS[this.table.matchinfo[0].type.id];
            this.textColor = this.table.matchinfo[0].type.kind ===2?"": "white-text";
        }
        
    }

    onMatchDrop(event){
        var match = event.dragData.match;
       
        if(this.table.matchinfo[0] !== null && this.table.matchinfo[0] !== undefined){
            return;
        }
        var isGroup = event.dragData.isGroup;
        if(isGroup === false){
            this.matchService.assignMatchToTable([match.match.id], this.table.table.number).subscribe(this.onMatchAssigned.bind(this, event.dragData), this.handleErrorsOnService);
            return;
        }
        if(match.group != null){
            this.matchService.assignGroupToTable(match.group.id, this.table.table.number).subscribe(this.onMatchAssigned.bind(this, event.dragData), this.handleErrorsOnService);
        }
        
    };

    onMatchAssigned(dragData){
        var match = dragData.match;
        this.table.matchinfo=[]
        this.table.matchinfo[0] = match;
        this.onTableAssigned.emit(dragData);
        this.setBgColorAndTextColorDependsOnType();
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
            this.tableService.freeTable(matchId).subscribe(this.freeTableAfterRequestSuccessfull.bind(this), this.handleErrorsOnService);
            return;
        }
        this.fireSelectMatchEvent(new FreeMatchHandler(this.tableService))
    }

    onTakeBack(){
        if(this.isSingleMatch()){
            var matchId = this.table.matchinfo[0].match.id;
            this.tableService.takeBackTable(matchId).subscribe(this.takeBackTableAfterRequestSuccessful.bind(this), this.handleErrorsOnService);
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
        console.log("to do reload table");
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