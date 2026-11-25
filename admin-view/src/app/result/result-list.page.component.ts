import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import { getResultMatchesLoading, getResultMatchesState } from '../app-state.reducer';

import { Observable } from 'rxjs';

import { Match } from '../shared/data/match.model';

import { Discipline } from '../discipline/discipline.model';

import { ResultForMatch, TakeBackTable } from '../table/redux/table.actions';

import { ResultModalComponent } from '../table/table-list/result-modal/result-modal.component';

import { LoadResults } from './redux/result.actions';

import { getDisciplineLoading, getDisciplineState } from '../discipline/redux';

import { MatDialog } from '@angular/material/dialog';

import { ResultListComponent } from './result-list/result-list.component';

import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'toma-result-list-page',
  templateUrl: './result-list.page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ResultListComponent, AsyncPipe],
})
export class ResultListPageComponent implements OnInit {
  private store = inject<Store<any>>(Store);
  dialog = inject(MatDialog);

  matches: Observable<Match[]> = this.store.select(getResultMatchesState);
  matchesLoading: Observable<boolean> = this.store.select(getResultMatchesLoading);
  disciplines: Observable<Discipline[]> = this.store.select(getDisciplineState);
  disciplinesLoading: Observable<boolean> = this.store.select(getDisciplineLoading);

  ngOnInit() {
    this.store.dispatch(new LoadResults({}));
  }

  onTakeBackMatch(match: Match) {
    this.store.dispatch(new TakeBackTable({ matchIds: [match.id] }));
  }

  onResultForMatch(match: Match) {
    const dialogRef = this.dialog.open(ResultModalComponent, {
      width: '500px',
      data: { match },
    });

    dialogRef.afterClosed().subscribe((matchResult) => {
      if (matchResult) {
        this.store.dispatch(new ResultForMatch(matchResult));
      }
    });
  }

  onResultCompleteForMatch(matchResult: any) {
    this.store.dispatch(new ResultForMatch(matchResult));
  }

  onRefreshResultList() {
    this.store.dispatch(new LoadResults({}));
  }
}
