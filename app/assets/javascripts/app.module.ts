// ====== ./app/app.module.ts ======
// Imports
import { NgModule }       from "@angular/core"
import { BrowserModule }  from "@angular/platform-browser"
import { FormsModule }    from "@angular/forms"
import { HttpModule, JsonpModule } from "@angular/http"

import { RouterModule, Routes } from "@angular/router"

import {AppComponent} from "./app.component"
import {PlayerComponent} from "./components/player.component"
import {TableViewComponent} from "./components/table.view.component"
import {TableComponent} from "./components/table.component"

import { PlayerService } from "./services/player.service"
import { MatchService } from "./services/match.service"
import { TableService } from "./services/table.service"
import { WebSocketService } from "./services/web.socket.service"
import { MatchToStringService } from "./services/match.toString.service"

import { routeConfig } from "./app.routes"

import {APP_BASE_HREF} from "@angular/common";

import {ModalModule} from "angular2-modal";
import {BootstrapModalModule} from "angular2-modal/plugins/bootstrap";


@NgModule({
  
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    ModalModule.forRoot(),
    BootstrapModalModule,
    RouterModule.forRoot(routeConfig)
  ],
  declarations: [
    AppComponent,
    PlayerComponent,
    TableViewComponent,
    TableComponent
  ],
  providers: [
      PlayerService,
      MatchService,
      TableService,
      WebSocketService,
      MatchToStringService,
      {provide: APP_BASE_HREF, useValue : "/" }
    ],
  bootstrap: [AppComponent]
})
export class AppModule {
    // Module class
}