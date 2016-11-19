// ====== ./app/app.module.ts ======
// Imports
import { NgModule }       from "@angular/core"
import { BrowserModule }  from "@angular/platform-browser"
import { FormsModule }    from "@angular/forms"
import { HttpModule, JsonpModule } from "@angular/http"

import { RouterModule, Routes } from "@angular/router"

import {AppComponent} from "./app.component"
import {PlayerComponent} from "./player.component"

import { PlayerService } from "./services/player.service"

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
    PlayerComponent
  ],
  providers: [
      PlayerService,
      {provide: APP_BASE_HREF, useValue : "/" }
    ],
  bootstrap: [AppComponent]
})
export class AppModule {
    // Module class
}