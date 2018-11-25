import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {getMatchesLoading, getMatchesState, getMatchListState} from '../app-state.reducer';
import {Match} from '../shared/data/match.model';
import {Observable} from 'rxjs';
import {MatchList} from './matchlist.model';

@Component({
    selector: 'toma-supervisor.page',
    templateUrl: './supervisor.page.component.html',
    styleUrls: ['./supervisor.page.component.scss']
})
export class SupervisorPageComponent implements OnInit {

    private matches: Observable<Match[]>;
    private matchesLoading: Observable<boolean>;
    private matchList: Observable<MatchList[]>;

    constructor(private store: Store<any>) {
    }

    ngOnInit() {
        this.matches = this.store.select(getMatchesState);
        this.matchesLoading = this.store.select(getMatchesLoading);
        this.matchList = this.store.select(getMatchListState);
    }

}
