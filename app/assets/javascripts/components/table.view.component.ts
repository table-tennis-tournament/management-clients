import {Component, ViewContainerRef, ViewEncapsulation} from "@angular/core"
import {MatchService} from "../services/match.service"
import {TableService} from "../services/table.service"
import {MatchToStringService} from "../services/match.toString.service"
import {RandomMatchService} from "../services/random.match.service"

import {Table} from "../data/table"
import {TableDto} from "../data/table.dto"
import {MatchDto} from "../data/match.dto"

import { Overlay } from "angular2-modal";
import { Modal } from "angular2-modal/plugins/bootstrap";


@Component({
  templateUrl:"assets/javascripts/views/table.view.component.html"
})
export class TableViewComponent{

    public tables: TableDto[];
    public rowCount: number[];

    constructor(private matchService:MatchService, private tableService:TableService, overlay: Overlay, vcRef: ViewContainerRef,  
        public modal: Modal, public matchToStringService: MatchToStringService, private randomMatchService: RandomMatchService) {
        console.log("table view constructor start");
        overlay.defaultViewContainer = vcRef;

        this.tableService.getAllTables().subscribe(this.getAllTablesSuccessful.bind(this), this.getAllTablesFailed)
       
        this.tableService.OnTableChanged.subscribe(
            this.handleMatchChanged.bind(this)
        );
    }

    getAllTablesSuccessful(tables: TableDto[]){
        this.tables = tables;
        this.rowCount = Array.from(Array(Math.ceil(this.tables.length / 5)).keys());
        
    }

    getAllTablesFailed(error){
        console.log(error);
    }

    handleMatchChanged(match: MatchDto){
        this.tables[match.table.id].matchinfo = match;
        this.openModalDialogForMatch(match);
    }

    openModalDialogForMatch(match: MatchDto){
        var firstTeam = this.matchToStringService.getPlayersNamesLong(match.team1);
        var secondTeam = this.matchToStringService.getPlayersNamesLong(match.team2);
        this.modal.alert()
        .size("lg")
        .showClose(false)
        .isBlocking(true)
        .bodyClass("modal-content text-centering")
        .title("Neues Spiel Tisch Nr. "+match.table.tableNumber)
        .body(`<h4>`+ match.type.name +`</h4><br/>
            <b>` + match.matchType.name +`</b><br/><br/>
            `+ firstTeam +` <br/>
             <b>-</b> <br/> ` 
             + secondTeam +`<br/>`)
        .open();
    }
}