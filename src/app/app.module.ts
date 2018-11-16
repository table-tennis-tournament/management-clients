import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {EffectsModule} from '@ngrx/effects';
import {StoreRouterConnectingModule} from '@ngrx/router-store';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {
    MzButtonModule,
    MzCheckboxModule,
    MzCollectionModule,
    MzInputModule,
    MzModalModule,
    MzSelectModule,
    MzSpinnerModule
} from 'ngx-materialize';
import {ToastrModule} from 'ngx-toastr';
import {environment} from '../environments/environment';

import {AppRoutingModule} from './app-routing.module';
import {metaReducers, reducers} from './app-state.reducer';
import {AppComponent} from './app.component';
import {NavigationComponent} from './navigation/navigation.component';
import {TableListPageComponent} from './table/table-list.page.component';
import {TableEffects} from './table/redux/table.effects';
import {TableService} from './table/table.service';
import {TableListComponent} from './table/table-list/table-list.component';
import {TtTableComponent} from './table/table-list/tt-table/tt-table.component';
import {TtTableContentComponent} from './table/table-list/tt-table/tt-table-content/tt-table-content.component';
import {TtTableMatchItemComponent} from './table/table-list/tt-table/tt-table-match-item/tt-table-match-item.component';
import {TtPlayerNameReducerPipe} from './table/pipes/tt-player-name-reducer.pipe';
import {ResultModalComponent} from './table/table-list/result-modal/result-modal.component';
import {FormsModule} from '@angular/forms';
import {TtMatchDisciplinePipe} from './table/pipes/tt-match-discipline.pipe';
import {SelectMatchModalComponent} from './table/table-list/select-match-modal/select-match-modal.component';
import {ShowMatchModalComponent} from './table/table-list/show-match-modal/show-match-modal.component';
import {SelectTableModalComponent} from './table/table-list/select-table-modal/select-table-modal.component';
import {AssignMatchPageComponent} from './assign/assign-match.page.component';
import {DisciplineMatchListComponent} from './assign/discipline-match-list/discipline-match-list.component';
import {DisciplineSelectComponent} from './assign/discipline-select/discipline-select.component';
import {DisciplineTypePipe} from './assign/pipes/discipline-type.pipe';
import {MatchEffects} from './assign/redux/match.effects';
import {DragDropModule} from '@angular/cdk/drag-drop';

@NgModule({
    declarations: [
        AppComponent,
        TableListComponent,
        TtTableComponent,
        NavigationComponent,
        TableListPageComponent,
        TtTableContentComponent,
        TtTableMatchItemComponent,
        TtPlayerNameReducerPipe,
        ResultModalComponent,
        TtMatchDisciplinePipe,
        SelectMatchModalComponent,
        ShowMatchModalComponent,
        SelectTableModalComponent,
        AssignMatchPageComponent,
        DisciplineMatchListComponent,
        DisciplineSelectComponent,
        DisciplineTypePipe
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MzButtonModule,
        MzSpinnerModule,
        MzInputModule,
        MzModalModule,
        MzCheckboxModule,
        MzSelectModule,
        MzCollectionModule,
        DragDropModule,
        FormsModule,
        ToastrModule.forRoot({
            timeOut: 5000,
            extendedTimeOut: 2000,
            closeButton: true,
            positionClass: 'toast-top-center'
        }),
        StoreModule.forRoot(reducers, {metaReducers}),
        StoreRouterConnectingModule.forRoot({
            stateKey: 'router',
        }),
        StoreDevtoolsModule.instrument({
            name: 'Devtools',
            logOnly: environment.production,
        }),
        EffectsModule.forRoot([TableEffects, MatchEffects]),
        HttpClientModule
    ],

    providers: [TableService],
    bootstrap: [AppComponent],
    entryComponents: [ResultModalComponent, SelectMatchModalComponent, SelectTableModalComponent]
})
export class AppModule {
}
