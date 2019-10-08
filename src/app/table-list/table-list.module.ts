import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {SharedModule} from '../shared/shared.module';
import {MatchEffects} from './match/redux/match.effects';
import {PlayerNamePipe} from './player-name.pipe';
import {TableListEffects} from './redux/table-list.effects';
import * as fromTables from './redux/table-list.reducer';
import {TableListComponent} from './table-list.component';
import {TtTableComponent} from './tt-table/tt-table.component';

@NgModule({
    declarations: [
        TtTableComponent,
        TableListComponent,
        PlayerNamePipe
    ],
    imports: [
        SharedModule,
        StoreModule.forFeature('tables', fromTables.tableReducer),
        EffectsModule.forFeature([MatchEffects, TableListEffects])
    ],
    exports: [TableListComponent]
})
export class TableListModule {
}
