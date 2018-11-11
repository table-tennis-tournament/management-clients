import {Component, EventEmitter, Output} from "@angular/core";
import {TableService} from "../../services/table.service";
import {TableDto} from "../../data/table.dto";
import {BaseModal} from "../../components/modals/base.modal";
import {ToastService} from "../../services/toast.service";
import {ShowMatchEvent} from "../../handler/show.match.event";
import {Player} from "../../data/player";


@Component({
    selector : "modal-show-match",
    templateUrl : "assets/javascripts/views/modals/show.match.modal.view.component.html"
})
export class ModalShowMatchComponent extends BaseModal{
    
    private currentTable: TableDto;
    private currentEvent: ShowMatchEvent;
    public players:Player[];
    private isDialogOpen:boolean = false;

    @Output() onClose = new EventEmitter<string>();

    constructor(private tableService: TableService){
        super();
    }
   
    protected onConfirmAction() {
        this.currentTable = null;
    }

    public onCustomOk(){
        this.currentTable = null;
        this.closeModal();
        this.isDialogOpen = false;
        const that = this;
        setTimeout(() => {
            that.onClose.emit(this.currentEvent.tableId);
        }, 500);
    }

    public showMatch(event: ShowMatchEvent){
        if(this.isDialogOpen){
            return;
        }
        this.isDialogOpen = true;
        this.currentEvent = event;
        this.loadTableById();
    }

    loadTableById(){
        this.tableService.getTableById(this.currentEvent.tableId).subscribe(this.onTableLoaded.bind(this));
    }

    onTableLoaded(table: TableDto){
        this.currentTable = table;
        this.players = null;
        if(this.currentTable.matches && this.currentTable.matches.length > 1){
            this.setPlayers();
        }
        this.openModal();
    }

    setPlayers(){
        const playerArray = [];
        this.currentTable.matches.forEach(match => {
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

     
}