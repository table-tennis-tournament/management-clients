import {Component, ComponentRef, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {getDisciplineLoading, getDisciplineState, getResultMatchesLoading, getResultMatchesState} from '../app-state.reducer';
import {Observable} from 'rxjs';
import {Match} from '../shared/data/match.model';
import {Discipline} from '../discipline/discipline.model';
import {FreeTable, ResultForMatch, TakeBackTable} from '../table/redux/table.actions';
import {ResultModalComponent} from '../table/table-list/result-modal/result-modal.component';
import {MzModalService} from 'ngx-materialize';
import {LoadResults} from './redux/result.actions';

@Component({
    selector: 'toma-result-list-page',
    templateUrl: './result-list.page.component.html'
})
export class ResultListPageComponent implements OnInit {

    matches: Observable<Match[]>;
    matchesLoading: Observable<boolean>;
    disciplines: Observable<Discipline[]>;
    disciplinesLoading: Observable<boolean>;

    constructor(private store: Store<any>, private modalService: MzModalService) {
    }

    ngOnInit() {
        this.matches = this.store.select(getResultMatchesState);
        this.matchesLoading = this.store.select(getResultMatchesLoading);
        this.disciplines = this.store.select(getDisciplineState);
        this.disciplinesLoading = this.store.select(getDisciplineLoading);
        this.store.dispatch(new LoadResults({}));
    }

    onTakeBackMatch(match: Match) {
        this.store.dispatch(new TakeBackTable({matchIds: [match.id]}));
    }

    onResultForMatch(match: Match) {
        const dialog: ComponentRef<ResultModalComponent> =
            <ComponentRef<ResultModalComponent>>this.modalService.open(ResultModalComponent);
        dialog.instance.currentMatch = match;
        dialog.instance.OnResultForMatch.subscribe(matchResult => this.store.dispatch(new ResultForMatch(matchResult)));
    }

    onResultCompleteForMatch(matchResult: any) {
        this.store.dispatch(new ResultForMatch(matchResult));
    }

    onRefreshResultList() {
        this.store.dispatch(new LoadResults({}));
    }
}
