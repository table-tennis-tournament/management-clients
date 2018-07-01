import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {EffectsModule} from '@ngrx/effects';
import {StoreRouterConnectingModule} from '@ngrx/router-store';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {MzButtonModule, MzInputModule} from 'ngx-materialize';
import {environment} from '../environments/environment';

import {AppRoutingModule} from './app-routing.module';
import {metaReducers, reducers} from './app-state.reducer';
import {AppComponent} from './app.component';
import {ClubviewComponent} from './clubview/clubview.component';
import {GroupviewComponent} from './groupview/groupview.component';
import {MatchviewComponent} from './matchview/matchview.component';
import {NavigationComponent} from './navigation/navigation.component';
import {PlayerviewComponent} from './playerview/playerview.component';
import {TableListPageComponent} from './table/table-list.page.component';
import {TableEffects} from './table/redux/table.effects';
import {TableService} from './table/table.service';
import {TableListComponent} from './table/table-list/table-list.component';
import {TtTableComponent} from './table/table-list/tt-table/tt-table.component';
import {TypeviewComponent} from './typeview/typeview.component';

@NgModule({
    declarations: [
        AppComponent,
        TableListComponent,
        MatchviewComponent,
        PlayerviewComponent,
        ClubviewComponent,
        TypeviewComponent,
        GroupviewComponent,
        TtTableComponent,
        NavigationComponent,
        TableListPageComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        MzButtonModule,
        MzInputModule,
        StoreModule.forRoot(reducers, {metaReducers}),
        StoreRouterConnectingModule.forRoot({
            stateKey: 'router',
        }),
        StoreDevtoolsModule.instrument({
            name: 'Devtools',
            logOnly: environment.production,
        }),
        EffectsModule.forRoot([TableEffects]),
        HttpClientModule
    ],
    providers: [TableService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
