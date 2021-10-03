import {HttpClientModule} from '@angular/common/http';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';
import {StoreRouterConnectingModule} from '@ngrx/router-store';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {ToastrModule} from 'ngx-toastr';
import {environment} from '../environments/environment';
import {AppRoutingModule} from './navigation/app-routing.module';
import {metaReducers, reducers} from './app-state.reducer';
import {AppComponent} from './app.component';
import {TableEffects} from './table/redux/table.effects';
import {TableService} from './table/table.service';
import {ResultModalComponent} from './table/table-list/result-modal/result-modal.component';
import {SelectMatchModalComponent} from './table/table-list/select-match-modal/select-match-modal.component';
import {SelectTableModalComponent} from './table/table-list/select-table-modal/select-table-modal.component';
import {MatchEffects} from './assign/redux/match.effects';
import {MatchListEffects} from './supervisor/redux/matchlist.effects';
import {DisciplineEffects} from './discipline/redux/discipline.effects';
import {SettingsEffects} from './settings/redux/settings.effects';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {WebsocketService} from './shared/websocket.service';
import {WebSocketEffects} from './websocket/redux/websocket.effects';
import {WebsocketHandlerService} from './websocket/websocket.handler.service';
import {CallerEffects} from './caller/redux/caller.effects';
import {ZXingScannerModule} from '@zxing/ngx-scanner';
import {ResultEffects} from './result/redux/result.effects';
import {SharedModule} from './shared/shared.module';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {AdminRootModule} from './admin-root/admin-root.module';

const components = [AppComponent];

@NgModule({
    declarations: components,
    imports: [
        AppRoutingModule,
        DragDropModule,

        SharedModule.forRoot(),
        ToastrModule.forRoot({
            timeOut: 5000,
            extendedTimeOut: 2000,
            closeButton: false,
            positionClass: 'toast-bottom-center'
        }),
        StoreModule.forRoot(reducers, {metaReducers}),
        StoreDevtoolsModule.instrument({
            name: 'Devtools',
            logOnly: environment.production,
        }),
        EffectsModule.forRoot([TableEffects, MatchEffects, MatchListEffects,
            DisciplineEffects, SettingsEffects, WebSocketEffects, CallerEffects, ResultEffects]),
        HttpClientModule,
        NoopAnimationsModule,
        AdminRootModule
    ],
    providers: [TableService, WebsocketService, WebsocketHandlerService],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AppModule {
}
