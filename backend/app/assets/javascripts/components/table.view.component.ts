import {Component} from "@angular/core"
import {MatchService} from "../services/match.service"
import {TableService} from "../services/table.service"

import {Table} from "../data/table"


@Component({
  templateUrl:"assets/javascripts/views/table.view.component.html"
})
export class TableViewComponent{

    public tables: Table[];
    public selectedTable: Table;
    public rowCount: number[];

    private tableService: TableService;

    constructor(private matchService:MatchService, tableService:TableService) {
        this.tableService = tableService;
        this.tables = tableService.getAllTables();
        this.rowCount = Array.from(Array(Math.ceil(this.tables.length / 5)).keys());
        console.log(this.tableService.OnTableChanged);
        this.tableService.OnTableChanged.subscribe(
            this.handleMatchChanged
        );
    }

    handleMatchChanged(match){
        console.log("Match changed called: " + match);
    }

   onSelect(table: Table) { this.selectedTable = table; }


//    this.matchService = matchService;
//         this.matches = [];
//         this.matchService.getAllMatches().subscribe( matches =>{
//                     this.tables = matches;
//                     this.rowCount = Array.from(Array(Math.ceil(this.tables.length / 5)).keys());
//                 }, 
//                 err => {
//                     console.log(err);
//                 });
}