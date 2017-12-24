import {Component, Input, EventEmitter} from "@angular/core";
import {Match} from "../../data/match";
import { TableService } from "../../services/table.service";
import { TableDto } from "../../data/table.dto";
import {MaterializeAction} from "angular2-materialize";
import { BaseModal } from "../../components/modals/base.modal";
import { ISelectTableHandler } from "../../handler/select.table.handler";
import { SelectTableEvent } from "app/assets/javascripts/handler/select.table.event";
import { MatchDto } from "../../data/match.dto";


@Component({
    selector : "modal-select-table",
    templateUrl : "assets/javascripts/views/modals/select.table.modal.view.component.html"
})
export class ModalSelectTableComponent extends BaseModal{
    private currentMatches: MatchDto[];
    public tables: TableDto[];
    public selectedTable: any;
    private currentHandler: ISelectTableHandler;

    constructor(private tableService: TableService){
        super();
    }

    loadFreeTables(){
        this.tableService.getFreeTables().subscribe(this.onFreeTablesLoaded.bind(this));
    }

    onFreeTablesLoaded(tables: TableDto[]){
        this.tables = tables;
        this.selectedTable = this.tables[0].table.number;
        this.openModal();
    }

    protected onConfirmAction() {
        this.currentHandler.handleSelection(this.currentMatches, this.selectedTable);
        this.closeModal();
    }
    
    public selectTable(event: SelectTableEvent){
        this.currentHandler = event.handler;
        this.currentMatches = event.matches;
        this.loadFreeTables();
    }

    onCancel(){
        this.closeModal();
    }
     
}