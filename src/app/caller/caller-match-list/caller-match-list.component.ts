import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Match} from '../../shared/data/match.model';
import {MatchAggregate} from '../../shared/data/match.aggregate';
import {MatchAggregateService} from '../../shared/match-aggregate.service';
import {MatchState} from '../../shared/data/matchstate.model';

@Component({
    selector: 'toma-caller-match-list',
    templateUrl: './caller-match-list.component.html',
    styleUrls: ['./caller-match-list.component.scss']
})
export class CallerMatchListComponent {

    _matches: Match[] = [];
    matchAggregates: MatchAggregate[];

    constructor(private matchAggregateService: MatchAggregateService) {
    }

    @Input()
    set matches(value: Match[]) {
        this._matches = value;
        this.matchAggregates = this.matchAggregateService
            .getMatchAggregateForMatches(this.matches
                .filter(match => match.state === MatchState[MatchState.Callable]));
        if (this.matchAggregates.length > 0) {
            this.matchesSelected.emit(this.matchAggregates[0]);
        }
    }

    get matches() {
        return this._matches;
    }

    @Input()
    typeColor: string[];

    @Input()
    matchesLoading: boolean;

    @Output()
    matchesSelected: EventEmitter<MatchAggregate> = new EventEmitter<MatchAggregate>();

}
