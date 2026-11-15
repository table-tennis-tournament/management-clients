import { Component, Input } from '@angular/core';
import { Match } from '../../../../shared/data/match.model';
import {
  callNumber,
  isAtTable,
  isCompleted,
  isFinished,
  isQueued,
  isWaiting,
} from '../../../../shared/match-state/match-state';

@Component({
  selector: 'toma-discipline-stage-item',
  templateUrl: './discipline-stage-item.component.html',
  styleUrls: ['./discipline-stage-item.component.scss'],
  standalone: false,
})
export class DisciplineStageItemComponent {
  @Input()
  match: Match;

  isMatchComplete() {
    return isCompleted(this.match);
  }

  isMatchInWaitingList() {
    return isQueued(this.match);
  }

  /** At its table and waiting for the first Call ("A" badge). */
  isMatchCallable() {
    return isAtTable(this.match) && callNumber(this.match) === 0;
  }

  isMatchFinished() {
    return isFinished(this.match);
  }

  isMatchBlocked() {
    return isWaiting(this.match) && !this.match.isPlayable;
  }
}
