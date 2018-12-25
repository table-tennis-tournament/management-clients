import {Component, ComponentRef, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {getDisciplineState, getMatchesLoading, getMatchesState, getMatchListState, getTypeColorsState} from '../app-state.reducer';
import {Match} from '../shared/data/match.model';
import {Observable} from 'rxjs';
import {MatchList} from './matchlist.model';
import {Discipline} from '../discipline/discipline.model';
import {LoadDiscipline} from '../discipline/redux/discipline.actions';
import {LoadMatches, ReloadMatches} from '../assign/redux/match.actions';
import {AssignToMatchList, DeleteMatchListItem, LoadMatchList, MoveMatchListItem} from './redux/matchlist.actions';
import {MzModalService} from 'ngx-materialize';
import {ResultModalComponent} from '../table/table-list/result-modal/result-modal.component';
import {ResultForMatch} from '../table/redux/table.actions';

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
    private colors: string[];
    currentColor: string;

    constructor(private store: Store<any>, private modalService: MzModalService) {
    }

    ngOnInit() {
        this.matches = this.store.select(getMatchesState);
        this.matchesLoading = this.store.select(getMatchesLoading);
        this.matchList = this.store.select(getMatchListState);
        this.disciplines = this.store.select(getDisciplineState);
        this.typeColor = this.store.select(getTypeColorsState);
        this.typeColor.subscribe(color => this.colors = color);
    }

    onSupervisorRefresh() {
        this.store.dispatch(new LoadDiscipline(null));
        this.store.dispatch(new LoadMatches(null));
        this.store.dispatch(new LoadMatchList(null));
    }

    onSyncMatches() {
        this.store.dispatch(new ReloadMatches());
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

    onResultForMatch(match: Match) {
        const dialog: ComponentRef<ResultModalComponent> =
            <ComponentRef<ResultModalComponent>>this.modalService.open(ResultModalComponent);
        dialog.instance.currentMatch = match;
        dialog.instance.OnResultForMatch.subscribe(matchResult => this.store.dispatch(new ResultForMatch(matchResult)));
        return;
    }

    onSelectedDisciplineChanged(selectedDisciplineId: number) {
        if (this.colors != null) {
            this.currentColor = this.colors[selectedDisciplineId];
        }
    }

}
