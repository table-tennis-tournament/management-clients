import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { StoreModule } from '@ngrx/store';
import * as fromDiscipline from './redux/index';
import { EffectsModule } from '@ngrx/effects';
import { DisciplineSelectComponent } from './discipline-select/discipline-select.component';
import { DisciplineEffects } from './redux/discipline.effects';

@NgModule({
  declarations: [DisciplineSelectComponent],
  imports: [
    SharedModule,
    StoreModule.forFeature('discipline', fromDiscipline.reducers),
    EffectsModule.forFeature([DisciplineEffects]),
  ],
  providers: [],
  exports: [DisciplineSelectComponent],
})
export class DisciplineModule {}
