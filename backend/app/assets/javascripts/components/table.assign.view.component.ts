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

    public showWaitlist:boolean;

    constructor(private matchService:MatchService, private tableService:TableService, 
        public matchToStringService: MatchToStringService, 
        private randomMatchService: RandomMatchService) {
        this.showWaitlist = true;
        this.loadAllTables();
    }

    loadAllTables(){
        this.tableService.getAllTables().subscribe(this.getAllTablesSuccessful.bind(this), this.getAllTablesFailed)
    }

    getAllTablesSuccessful(tables: TableDto[]){
        this.tables = tables;
        this.rowCount = Array.from(Array(Math.ceil(this.tables.length / 5)).keys());
    }

    onMatchlistTypeChange(event, second){
        console.log(event);
        console.log(second);
        console.log("inside on matchlist changed");
    }

    getAllTablesFailed(error){
        console.log(error);
    }

    handleMatchChanged(match: MatchListDto[]){
        this.loadAllTables();
    }

  
}