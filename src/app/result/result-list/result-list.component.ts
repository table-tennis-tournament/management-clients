import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Match} from '../../shared/data/match.model';
import {Discipline} from '../../discipline/discipline.model';
import {MatchState} from '../../shared/data/matchstate.model';

@Component({
    selector: 'toma-result-list',
    templateUrl: './result-list.component.html',
    styleUrls: ['./result-list.component.scss']
})
export class ResultListComponent {

    private _matches: Match[];
    private selectedDisciplineId = 0;

    @Input('matches')
    set matches(value: Match[]) {
        this._matches = value;
        this.onTypeChanged(this.selectedDisciplineId);
    }

    get matches() {
        return this._matches;
    }

    @Input()
    disciplines: Discipline[];

    @Output()
    takeBackMatch: EventEmitter<Match> = new EventEmitter<Match>();

    @Output()
    resultForMatch: EventEmitter<Match> = new EventEmitter<Match>();

    @Input()
    matchesLoading: boolean;

    selectedMatches: Match[];

    constructor() {
    }

    onTypeChanged(disciplineId) {
        this.selectedDisciplineId = disciplineId;
        if (disciplineId === 0) {
            this.selectedMatches = this.matches
                .filter(match => match.state === MatchState[MatchState.Finished]);
            return;
        }
        this.selectedMatches = this.matches
            .filter(match => match.type.id === disciplineId)
            .filter(match => match.state === MatchState[MatchState.Finished]);
    }

}
