import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {getCallerMatchAggregateState, getRefereesLoading, getRefereesState, getTypeColorsState} from '../app-state.reducer';
import {MatchAggregate} from '../shared/data/match.aggregate';
import {Player} from '../shared/data/player.model';
import {CallMatch, LoadCallerMatches, SetSelectedMatchAggregate} from './redux/caller.actions';

@Component({
    selector: 'toma-caller-page',
    templateUrl: './caller.page.component.html'
})
export class CallerPageComponent implements OnInit {

    selectedItem: MatchAggregate;
    typeColor: Observable<string[]>;
    referees: Observable<Player[]>;
    refereesLoading: Observable<boolean>;
    matchAggregates: Observable<MatchAggregate[]>;

    constructor(private store: Store<any>) {
    }

    ngOnInit() {
        this.store.dispatch(new LoadCallerMatches());
        this.typeColor = this.store.select(getTypeColorsState);
        this.refereesLoading = this.store.select(getRefereesLoading);
        this.referees = this.store.select(getRefereesState);
        this.matchAggregates = this.store.select(getCallerMatchAggregateState);
        this.matchAggregates.subscribe(this.onMatchesLoaded.bind(this));
    }

    onMatchesLoaded(aggregates: MatchAggregate[]) {
        if (aggregates != null && aggregates.length > 0) {
            this.selectedItem = aggregates[0];
        }
    }

    onMatchesSelected(selectedItem: MatchAggregate) {
        this.store.dispatch(new SetSelectedMatchAggregate(selectedItem));
    }

    onMatchCalled(matchIds: number[]) {
        this.store.dispatch(new CallMatch(matchIds));
    }

}
