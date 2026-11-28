import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Match } from '../shared/data/match.model';
import { Store } from '@ngrx/store';
import { getMatchesLoading, getMatchesState, getMatchListState, getTypeColorsMapState } from '../app-state.reducer';
import { MatchList } from '../supervisor/matchlist.model';
import { Discipline } from '../discipline/discipline.model';
import { LoadMatchList } from '../supervisor/redux/matchlist.actions';
import { LoadMatches } from './redux/match.actions';
import { getDisciplineState } from '../discipline/redux';
import { TypeColorMap } from '../settings/settings.model';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { DisciplineMatchListComponent } from './discipline-match-list/discipline-match-list.component';
import { TableListPageComponent } from '../table/table-list.page.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'toma-assign-match.page',
  templateUrl: './assign-match.page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CdkDropListGroup, DisciplineMatchListComponent, TableListPageComponent, AsyncPipe],
})
export class AssignMatchPageComponent {
  private store = inject<Store<any>>(Store);

  matches: Observable<Match[]> = this.store.select(getMatchesState);
  matchesLoading: Observable<boolean> = this.store.select(getMatchesLoading);
  matchList: Observable<MatchList[]> = this.store.select(getMatchListState);
  disciplines: Observable<Discipline[]> = this.store.select(getDisciplineState);
  typeColors: Observable<TypeColorMap> = this.store.select(getTypeColorsMapState);

  onDisciplineRefresh(disciplineId: number) {
    if (disciplineId === -1) {
      this.store.dispatch(new LoadMatchList(null));
      return;
    }
    this.store.dispatch(new LoadMatches(null));
  }
}
