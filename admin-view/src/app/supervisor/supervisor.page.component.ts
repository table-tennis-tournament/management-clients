import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  getMatchesLoading,
  getMatchesState,
  getMatchListState,
  getSelectedDiscipline,
  getTypeColorsMapState,
} from '../app-state.reducer';
import { TypeColorMap } from '../settings/settings.model';
import { Match } from '../shared/data/match.model';
import { Observable } from 'rxjs';
import { MatchList } from './matchlist.model';
import { Discipline } from '../discipline/discipline.model';
import { LoadDiscipline } from '../discipline/redux/discipline.actions';
import { LoadMatches, ReloadMatches } from '../assign/redux/match.actions';
import {
  AssignToMatchList,
  DeleteMatchListItem,
  LoadMatchList,
  MoveMatchListItem,
  SelectDiscipline,
} from './redux/matchlist.actions';
import { ResultModalComponent } from '../table/table-list/result-modal/result-modal.component';
import { ResultForMatch } from '../table/redux/table.actions';
import { getDisciplineState } from '../discipline/redux';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'toma-supervisor.page',
  templateUrl: './supervisor.page.component.html',
  styleUrls: ['./supervisor.page.component.scss'],
  standalone: false,
})
export class SupervisorPageComponent implements OnInit {
  matches: Observable<Match[]>;
  matchesLoading: Observable<boolean>;
  matchList: Observable<MatchList[]>;
  disciplines: Observable<Discipline[]>;
  typeColors: Observable<TypeColorMap>;
  selectedDiscipline: Observable<number>;
  private colors: TypeColorMap = {};
  currentColor: string;

  constructor(private store: Store<any>, public dialog: MatDialog) {}

  ngOnInit() {
    this.matches = this.store.select(getMatchesState);
    this.matchesLoading = this.store.select(getMatchesLoading);
    this.matchList = this.store.select(getMatchListState);
    this.disciplines = this.store.select(getDisciplineState);
    this.typeColors = this.store.select(getTypeColorsMapState);
    this.selectedDiscipline = this.store.select(getSelectedDiscipline);
    this.typeColors.subscribe((color) => (this.colors = color));
    this.selectedDiscipline.subscribe(this.changeColor.bind(this));
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
    const dialogRef = this.dialog.open(ResultModalComponent, {
      width: '250px',
      data: match,
    });

    dialogRef.afterClosed().subscribe((matchResult) => {
      console.log('The dialog was closed');
      this.store.dispatch(new ResultForMatch(matchResult));
    });
    return;
  }

  onSelectedDisciplineChanged(selectedDisciplineId: number) {
    this.store.dispatch(new SelectDiscipline(selectedDisciplineId));
  }

  changeColor(selectedDiscipline: number) {
    if (this.colors != null && this.colors[selectedDiscipline]) {
      const bgColor = this.colors[selectedDiscipline].bgColor;
      const textColor = this.colors[selectedDiscipline].textColor;
      this.currentColor = `background-color: ${bgColor}; color: ${textColor};`;
    }
  }
}
