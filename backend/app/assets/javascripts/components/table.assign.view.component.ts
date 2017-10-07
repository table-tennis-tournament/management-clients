import {Component, ViewContainerRef, ViewEncapsulation, ViewChild} from "@angular/core"
import {MatchService} from "../services/match.service"
import {TableService} from "../services/table.service"
import {MatchToStringService} from "../services/match.toString.service"
import {RandomMatchService} from "../services/random.match.service"
import {ResultModalComponent} from "./result.modal.view.component"

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

    constructor(private matchService:MatchService, private tableService:TableService, 
        public matchToStringService: MatchToStringService, 
        private randomMatchService: RandomMatchService) {
        this.selectedOption = "2";
        this.loadAllTables();
        this.loadActiveWaitingList();
    }

    loadAllTables(){
        this.tableService.getAllTables().subscribe(this.getAllTablesSuccessful.bind(this), this.getAllTablesFailed)
    }

    loadActiveWaitingList(){

    }

    getAllTablesSuccessful(tables: TableDto[]){
        this.tables = tables;
        this.rowCount = Array.from(Array(Math.ceil(this.tables.length / 5)).keys());
    }

    onMatchlistTypeChange(event){
        console.log("inside on matchlist changed");
    }

    onWaitingListActiveChanged(){
        
    }

    getAllTablesFailed(error){
        console.log("Get all Tables failed following problems:");
        console.log(error);
    }

    handleMatchChanged(match: MatchListDto[]){
        this.loadAllTables();
    }

  
}