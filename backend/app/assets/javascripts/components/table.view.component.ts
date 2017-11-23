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
import { SelectMatchModalComponent } from "../components/table/table.select.match.modal.component";


@Component({
  templateUrl:"assets/javascripts/views/table.view.component.html",
  selector: "table-view-component"
})
export class TableViewComponent{

    public tables: TableDto[];
    public rowCount: number[];

    @ViewChild(ResultModalComponent) resultDialog: ResultModalComponent;
    
    @ViewChild(SelectMatchModalComponent) selectMatch: SelectMatchModalComponent;

    constructor(private matchService:MatchService, private tableService:TableService, 
        public matchToStringService: MatchToStringService, 
        private randomMatchService: RandomMatchService) {
        this.loadAllTables();
        
        this.tableService.OnTableChanged.subscribe(
            this.handleMatchChanged.bind(this)
        );
    }

    loadAllTables(){
        this.tableService.getAllTables().subscribe(this.getAllTablesSuccessful.bind(this), this.getAllTablesFailed)
    }

    getAllTablesSuccessful(tables: TableDto[]){
        this.tables = tables;
        this.rowCount = Array.from(Array(Math.ceil(this.tables.length / 5)).keys());
    }

    onTableRefresh(){
        this.loadAllTables();
    }

    getAllTablesFailed(error){
        console.log(error);
    }

    handleMatchChanged(match: MatchListDto[]){
        this.loadAllTables();
    }

    onResultForMatch(resultEvent: ResultEvent){
        this.resultDialog.setResultHandler(resultEvent.handler);
        this.resultDialog.setMatch(resultEvent.match);
        this.resultDialog.openModal();
    }
}