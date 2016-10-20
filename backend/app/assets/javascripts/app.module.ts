// ====== ./app/app.module.ts ======
// Imports
import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';

// Declarations
import { AppComponent }         from './app.component';
import { PlayerService }         from './service/player.service';

import { routing } from './app.routes';

// Decorator
@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
     HttpModule,
    JsonpModule,
    routing
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