import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { TableService } from './app/table/table.service';
import { provideHttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app/navigation/app-routing.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SharedModule } from './app/shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './app/app-state.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { TableEffects } from './app/table/redux/table.effects';
import { MatchEffects } from './app/assign/redux/match.effects';
import { MatchListEffects } from './app/supervisor/redux/matchlist.effects';
import { DisciplineEffects } from './app/discipline/redux/discipline.effects';
import { SettingsEffects } from './app/settings/redux/settings.effects';
import { CallerEffects } from './app/caller/redux/caller.effects';
import { ResultEffects } from './app/result/redux/result.effects';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AdminRootModule } from './app/admin-root/admin-root.module';
import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    // Angular defaults to zoneless since v21; the admin view relies on zone.js change detection.
    provideZoneChangeDetection(),
    importProvidersFrom(
      AppRoutingModule,
      DragDropModule,
      SharedModule.forRoot(),
      StoreModule.forRoot(reducers, {
        metaReducers,
        runtimeChecks: {
          strictStateImmutability: false,
          strictActionImmutability: false,
        },
      }),
      StoreDevtoolsModule.instrument({
        name: 'Devtools',
        logOnly: environment.production,
        connectInZone: true,
      }),
      EffectsModule.forRoot([
        TableEffects,
        MatchEffects,
        MatchListEffects,
        DisciplineEffects,
        SettingsEffects,
        CallerEffects,
        ResultEffects,
      ]),
      NoopAnimationsModule,
      AdminRootModule
    ),
    TableService,
    provideHttpClient(),
  ],
}).catch((err) => console.log(err));
