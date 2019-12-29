import {NgModule} from '@angular/core';
import {PlayerPageComponent} from './player.page.component';
import {PlayerItemComponent} from './player-list/player-item/player-item.component';
import {SharedModule} from '../shared/shared.module';
import {PlayerListComponent} from './player-list/player-list.component';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {PlayerEffects} from './redux/player.effects';
import * as fromPlayers from './redux/index';

@NgModule({
    declarations: [
        PlayerPageComponent,
        PlayerItemComponent,
        PlayerListComponent
    ],
    imports: [
        SharedModule,
        StoreModule.forFeature('players', fromPlayers.reducers),
        EffectsModule.forFeature([PlayerEffects])
    ],
    providers: [],
    exports: [PlayerPageComponent]
})
export class PlayerModule {
}
