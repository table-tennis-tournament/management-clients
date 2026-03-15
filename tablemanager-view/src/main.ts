import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { WebsocketService } from './app/services/websocket.service';
import { WebsocketHandlerService } from './app/table-list/websocket-handler.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app/app-routing.module';
import { NavigationModule } from './app/navigation/navigation.module';
import { TableListModule } from './app/table-list/table-list.module';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './app/reducers';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      AppRoutingModule,
      NavigationModule,
      TableListModule,
      StoreModule.forRoot(reducers, {
        metaReducers,
        runtimeChecks: {
          strictStateImmutability: false,
          strictActionImmutability: false
        }
      }),
      EffectsModule.forRoot([]),
      StoreRouterConnectingModule.forRoot(),
      StoreDevtoolsModule.instrument({
        maxAge: 25,
        logOnly: environment.production,
        connectInZone: true
      })
    ),
    WebsocketService,
    WebsocketHandlerService
  ]
})
  .catch(err => console.error(err));

