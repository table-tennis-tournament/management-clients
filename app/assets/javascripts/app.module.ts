// ====== ./app/app.module.ts ======
// Imports
import { NgModule }       from "@angular/core"
import { BrowserModule }  from "@angular/platform-browser"
import { FormsModule }    from "@angular/forms"
import { HttpModule, JsonpModule } from "@angular/http"

import {AppComponent} from "./app.Component"

import { PlayerService } from "./services/player.service"


// Decorator
@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
     HttpModule,
    JsonpModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [
      PlayerService
    ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
    // Module class
}