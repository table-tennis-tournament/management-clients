import {Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import * as TableActions from './redux/table-list.actions';
import * as MatchActions from './match/redux/match.actions';
import {getTables, TablesState} from './redux/table-list.reducer';
import {Table} from './tt-table/table.model';

@Component({
    selector: 'app-table-list',
    templateUrl: './table-list.component.html',
    styleUrls: ['./table-list.component.sass']
})
export class TableListComponent implements OnInit {

    tables$: Observable<Table[]>;

    constructor(private store: Store<TablesState>) {
        this.tables$ = store.pipe(select(getTables));
    }

    ngOnInit() {
        this.store.dispatch(TableActions.loadTables({tableManagerId: 1}));
    }

    onUpdateMatchResult($event: any) {
        this.store.dispatch(MatchActions.updateMatchResult(100, {}))
    }
}
