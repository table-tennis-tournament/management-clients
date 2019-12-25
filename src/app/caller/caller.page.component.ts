import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {
    getCallerMatchAggregateState,
    getRefereesLoading,
    getSecondCallMatchesState,
    getThirdCallMatchesState,
    getTypeColorsState
} from '../app-state.reducer';
import {MatchAggregate} from '../shared/data/match.aggregate';
import {CallMatch, LoadCallerMatches, LoadSecondCallMatches, LoadThirdCallMatches, SetSelectedMatchAggregate} from './redux/caller.actions';
import {getSecondCallMatchAggregates, getThirdCallMatchAggregates} from './redux/caller.reducer';

@Component({
    selector: 'toma-caller-page',
    templateUrl: './caller.page.component.html'
})
export class CallerPageComponent implements OnInit {

    selectedItem: MatchAggregate;
    typeColor: Observable<string[]>;
    refereesLoading: Observable<boolean>;
    matchAggregates: Observable<MatchAggregate[]>;
    secondCalls: Observable<MatchAggregate[]>;
    thirdCalls: Observable<MatchAggregate[]>;

    constructor(private store: Store<any>) {
    }

    ngOnInit() {
        this.store.dispatch(new LoadCallerMatches());
        this.store.dispatch(new LoadSecondCallMatches());
        this.store.dispatch(new LoadThirdCallMatches());
        this.typeColor = this.store.select(getTypeColorsState);
        this.refereesLoading = this.store.select(getRefereesLoading);
        this.matchAggregates = this.store.select(getCallerMatchAggregateState);
        this.matchAggregates.subscribe(this.onMatchesLoaded.bind(this));
        this.secondCalls = this.store.select(getSecondCallMatchesState);
        this.thirdCalls = this.store.select(getThirdCallMatchesState);
    }

    onMatchesLoaded(aggregates: MatchAggregate[]) {
        if (aggregates != null && aggregates.length > 0) {
            this.selectedItem = aggregates[0];
        }
        if (aggregates !== null && aggregates.length === 0) {
            this.selectedItem = null;
        }
    }

    onMatchesSelected(selectedItem: MatchAggregate) {
        this.selectedItem = selectedItem;
        this.store.dispatch(new SetSelectedMatchAggregate(selectedItem));
    }

    onMatchCalled(matchIds: number[]) {
        this.store.dispatch(new CallMatch(matchIds));
    }

}
