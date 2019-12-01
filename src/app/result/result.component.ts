import {Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {DisciplineTab} from './data/discipline.tab';
import {Type} from './data/type';
import {TypeColors} from './data/typeColors';
import * as ResultActions from './redux/result.actions';
import {AppState, getTypes} from './redux/result.reducer';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  public currentTabs: DisciplineTab[];
  public rowCount: number[];
  public selectedTab: DisciplineTab;
  private lineStageClass: string[] = [
    'first-stage-result',
    'second-stage-result',
    'third-stage-result'
  ];
  public colors: string[];
  private changeTime = 15000;
  private currentIndex = 0;
  public isFixed = false;

  types$: Observable<Type[]>;

  constructor(private store: Store<AppState>) {
    this.colors = TypeColors.TYPE_COLORS;
    this.types$ = store.pipe(select(getTypes));
  }

  ngOnInit() {
    this.store.dispatch(ResultActions.loadTypes({}));
  }

  onTabSelected(selectedTab: Type) {
    this.currentIndex = 0;
  }

  onSubscribed() {
    console.log('ino it');
  }

  onIsFixedChanged() {
    this.startTimer();
  }

  private startTimer() {

  }
}
