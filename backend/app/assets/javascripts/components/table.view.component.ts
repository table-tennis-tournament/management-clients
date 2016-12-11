import {Component, ViewContainerRef, ViewEncapsulation} from "@angular/core"
import {MatchService} from "../services/match.service"
import {TableService} from "../services/table.service"
import {MatchToStringService} from "../services/match.toString.service"

import {Table} from "../data/table"
import {Match} from "../data/match"

import { Overlay } from "angular2-modal";
import { Modal } from "angular2-modal/plugins/bootstrap";


@Component({
  templateUrl:"assets/javascripts/views/table.view.component.html"
})
export class TableViewComponent{

    public tables: Table[];
    public selectedTable: Table;
    public rowCount: number[];
    private tableService: TableService;

    constructor(private matchService:MatchService, tableService:TableService, overlay: Overlay, vcRef: ViewContainerRef,  
        public modal: Modal, public matchToStringService: MatchToStringService) {
        console.log("table view constructor start");
        overlay.defaultViewContainer = vcRef;
        this.tableService = tableService;
        this.tables = tableService.getAllTables();
        this.rowCount = Array.from(Array(Math.ceil(this.tables.length / 5)).keys());
        this.tableService.OnTableChanged.subscribe(
            this.handleMatchChanged.bind(this)
        );
    }

    handleMatchChanged(match: Match){
        this.tables[match.tableNumber].match = match;
        this.openModalDialogForMatch(match);
    }

    openModalDialogForMatch(match: Match){
        var firstTeam = this.matchToStringService.getPlayersNamesLong(match.team1);
        var secondTeam = this.matchToStringService.getPlayersNamesLong(match.team2);
        this.modal.alert()
        .size("lg")
        .showClose(false)
        .isBlocking(true)
        .bodyClass("modal-content text-centering")
        .title("Neues Spiel Tisch Nr. "+match.tableNumber)
        .body(`<h4>`+ match.type.typeName +`</h4><br/>
            <b>` + match.stage +`</b><br/><br/>
            `+ firstTeam +` <br/>
             <b>-</b> <br/> ` 
             + secondTeam +`<br/>`)
        .open();
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