import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {ResultComponent} from './result.component';
import { StageViewComponent } from './stage-view/stage-view.component';

@NgModule({
  declarations: [
    ResultComponent,
    StageViewComponent
  ],
  imports: [
    SharedModule
    // StoreModule.forFeature('result', fromTables.reducer),
    // EffectsModule.forFeature([MatchEffects, TableListEffects]),
    // ReactiveFormsModule
  ],
  exports: [ResultComponent]
})
export class ResultModule {
}
