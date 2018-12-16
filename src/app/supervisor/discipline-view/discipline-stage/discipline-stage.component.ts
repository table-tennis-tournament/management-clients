import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DisciplineStage} from '../models/discipline.stage.model';
import {Match} from '../../../shared/data/match.model';
import {MatchState} from '../../../shared/data/matchstate.model';

@Component({
    selector: 'toma-discipline-stage',
    templateUrl: './discipline-stage.component.html',
    styleUrls: ['./discipline-stage.component.scss']
})
export class DisciplineStageComponent {

    lineStageClass: string[] = [
        'first-stage',
        'second-stage',
        'third-stage',
        'fourth-stage',
    ];

    constructor() {
    }

    @Input()
    typeColor: string[];

    @Input()
    stage: DisciplineStage;

    @Input() index: number;

    @Output()
    resultForMatch: EventEmitter<Match> = new EventEmitter<Match>();

    @Output()
    deleteStage: EventEmitter<DisciplineStage> = new EventEmitter<DisciplineStage>();


    isInWaitingListOrOnTable(currentMatch: Match) {
        return currentMatch.state === MatchState[MatchState.InWaitingList] || currentMatch.table.length > 0;
    }

    isMatchOpen(currentMatch: Match) {
        return currentMatch.state === MatchState[MatchState.Open];
    }

}
