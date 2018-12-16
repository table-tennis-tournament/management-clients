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

    isMatchInWaitingList() {
        return this.match.state === MatchState[MatchState.InWaitingList];
    }

    isMatchFinished() {
        return this.match.state === MatchState[MatchState.Finished];
    }

}
