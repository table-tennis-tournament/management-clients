// ====== ./app/app.module.ts ======
// Imports
import { NgModule }       from "@angular/core"
import { BrowserModule }  from "@angular/platform-browser"
import { FormsModule }    from "@angular/forms"
import { HttpModule, JsonpModule } from "@angular/http"

import { RouterModule, Routes } from "@angular/router"

import {NavigationComponent} from "./navigation.component"
import {AppComponent} from "./app.Component"

import { PlayerService } from "./services/player.service"

import { routeConfig } from "./app.routes"

import {APP_BASE_HREF} from "@angular/common";


// const appRoutes: Routes = [
//   { path: "", component: AppComponent },
//   { path: "playerView", component: AppComponent }
// ];
// Decorator
@NgModule({
  declarations: [
    NavigationComponent,
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
     HttpModule,
    JsonpModule,
    RouterModule.forRoot(routeConfig)
  ],
  
  providers: [
      PlayerService,
      {provide: APP_BASE_HREF, useValue : "/" }
    ],
  bootstrap: [NavigationComponent, AppComponent ]
})
export class AppModule {
    // Module class
}