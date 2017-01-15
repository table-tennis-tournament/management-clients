import {Component, ViewContainerRef, ViewEncapsulation} from "@angular/core"
import {MatchService} from "../services/match.service"
import {TableService} from "../services/table.service"
import {MatchToStringService} from "../services/match.toString.service"
import {RandomMatchService} from "../services/random.match.service"

import {Table} from "../data/table"
import {TableDto} from "../data/table.dto"
import {MatchListDto} from "../data/match.list.dto"
import {MatchDto} from "../data/match.dto"



@Component({
  templateUrl:"assets/javascripts/views/table.view.component.html"
})
export class TableViewComponent{

    public tables: TableDto[];
    public rowCount: number[];

    constructor(private matchService:MatchService, private tableService:TableService, public matchToStringService: MatchToStringService, private randomMatchService: RandomMatchService) {
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

    getAllTablesFailed(error){
        console.log(error);
    }

    handleMatchChanged(match: MatchListDto[]){
        this.loadAllTables();
        // if(match.length === 1){
        //     this.tables[match[0].matchinfo.table.number].matchinfo = match[0].matchinfo;
        //     this.openModalDialogForMatch(match[0].matchinfo);
        // }
        
    }

    openModalDialogForMatch(match: MatchDto){
        var firstTeam = this.matchToStringService.getPlayersNamesLong(match.team1);
        var secondTeam = this.matchToStringService.getPlayersNamesLong(match.team2);
        // this.modal.alert()
        // .size("lg")
        // .showClose(false)
        // .isBlocking(true)
        // .bodyClass("modal-content text-centering")
        // .title("Neues Spiel Tisch Nr. "+match.table.number)
        // .body(`<h4>`+ match.type.name +`</h4><br/>
        //     <b>` + match.matchType.name +`</b><br/><br/>
        //     `+ firstTeam +` <br/>
        //      <b>-</b> <br/> ` 
        //      + secondTeam +`<br/>`)
        // .open();
    }
}