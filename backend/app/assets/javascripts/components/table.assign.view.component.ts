import {Component, ViewContainerRef, ViewEncapsulation, ViewChild} from "@angular/core"
import {MatchListService} from "../services/match.list.service"
import {TableService} from "../services/table.service"
import {RandomMatchService} from "../services/random.match.service"
import {ResultModalComponent} from "./result.modal.view.component"
import {DisciplineMatchListComponent} from "./discipline.match.list.view.component"

import {Table} from "../data/table"
import {TableDto} from "../data/table.dto"
import {MatchListDto} from "../data/match.list.dto"
import {MatchDto} from "../data/match.dto"
import {Match} from "../data/match"
import {ResultEvent} from "../handler/result.event"


@Component({
  templateUrl:"assets/javascripts/views/table.assign.view.component.html"
})
export class TableAssignViewComponent{

    public tables: TableDto[];
    public rowCount: number[];

    public selectedOption:string;
    public isWaitingListActive: boolean;

    @ViewChild(DisciplineMatchListComponent) matchListComponent: DisciplineMatchListComponent;


    constructor(private matchListService:MatchListService, private tableService:TableService) {
        this.selectedOption = "2";
        this.loadAllTables();
        this.loadActiveWaitingList();
    }

    onRefreshTablesClicked(){
        this.loadAllTables();
    }


    onTypeChanged(){
        this.matchListComponent.onRefreshMatchesClicked();
    }

    loadAllTables(){
        this.tableService.getAllTables().subscribe(this.getAllTablesSuccessful.bind(this), this.onError)
    }

    loadActiveWaitingList(){
        this.matchListService.getMatchlistActive().subscribe(this.onMatchlistActiveLoaded.bind(this));
    }

    onMatchlistActiveLoaded(_isActive){
        this.isWaitingListActive = _isActive;
    }

    getAllTablesSuccessful(tables: TableDto[]){
        this.tables = tables;
        this.rowCount = Array.from(Array(Math.ceil(this.tables.length / 5)).keys());
    }

    onMatchlistTypeChange(event){
        console.log("inside on matchlist changed");
    }

    onWaitingListActiveChanged(){
        this.matchListService.setMatchlistActive(this.isWaitingListActive).
            subscribe(this.onSetWaitingListActiveSuccess.bind(this), this.onError.bind(this));
    }

    onSetWaitingListActiveSuccess(){
        console.log("on set waiting list active finished");
    }

    onError(error){
        console.log("Get all Tables failed following problems:");
        console.log(error);
    }

    handleMatchChanged(match: MatchListDto[]){
        this.loadAllTables();
    }

  
}