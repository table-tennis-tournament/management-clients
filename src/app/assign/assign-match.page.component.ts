import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Match} from '../shared/data/match.model';
import {Store} from '@ngrx/store';
import {LoadMatches} from './redux/match.actions';
import {getMatchesLoading, getMatchesState} from '../app-state.reducer';

@Component({
    selector: 'toma-assign-match.page',
    templateUrl: './assign-match.page.component.html'
})
export class AssignMatchPageComponent implements OnInit {

    matches: Observable<Match[]>;
    matchesLoading: Observable<boolean>;

    constructor(private store: Store<any>) {
    }

    ngOnInit() {
        this.store.dispatch(new LoadMatches(null));
        this.matches = this.store.select(getMatchesState);
        this.matchesLoading = this.store.select(getMatchesLoading);
    }

}
