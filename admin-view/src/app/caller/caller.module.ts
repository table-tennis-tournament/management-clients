import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { CallerPageComponent } from './caller.page.component';
import { RefereesListComponent } from './referees-list/referees-list.component';
import { PlayerCallsComponent } from './player-calls/player-calls.component';
import { CallerMatchDetailComponent } from './caller-match-detail/caller-match-detail.component';
import { CallerMatchListComponent } from './caller-match-list/caller-match-list.component';

const components = [
  CallerPageComponent,
  RefereesListComponent,
  PlayerCallsComponent,
  CallerMatchDetailComponent,
  CallerMatchListComponent,
];

@NgModule({
  imports: [SharedModule],
  exports: [CallerPageComponent],
  declarations: [...components],
})
export class CallerModule {}
