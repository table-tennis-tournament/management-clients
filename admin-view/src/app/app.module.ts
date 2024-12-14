import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ToastrModule } from 'ngx-toastr';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './navigation/app-routing.module';
import { metaReducers, reducers } from './app-state.reducer';
import { AppComponent } from './app.component';
import { TableEffects } from './table/redux/table.effects';
import { TableService } from './table/table.service';
import { MatchEffects } from './assign/redux/match.effects';
import { MatchListEffects } from './supervisor/redux/matchlist.effects';
import { DisciplineEffects } from './discipline/redux/discipline.effects';
import { SettingsEffects } from './settings/redux/settings.effects';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WebsocketService } from './shared/websocket.service';
import { WebSocketEffects } from './websocket/redux/websocket.effects';
import { WebsocketHandlerService } from './websocket/websocket.handler.service';
import { CallerEffects } from './caller/redux/caller.effects';
import { ResultEffects } from './result/redux/result.effects';
import { SharedModule } from './shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AdminRootModule } from './admin-root/admin-root.module';

const components = [AppComponent];

@NgModule({ declarations: components,
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA], imports: [AppRoutingModule,
        DragDropModule,
        SharedModule.forRoot(),
        ToastrModule.forRoot({
            timeOut: 5000,
            extendedTimeOut: 2000,
            closeButton: false,
            positionClass: 'toast-bottom-center',
        }),
        StoreModule.forRoot(reducers, {
            metaReducers,
            runtimeChecks: {
                strictStateImmutability: false,
                strictActionImmutability: false,
            },
        }),
        StoreDevtoolsModule.instrument({
            name: 'Devtools',
            logOnly: environment.production,
            connectInZone: true
        }),
        EffectsModule.forRoot([
            TableEffects,
            MatchEffects,
            MatchListEffects,
            DisciplineEffects,
            SettingsEffects,
            WebSocketEffects,
            CallerEffects,
            ResultEffects,
        ]),
        NoopAnimationsModule,
        AdminRootModule], providers: [TableService, WebsocketService, WebsocketHandlerService, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {}
