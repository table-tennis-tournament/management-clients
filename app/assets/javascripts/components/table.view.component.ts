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
        console.log("subscribe on table changed");
        this.tableService.OnTableChanged.subscribe(
            this.handleMatchChanged.bind(this)
        );
    }

    handleMatchChanged(match){
        console.log(match);
        this.tables[4].match = match;
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