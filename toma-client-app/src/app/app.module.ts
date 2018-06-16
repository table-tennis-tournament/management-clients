import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MzButtonModule, MzInputModule } from 'ngx-materialize';
import { TableviewComponent } from './tableview/tableview.component';
import { MatchviewComponent } from './matchview/matchview.component';
import { PlayerviewComponent } from './playerview/playerview.component';
import { ClubviewComponent } from './clubview/clubview.component';
import { TypeviewComponent } from './typeview/typeview.component';
import { GroupviewComponent } from './groupview/groupview.component';
import { TttableviewComponent } from './tttableview/tttableview.component';
import {TableService} from './tableview/table.service';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    TableviewComponent,
    MatchviewComponent,
    PlayerviewComponent,
    ClubviewComponent,
    TypeviewComponent,
    GroupviewComponent,
    TttableviewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MzButtonModule,
    MzInputModule,
    HttpClientModule
  ],
  providers: [TableService],
  bootstrap: [AppComponent]
})
export class AppModule { }
