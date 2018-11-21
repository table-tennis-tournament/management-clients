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
    private _tables: TableDto[];

    public selectedTable: number;
    private modalOptions: Materialize.ModalOptions = customModalOptions;
    @ViewChild('selectTableModal') modal: MzModalComponent;

    public OnTableSelected: EventEmitter<number> = new EventEmitter<number>();

    get tables(): TableDto[] {
        return this._tables;
    }

    set tables(value: TableDto[]) {
        this.selectedTable = value[0].number;
        this._tables = value;
    }

    onOk() {
        this.OnTableSelected.emit(this.selectedTable);
        this.modal.closeModal();
    }

}
