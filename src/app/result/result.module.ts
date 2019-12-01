import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {SharedModule} from '../shared/shared.module';
import {GroupViewComponent} from './group-view/group-view.component';
import {MatchItemComponent} from './match-item/match-item.component';
import {ResultEffects} from './redux/result.effects';
import * as fromResults from './redux/result.reducer';
import {ResultComponent} from './result.component';
import {ResultPipe} from './result.pipe';
import {StageViewComponent} from './stage-view/stage-view.component';
import { TabItemComponent } from './tab-item/tab-item.component';

@NgModule({
  declarations: [
    ResultComponent,
    StageViewComponent,
    GroupViewComponent,
    ResultPipe,
    MatchItemComponent,
    TabItemComponent
  ],
  imports: [
    SharedModule,
    StoreModule.forFeature('disciplines', fromResults.reducer),
    EffectsModule.forFeature([ResultEffects])
  ],
  exports: [ResultComponent]
})
export class ResultModule {
}
