import {Component, Input} from '@angular/core';
import {Match} from '../../../../shared/data/match.model';
import {MatchState} from '../../../../shared/data/matchstate.model';

@Component({
    selector: 'toma-discipline-stage-item',
    templateUrl: './discipline-stage-item.component.html',
    styleUrls: ['./discipline-stage-item.component.scss']
})
export class DisciplineStageItemComponent {

    @Input()
    match: Match;

    isMatchComplete() {
        return this.match.state === MatchState[MatchState.Completed];
    }

    isMatchOpen() {
        return this.match.state === MatchState[MatchState.Open];
    }

    isMatchInWaitingList() {
        return this.match.state === MatchState[MatchState.InWaitingList];
    }

    isMatchCallable() {
        return this.match.state === MatchState[MatchState.Callable];
    }

    isMatchFinished() {
        return this.match.state === MatchState[MatchState.Finished];
    }

    isMatchBlocked() {
        return (this.isMatchInWaitingList() || this.isMatchOpen()) && !this.match.isPlayable;
    }

}
