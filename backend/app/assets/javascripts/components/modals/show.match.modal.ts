import {Component, Input, EventEmitter} from "@angular/core";
import {Match} from "../../data/match";
import { TableService } from "../../services/table.service";
import { TableDto } from "../../data/table.dto";
import {MaterializeAction} from "angular2-materialize";
import { BaseModal } from "../../components/modals/base.modal";
import { ISelectTableHandler } from "../../handler/select.table.handler";
import { SelectTableEvent } from "app/assets/javascripts/handler/select.table.event";
import { MatchDto } from "../../data/match.dto";
import { ToastService } from "../../services/toast.service";
import { ShowMatchEvent } from "../../handler/show.match.event";
import { Player } from "../../data/player";


@Component({
    selector : "modal-show-match",
    templateUrl : "assets/javascripts/views/modals/show.match.modal.view.component.html"
})
export class ModalShowMatchComponent extends BaseModal{
    
    private currentTable: TableDto;
    private currentEvent: ShowMatchEvent;
    public players:Player[];

    constructor(private tableService: TableService, private toastService: ToastService){
        super();
    }

    loadFreeTables(){
        this.tableService.getTableById(this.currentEvent.tableId).subscribe(this.onTableLoaded.bind(this));
    }

    onTableLoaded(table: TableDto){
        this.currentTable = table;
        this.players = null;
        if(this.currentTable.matchinfo && this.currentTable.matchinfo.length > 1){
            this.setPlayers();
        }
        this.openModal();
    }

    setPlayers(){
        var playerArray =[];
        this.currentTable.matchinfo.forEach(match => {
            if(match.team1 && !playerArray[match.team1[0].id]){
                playerArray[match.team1[0].id] = match.team1[0];
            }
            if(match.team2 && !playerArray[match.team2[0].id]){
                playerArray[match.team2[0].id] = match.team2[0];
            }
        })
        this.players =[];
        playerArray.forEach(player => {
            if(player){
                this.players.push(player);
            }
        });
    }

    protected onConfirmAction() {
        this.closeModal();
        this.currentEvent.onRefresh.emit("cancel");
    }
    
    public showMatch(event: ShowMatchEvent){
        this.currentEvent = event;
        this.loadFreeTables();
    }

    onCancel(){
        this.closeModal();
        this.currentEvent.onRefresh.emit("cancel");
    }
     
}