import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {EffectsModule} from '@ngrx/effects';
import {StoreRouterConnectingModule} from '@ngrx/router-store';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {MzButtonModule, MzInputModule, MzModalModule, MzSpinnerModule} from 'ngx-materialize';
import {ToastrModule} from 'ngx-toastr';
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
import {TtTableContentComponent} from './table/table-list/tt-table/tt-table-content/tt-table-content.component';
import {TtTableMatchItemComponent} from './table/table-list/tt-table/tt-table-match-item/tt-table-match-item.component';
import {TtPlayerNameReducerPipe} from './table/pipes/tt-player-name-reducer.pipe';
import {ResultModalComponent} from './table/table-list/result-modal/result-modal.component';
import {FormsModule} from '@angular/forms';

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
        TtTableContentComponent,
        TtTableMatchItemComponent,
        TtPlayerNameReducerPipe,
        ResultModalComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MzButtonModule,
        MzSpinnerModule,
        MzInputModule,
        MzModalModule,
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
        EffectsModule.forRoot([TableEffects]),
        HttpClientModule
    ],

    providers: [TableService],
    bootstrap: [AppComponent],
    entryComponents: [ResultModalComponent]
})
export class AppModule {
}
