import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Match} from '../shared/data/match.model';
import {Store} from '@ngrx/store';
import {LoadMatches} from './redux/match.actions';
import {getMatchesLoading, getMatchesState, getMatchListState} from '../app-state.reducer';
import {LoadMatchList} from '../supervisor/redux/matchlist.actions';
import {MatchList} from '../supervisor/matchlist.model';

@Component({
    selector: 'toma-assign-match.page',
    templateUrl: './assign-match.page.component.html'
})
export class AssignMatchPageComponent implements OnInit {

    matches: Observable<Match[]>;
    matchesLoading: Observable<boolean>;
    matchList: Observable<MatchList[]>;

    constructor(private store: Store<any>) {
    }

    ngOnInit() {
        this.store.dispatch(new LoadMatches(null));
        this.store.dispatch(new LoadMatchList(null));
        this.matches = this.store.select(getMatchesState);
        this.matchesLoading = this.store.select(getMatchesLoading);
        this.matchList = this.store.select(getMatchListState);
    }

}
