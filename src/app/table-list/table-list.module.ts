import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {SharedModule} from '../shared/shared.module';
import {MatchEffects} from './match/redux/match.effects';
import {PlayerNamePipe} from './player-name.pipe';
import {TableListEffects} from './redux/table-list.effects';
import * as fromTables from './redux/table-list.reducer';
import {TableListComponent} from './table-list.component';
import {ResultDialogComponent} from './tt-table/result-dialog/result-dialog.component';
import {StartDialogComponent} from './tt-table/start-dialog/start-dialog.component';
import {TtTableComponent} from './tt-table/tt-table.component';

@NgModule({
    declarations: [
        TtTableComponent,
        TableListComponent,
        PlayerNamePipe,
        ResultDialogComponent,
        StartDialogComponent
    ],
    imports: [
        SharedModule,
        StoreModule.forFeature('tables', fromTables.reducer),
        EffectsModule.forFeature([MatchEffects, TableListEffects]),
        ReactiveFormsModule
    ],
    exports: [TableListComponent],
    entryComponents: [
        ResultDialogComponent,
        StartDialogComponent
    ]
})
export class TableListModule {
}
