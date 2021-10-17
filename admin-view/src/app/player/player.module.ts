import { NgModule } from '@angular/core';
import { PlayerPageComponent } from './player.page.component';
import { SharedModule } from '../shared/shared.module';
import { PlayerListComponent } from './player-list/player-list.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PlayerEffects } from './redux/player.effects';
import * as fromPlayers from './redux/index';
import { DisciplineModule } from '../discipline/discipline.module';

@NgModule({
  declarations: [PlayerPageComponent, PlayerListComponent],
  imports: [
    SharedModule,
    DisciplineModule,
    StoreModule.forFeature('players', fromPlayers.reducers),
    EffectsModule.forFeature([PlayerEffects]),
  ],
  providers: [],
  exports: [PlayerPageComponent],
})
export class PlayerModule {}
