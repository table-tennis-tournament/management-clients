import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Match} from '../shared/data/match.model';
import {Store} from '@ngrx/store';
import {getMatchesLoading, getMatchesState, getRefereesLoading, getRefereesState, getTypeColorsState} from '../app-state.reducer';
import {MatchAggregate} from '../shared/data/match.aggregate';
import {Player} from '../shared/data/player.model';
import {CallMatch} from './redux/caller.actions';

@Component({
    selector: 'toma-caller-page',
    templateUrl: './caller.page.component.html'
})
export class CallerPageComponent implements OnInit {

    matches: Observable<Match[]>;
    selectedItem: MatchAggregate = null;
    typeColor: Observable<string[]>;
    matchesLoading: Observable<boolean>;
    referees: Observable<Player[]>;
    refereesLoading: Observable<boolean>;

    constructor(private store: Store<any>) {
    }

    ngOnInit() {
        this.matches = this.store.select(getMatchesState);
        this.matchesLoading = this.store.select(getMatchesLoading);
        this.typeColor = this.store.select(getTypeColorsState);
        this.refereesLoading = this.store.select(getRefereesLoading);
        this.referees = this.store.select(getRefereesState);
    }

    onMatchesSelected(selectedItem: MatchAggregate) {
        this.selectedItem = selectedItem;
    }

    onMatchCalled(matchIds: number[]) {
        this.store.dispatch(new CallMatch(matchIds));
    }

}
