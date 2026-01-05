import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'toma-assign-match.page',
  templateUrl: './assign-match.page.component.html',
  standalone: false,
})
export class AssignMatchPageComponent implements OnInit {
  matches: Observable<Match[]>;
  matchesLoading: Observable<boolean>;
  matchList: Observable<MatchList[]>;
  disciplines: Observable<Discipline[]>;
  typeColors: Observable<TypeColorMap>;

  constructor(private store: Store<any>) {}

  ngOnInit() {
    this.matches = this.store.select(getMatchesState);
    this.matchesLoading = this.store.select(getMatchesLoading);
    this.matchList = this.store.select(getMatchListState);
    this.disciplines = this.store.select(getDisciplineState);
    this.typeColors = this.store.select(getTypeColorsMapState);
  }

  onDisciplineRefresh(disciplineId: number) {
    if (disciplineId === -1) {
      this.store.dispatch(new LoadMatchList(null));
      return;
    }
    this.store.dispatch(new LoadMatches(null));
  }
}
