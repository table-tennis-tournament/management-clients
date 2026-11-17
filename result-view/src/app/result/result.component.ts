import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DisciplineGroup } from './data/discipline.group';
import { DisciplineStage } from './data/discipline.stage';
import { DisciplineTab } from './data/discipline.tab';
import { Match } from './data/match';
import { Type } from './data/type';
import { TypeColors } from './data/typeColors';
import * as ResultActions from './redux/result.actions';
import { AppState, getGroups, getMatches, getSelectedTypeId, getStages, getTypes } from './redux/result.reducer';

@Component({
  standalone: false,
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements OnInit {
  public currentTabs: DisciplineTab[];
  public rowCount: number[];
  public selectedTab: DisciplineTab;
  private lineStageClass: string[] = ['first-stage-result', 'second-stage-result', 'third-stage-result'];
  public colors: string[];
  private changeTime = 15000;
  private currentIndex = 0;
  public isFixed = false;

  types$: Observable<Type[]>;
  matches$: Observable<Match[]>;
  stages$: Observable<DisciplineStage[]>;
  groups$: Observable<DisciplineGroup[]>;
  selectedTypeId$: Observable<number | null>;

  constructor(private store: Store<AppState>) {
    this.colors = TypeColors.TYPE_COLORS;
    this.types$ = store.pipe(select(getTypes));
    this.selectedTypeId$ = store.pipe(select(getSelectedTypeId));
    this.matches$ = store.pipe(select(getMatches));
    this.stages$ = store.pipe(select(getStages));
    this.groups$ = store.pipe(select(getGroups));
  }

  ngOnInit() {
    // the matches of the first discipline follow from loadTypesSuccess
    this.store.dispatch(ResultActions.loadTypes());
  }

  onTabSelected(selectedTab: Type) {
    this.store.dispatch(ResultActions.selectType({ typeId: selectedTab.id }));
  }

  onSubscribed() {
    console.log('ino it');
  }

  onIsFixedChanged() {
    this.startTimer();
  }

  private startTimer() {}

  getColor(currentType: Type, selectedTypeId: number | null) {
    return currentType.id === selectedTypeId ? 'warn' : 'accent';
  }
}
