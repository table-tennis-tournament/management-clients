import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Match} from '../shared/data/match.model';
import {Store} from '@ngrx/store';
import {getDisciplineState, getMatchesLoading, getMatchesState, getMatchListState, getTypeColorsState} from '../app-state.reducer';
import {MatchList} from '../supervisor/matchlist.model';
import {Discipline} from '../discipline/discipline.model';

@Component({
    selector: 'toma-assign-match.page',
    templateUrl: './assign-match.page.component.html'
})
export class AssignMatchPageComponent implements OnInit {

    matches: Observable<Match[]>;
    matchesLoading: Observable<boolean>;
    matchList: Observable<MatchList[]>;
    disciplines: Observable<Discipline[]>;
    typeColor: Observable<string[]>;

    constructor(private store: Store<any>) {
    }

    ngOnInit() {
        this.matches = this.store.select(getMatchesState);
        this.matchesLoading = this.store.select(getMatchesLoading);
        this.matchList = this.store.select(getMatchListState);
        this.disciplines = this.store.select(getDisciplineState);
        this.typeColor = this.store.select(getTypeColorsState);
    }

}
