// ====== ./app/app.module.ts ======
// Imports
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core"
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
import {SupervisorViewComponent} from "./components/supervisor.view.component"
import {MatchFilterComponent} from "./components/match.filter.component"
import {MatchFilterCriteriaComponent} from "./components/match.filter.criteria.component"
import {MatchListComponent} from "./components/match.list.view.component"
import {DisciplineViewComponent} from "./components/discipline.view.component"
import {DisciplineGroupViewComponent} from "./components/discipline.group.view.component"
import {StageViewComponent} from "./components/stage.view.component"
import {ResultModalComponent} from "./components/result.modal.view.component"
import {SelectMatchModalComponent} from "./components/table/table.select.match.modal.component"
import {TableAssignViewComponent} from "./components/table.assign.view.component"
import {DisciplineMatchListComponent} from "./components/discipline.match.list.view.component"
import {ResultViewComponent} from "./components/result.view.component"
import {DisciplineSelectViewComponent} from "./components/discipline.select.view.component"
import { SettingsComponent } from "./components/settings/settings.component";

import {DisciplineStageComponent} from "./components/discipline/discipline.stage.view.component"

import {DisciplineMatchItemComponent} from "./components/items/discipline.match.item.component"
import {StageMatchItemComponent} from "./components/items/stage.match.item.component"
import {TeamMatchItemComponent} from "./components/items/team.match.item.component"
import {MatchItemComponent} from "./components/items/match.item.component"
import {TableMatchItemComponent} from "./components/items/table.match.item.component"

import {ModalFocusDirective} from "./directives/mod.focus.directive"

import { PlayerService } from "./services/player.service"
import { MatchService } from "./services/match.service"
import { TableService } from "./services/table.service"
import { WebSocketService } from "./services/web.socket.service"
import { MatchToStringService } from "./services/match.toString.service"
import { MatchListService } from "./services/match.list.service"
import { RandomMatchService } from "./services/random.match.service"
import { BaseService } from "./services/base.service"
import { ToastService } from "./services/toast.service";
import { SettingsService } from "./services/settings.service";

import { routeConfig } from "./app.routes"

import {APP_BASE_HREF} from "@angular/common";

import {DndModule} from "ng2-dnd";


@NgModule({
  
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    HttpModule,
    JsonpModule,
    MaterializeModule,
    DndModule.forRoot(),
    RouterModule.forRoot(routeConfig)
  ],
  declarations: [
    AppComponent,
    PlayerComponent,
    TableViewComponent,
    SupervisorViewComponent,
    MatchFilterComponent,
    MatchFilterCriteriaComponent,
    MatchListComponent,
    DisciplineViewComponent,
    DisciplineGroupViewComponent,
    StageViewComponent,
    ResultModalComponent,
    TableComponent,
    DisciplineMatchListComponent,
    TableAssignViewComponent,
    ResultViewComponent,
    DisciplineSelectViewComponent,
    ModalFocusDirective,
    DisciplineMatchItemComponent,
    StageMatchItemComponent,
    MatchItemComponent,
    DisciplineStageComponent,
    TableMatchItemComponent,
    SelectMatchModalComponent,
    TeamMatchItemComponent,
    SettingsComponent
  ],
  providers: [
      PlayerService,
      MatchService,
      TableService,
      WebSocketService,
      MatchToStringService,
      MatchListService,
      RandomMatchService,
      BaseService,
      ToastService,
      SettingsService,
      {provide: APP_BASE_HREF, useValue : "/" }
    ],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {
    // Module class
}