import {Component, EventEmitter, ViewChild} from '@angular/core';
import {TableDto} from '../../tabledto.model';
import {MzBaseModal, MzModalComponent} from 'ngx-materialize';
import {customModalOptions} from '../../../shared/modal.options';

@Component({
    selector: 'toma-select-table-modal',
    templateUrl: './select-table-modal.component.html',
    styleUrls: ['./select-table-modal.component.scss']
})
export class SelectTableModalComponent extends MzBaseModal {

    public tables: TableDto[];
    public selectedTable: TableDto;
    private modalOptions: Materialize.ModalOptions = customModalOptions;

    @ViewChild('selectTableModal') modal: MzModalComponent;

    public OnTableSelected: EventEmitter<TableDto> = new EventEmitter<TableDto>();

    setTables(tables: TableDto[]) {
        this.tables = tables;
        this.selectedTable = this.tables[0];
    }

    onOk() {
        this.OnTableSelected.emit(this.selectedTable);
        this.modal.closeModal();
    }

}
