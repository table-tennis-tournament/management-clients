import {NgModule} from '@angular/core';
import {TableListPageComponent} from './table-list.page.component';
import {TableListComponent} from './table-list/table-list.component';
import {TtTableComponent} from './table-list/tt-table/tt-table.component';
import {TtTableContentComponent} from './table-list/tt-table/tt-table-content/tt-table-content.component';
import {TtTableMatchItemComponent} from './table-list/tt-table/tt-table-match-item/tt-table-match-item.component';
import {ShowMatchModalComponent} from './table-list/show-match-modal/show-match-modal.component';
import {SelectTableModalComponent} from './table-list/select-table-modal/select-table-modal.component';
import {SelectMatchModalComponent} from './table-list/select-match-modal/select-match-modal.component';
import {ResultModalComponent} from './table-list/result-modal/result-modal.component';
import {SharedModule} from '../shared/shared.module';

const components = [
    TableListPageComponent,
    TableListComponent,
    TtTableComponent,
    TtTableContentComponent,
    TtTableMatchItemComponent,
    ShowMatchModalComponent,
    SelectTableModalComponent,
    SelectMatchModalComponent,
    ResultModalComponent
];


@NgModule({
    imports: [SharedModule],
    exports: [TableListPageComponent],
    declarations: [...components],
    entryComponents: [ResultModalComponent, SelectMatchModalComponent, SelectTableModalComponent]
})
export class TableModule {
}
