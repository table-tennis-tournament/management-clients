import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';
import {StoreRouterConnectingModule} from '@ngrx/router-store';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
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
import {TtMatchDisciplinePipe} from './table/pipes/tt-match-discipline.pipe';
import {SelectMatchModalComponent} from './table/table-list/select-match-modal/select-match-modal.component';
import {ShowMatchModalComponent} from './table/table-list/show-match-modal/show-match-modal.component';
import {SelectTableModalComponent} from './table/table-list/select-table-modal/select-table-modal.component';
import {AssignMatchPageComponent} from './assign/assign-match.page.component';
import {DisciplineMatchListComponent} from './assign/discipline-match-list/discipline-match-list.component';
import {DisciplineTypePipe} from './assign/pipes/discipline-type.pipe';
import {MatchEffects} from './assign/redux/match.effects';
import {SupervisorPageComponent} from './supervisor/supervisor.page.component';
import {MatchListEffects} from './supervisor/redux/matchlist.effects';
import {DisciplineViewComponent} from './supervisor/discipline-view/discipline-view.component';
import {MatchlistViewComponent} from './supervisor/matchlist-view/matchlist-view.component';
import {DisciplineEffects} from './discipline/redux/discipline.effects';
import {DisciplineGroupComponent} from './supervisor/discipline-view/discipline-group/discipline-group.component';
import {DisciplineStageComponent} from './supervisor/discipline-view/discipline-stage/discipline-stage.component';
import {DisciplineStageItemComponent} from './supervisor/discipline-view/discipline-stage/discipline-stage-item/discipline-stage-item.component';
import {TeamItemComponent} from './shared/team-item/team-item.component';
import {SettingsEffects} from './settings/redux/settings.effects';
import {SettingsPageComponent} from './settings/settings.page.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ResultListPageComponent} from './result/result-list.page.component';
import {ResultListComponent} from './result/result-list/result-list.component';
import {StagePipe} from './result/pipes/stage.pipe';
import {DisciplinePipe} from './result/pipes/discipline.pipe';
import {SettingsListComponent} from './settings/settings-list/settings-list.component';
import {WebsocketService} from './shared/websocket.service';
import {WebSocketEffects} from './websocket/redux/websocket.effects';
import {WebsocketHandlerService} from './websocket/websocket.handler.service';
import {CallerPageComponent} from './caller/caller.page.component';
import {CallerMatchListComponent} from './caller/caller-match-list/caller-match-list.component';
import {CallerMatchDetailComponent} from './caller/caller-match-detail/caller-match-detail.component';
import {RefereesListComponent} from './caller/referees-list/referees-list.component';
import {CallerEffects} from './caller/redux/caller.effects';
import {QrResultScannerComponent} from './settings/qr-result-scanner/qr-result-scanner.component';
import {ResultPipe} from './shared/result/result.pipe';
import {ZXingScannerModule} from '@zxing/ngx-scanner';
import {MatchlistGroupItemComponent} from './supervisor/matchlist-view/matchlist-group-item/matchlist-group-item.component';
import {MatchlistSingleItemComponent} from './supervisor/matchlist-view/matchlist-single-item/matchlist-single-item.component';
import {ResultEffects} from './result/redux/result.effects';
import {PlayerCallsComponent} from './caller/player-calls/player-calls.component';
import {SharedModule} from './shared/shared.module';
import {PlayerModule} from './player/player.module';
import {DisciplineModule} from './discipline/discipline.module';
import { MatchlistGroupComponent } from './assign/discipline-match-list/matchlist-group/matchlist-group.component';
import { SingleItemComponent } from './assign/discipline-match-list/single-item/single-item.component';
import { MatchlistStageComponent } from './assign/discipline-match-list/matchlist-stage/matchlist-stage.component';

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
        DisciplineTypePipe,
        SupervisorPageComponent,
        DisciplineViewComponent,
        MatchlistViewComponent,
        DisciplineGroupComponent,
        DisciplineStageComponent,
        DisciplineStageItemComponent,
        TeamItemComponent,
        SettingsPageComponent,
        ResultListPageComponent,
        ResultListComponent,
        StagePipe,
        ResultPipe,
        DisciplinePipe,
        SettingsListComponent,
        CallerPageComponent,
        CallerMatchListComponent,
        CallerMatchDetailComponent,
        RefereesListComponent,
        QrResultScannerComponent,
        MatchlistGroupItemComponent,
        MatchlistSingleItemComponent,
        PlayerCallsComponent,
        MatchlistGroupComponent,
        SingleItemComponent,
        MatchlistStageComponent
    ],
    imports: [
        SharedModule,
        AppRoutingModule,
        DragDropModule,
        PlayerModule,
        DisciplineModule,
        ZXingScannerModule.forRoot(),
        ToastrModule.forRoot({
            timeOut: 5000,
            extendedTimeOut: 2000,
            closeButton: false,
            positionClass: 'toast-bottom-center'
        }),
        StoreModule.forRoot(reducers, {metaReducers}),
        StoreRouterConnectingModule.forRoot({
            stateKey: 'router',
        }),
        StoreDevtoolsModule.instrument({
            name: 'Devtools',
            logOnly: environment.production,
        }),
        EffectsModule.forRoot([TableEffects, MatchEffects, MatchListEffects,
            DisciplineEffects, SettingsEffects, WebSocketEffects, CallerEffects, ResultEffects]),
        HttpClientModule
    ],

    providers: [TableService, WebsocketService, WebsocketHandlerService],
    bootstrap: [AppComponent],
    entryComponents: [ResultModalComponent, SelectMatchModalComponent, SelectTableModalComponent]
})
export class AppModule {
}
