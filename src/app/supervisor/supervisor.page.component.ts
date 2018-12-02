import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {getDisciplineState, getMatchesLoading, getMatchesState, getMatchListState, getTypeColorsState} from '../app-state.reducer';
import {Match} from '../shared/data/match.model';
import {Observable} from 'rxjs';
import {MatchList} from './matchlist.model';
import {Discipline} from '../discipline/discipline.model';
import {LoadDiscipline} from '../discipline/redux/discipline.actions';
import {LoadMatches} from '../assign/redux/match.actions';
import {AssignToMatchList, DeleteMatchListItem, LoadMatchList, MoveMatchListItem} from './redux/matchlist.actions';

@Component({
    selector: 'toma-supervisor.page',
    templateUrl: './supervisor.page.component.html',
    styleUrls: ['./supervisor.page.component.scss']
})
export class SupervisorPageComponent implements OnInit {

    matches: Observable<Match[]>;
    matchesLoading: Observable<boolean>;
    matchList: Observable<MatchList[]>;
    disciplines: Observable<Discipline[]>;
    typeColor: Observable<string[]>;

    constructor(private store: Store<any>) {
    }

    ngOnInit() {
        this.store.dispatch(new LoadDiscipline(null));
        this.store.dispatch(new LoadMatches(null));
        this.store.dispatch(new LoadMatchList(null));
        this.matches = this.store.select(getMatchesState);
        this.matchesLoading = this.store.select(getMatchesLoading);
        this.matchList = this.store.select(getMatchListState);
        this.disciplines = this.store.select(getDisciplineState);
        this.typeColor = this.store.select(getTypeColorsState);
    }

    onMatchListItemDelete(event) {
        this.store.dispatch(new DeleteMatchListItem(event.matchListItem.id));
    }

    onAssignMatchListItem(event) {
        this.store.dispatch(new AssignToMatchList(event));
    }

    onMatchListItemMove(event) {
        this.store.dispatch(new MoveMatchListItem(event));
    }

}
