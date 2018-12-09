import {Component} from "@angular/core";
import {TableService} from "../../services/table.service";
import {TableDto} from "../../data/table.dto";
import {BaseModal} from "../../components/modals/base.modal";
import {ISelectTableHandler} from "../../handler/select.table.handler";
import {SelectTableEvent} from "app/assets/javascripts/handler/select.table.event";
import {ToastService} from "../../services/toast.service";
import {Match} from '../../data/match';


@Component({
    selector : "modal-select-table",
    templateUrl : "assets/javascripts/views/modals/select.table.modal.view.component.html"
})
export class ModalSelectTableComponent extends BaseModal{
    private currentMatches: Match[];
    public tables: TableDto[];
    public selectedTable: any;
    private currentHandler: ISelectTableHandler;

    constructor(private tableService: TableService, private toastService: ToastService){
        super();
    }

    loadFreeTables(){
        this.tableService.getFreeTables().subscribe(this.onFreeTablesLoaded.bind(this));
    }

    onFreeTablesLoaded(tables: TableDto[]){
        this.tables = tables;
        if(this.tables.length < 1){
            this.toastService.toast("keine freien Tische");
            return;
        }
        this.selectedTable = this.tables[0].number;
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