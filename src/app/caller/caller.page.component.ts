import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Match} from '../shared/data/match.model';
import {Store} from '@ngrx/store';
import {
    getMatchesLoading,
    getMatchesState,
    getRefereesLoading,
    getRefereesState,
    getSelectedMatchAggregateState,
    getTypeColorsState
} from '../app-state.reducer';
import {MatchAggregate} from '../shared/data/match.aggregate';
import {Player} from '../shared/data/player.model';
import {CallMatch, SetSelectedMatchAggregate} from './redux/caller.actions';
import {MatchState} from '../shared/data/matchstate.model';
import {MatchAggregateService} from '../shared/match-aggregate.service';

@Component({
    selector: 'toma-caller-page',
    templateUrl: './caller.page.component.html'
})
export class CallerPageComponent implements OnInit {

    matches: Observable<Match[]>;
    selectedItem: Observable<MatchAggregate>;
    typeColor: Observable<string[]>;
    matchesLoading: Observable<boolean>;
    referees: Observable<Player[]>;
    refereesLoading: Observable<boolean>;
    matchAggregates: MatchAggregate[];

    constructor(private store: Store<any>, private matchAggregateService: MatchAggregateService) {
    }

    ngOnInit() {
        this.matches = this.store.select(getMatchesState);
        this.matches.subscribe(this.onMatchesLoaded.bind(this));
        this.matchesLoading = this.store.select(getMatchesLoading);
        this.typeColor = this.store.select(getTypeColorsState);
        this.refereesLoading = this.store.select(getRefereesLoading);
        this.referees = this.store.select(getRefereesState);
        this.selectedItem = this.store.select(getSelectedMatchAggregateState);
    }

    onMatchesSelected(selectedItem: MatchAggregate) {
        this.store.dispatch(new SetSelectedMatchAggregate(selectedItem));
    }

    onMatchesLoaded(matches: Match[]) {
        this.matchAggregates = this.matchAggregateService
            .getMatchAggregateForMatches(matches
                .filter(match => match.state === MatchState[MatchState.Callable]));
        const selectedAggregate = this.matchAggregates[0] || null;
        this.store.dispatch(new SetSelectedMatchAggregate(selectedAggregate));
    }

    onMatchCalled(matchIds: number[]) {
        this.store.dispatch(new CallMatch(matchIds));
    }

}
