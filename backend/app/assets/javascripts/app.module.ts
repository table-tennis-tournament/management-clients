// ====== ./app/app.module.ts ======
// Imports
import { NgModule }       from "@angular/core"
import { BrowserModule }  from "@angular/platform-browser"
import { FormsModule }    from "@angular/forms"
import { HttpModule, JsonpModule } from "@angular/http"

import { RouterModule, Routes } from "@angular/router"

import {AppComponent} from "./app.Component"
import {PlayerComponent} from "./components/player.component"
import {MatchComponent} from "./components/match.component"
import {TableComponent} from "./components/table.component"

import { PlayerService } from "./services/player.service"
import { MatchService } from "./services/match.service"

import { routeConfig } from "./app.routes"

import {APP_BASE_HREF} from "@angular/common";


@NgModule({
  
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    RouterModule.forRoot(routeConfig)
  ],
  declarations: [
    AppComponent,
    PlayerComponent,
    MatchComponent,
    TableComponent
  ],
  providers: [
      PlayerService,
      MatchService,
      {provide: APP_BASE_HREF, useValue : "/" }
    ],
  bootstrap: [AppComponent]
})
export class AppModule {
    // Module class
}