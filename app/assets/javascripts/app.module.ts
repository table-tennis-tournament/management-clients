// ====== ./app/app.module.ts ======
// Imports
import { NgModule }       from "@angular/core"
import { BrowserModule }  from "@angular/platform-browser"
import { FormsModule }    from "@angular/forms"
import { HttpModule, JsonpModule } from "@angular/http"
import { CommonModule } from "@angular/common"

import { MaterializeModule } from "angular2-materialize";

import { RouterModule, Routes } from "@angular/router"

import {AppComponent} from "./app.component"
import {PlayerComponent} from "./components/player.component"
import {TableViewComponent} from "./components/table.view.component"
import {TableComponent} from "./components/table.component"
import {CustomModal} from "./components/result.modal.view.component"
import {SupervisorViewComponent} from "./components/supervisor.view.component"
import {MatchFilterComponent} from "./components/match.filter.component"
import {MatchFilterCriteriaComponent} from "./components/match.filter.criteria.component"
import {MatchListComponent} from "./components/match.list.view.component"
import {DisciplineViewComponent} from "./components/discipline.view.component"

import { PlayerService } from "./services/player.service"
import { MatchService } from "./services/match.service"
import { TableService } from "./services/table.service"
import { WebSocketService } from "./services/web.socket.service"
import { MatchToStringService } from "./services/match.toString.service"
import { MatchListService } from "./services/match.list.service"
import { RandomMatchService } from "./services/random.match.service"

import { routeConfig } from "./app.routes"

import {APP_BASE_HREF} from "@angular/common";

import {ModalModule} from "angular2-modal";
import {BootstrapModalModule} from "angular2-modal/plugins/bootstrap";


@NgModule({
  
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    HttpModule,
    JsonpModule,
    MaterializeModule,
    ModalModule.forRoot(),
    BootstrapModalModule,
    RouterModule.forRoot(routeConfig)
  ],
  declarations: [
    AppComponent,
    PlayerComponent,
    TableViewComponent,
    CustomModal,
    SupervisorViewComponent,
    MatchFilterComponent,
    MatchFilterCriteriaComponent,
    MatchListComponent,
    DisciplineViewComponent,
    TableComponent
  ],
  providers: [
      PlayerService,
      MatchService,
      TableService,
      WebSocketService,
      MatchToStringService,
      MatchListService,
      RandomMatchService,
      {provide: APP_BASE_HREF, useValue : "/" }
    ],
  bootstrap: [AppComponent],
  entryComponents: [ CustomModal ]
})
export class AppModule {
    // Module class
}