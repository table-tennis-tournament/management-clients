import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Match} from '../shared/data/match.model';
import {Store} from '@ngrx/store';
import {LoadMatches} from './redux/match.actions';
import {getDisciplineState, getMatchesLoading, getMatchesState, getMatchListState, getTypeColorsState} from '../app-state.reducer';
import {LoadMatchList} from '../supervisor/redux/matchlist.actions';
import {MatchList} from '../supervisor/matchlist.model';
import {LoadDiscipline} from '../discipline/redux/discipline.actions';
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
        this.store.dispatch(new LoadMatches(null));
        this.store.dispatch(new LoadMatchList(null));
        this.store.dispatch(new LoadDiscipline(null));
        this.matches = this.store.select(getMatchesState);
        this.matchesLoading = this.store.select(getMatchesLoading);
        this.matchList = this.store.select(getMatchListState);
        this.disciplines = this.store.select(getDisciplineState);
        this.typeColor = this.store.select(getTypeColorsState);
    }

}
