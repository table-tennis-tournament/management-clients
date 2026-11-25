import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';

import { Observable } from 'rxjs';

import { Store } from '@ngrx/store';

import {
  getCallerMatchAggregateState,
  getRefereesLoading,
  getSecondCallMatchesState,
  getSelectedMatchAggregateState,
  getSelectedSecondCallMatchAggregateState,
  getThirdCallMatchesState,
  getTypeColorsMapState,
} from '../app-state.reducer';

import { MatchAggregate } from '../shared/data/match.aggregate';

import {
  CallMatch,
  LoadCallerMatches,
  LoadSecondCallMatches,
  LoadThirdCallMatches,
  SetSelectedMatchAggregate,
  SecondCallMatch,
  SetSelectedSecondCallMatchAggregate,
} from './redux/caller.actions';

import { TypeColorMap } from '../settings/settings.model';

import { CallerMatchListComponent } from './caller-match-list/caller-match-list.component';

import { CallerMatchDetailComponent } from './caller-match-detail/caller-match-detail.component';

import { SecondCallMatchDetailComponent } from './second-call-match-detail/second-call-match-detail.component';

import { PlayerCallsComponent } from './player-calls/player-calls.component';

import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'toma-caller-page',
  templateUrl: './caller.page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CallerMatchListComponent,
    CallerMatchDetailComponent,
    SecondCallMatchDetailComponent,
    PlayerCallsComponent,
    AsyncPipe,
  ],
})
export class CallerPageComponent implements OnInit {
  private store = inject<Store<any>>(Store);

  selectedItem: Observable<MatchAggregate | null> = this.store.select(getSelectedMatchAggregateState);
  selectedSecondCallItem: Observable<MatchAggregate | null> = this.store.select(
    getSelectedSecondCallMatchAggregateState
  );
  typeColors: Observable<TypeColorMap> = this.store.select(getTypeColorsMapState);
  refereesLoading: Observable<boolean> = this.store.select(getRefereesLoading);
  matchAggregates: Observable<MatchAggregate[]> = this.store.select(getCallerMatchAggregateState);
  secondCalls: Observable<MatchAggregate[]> = this.store.select(getSecondCallMatchesState);
  thirdCalls: Observable<MatchAggregate[]> = this.store.select(getThirdCallMatchesState);

  ngOnInit() {
    this.store.dispatch(new LoadCallerMatches());
    this.store.dispatch(new LoadSecondCallMatches());
    this.store.dispatch(new LoadThirdCallMatches());
    this.matchAggregates.subscribe(this.onMatchesLoaded.bind(this));
  }

  onMatchesLoaded(aggregates: MatchAggregate[]) {
    if (aggregates != null && aggregates.length > 0) {
      this.store.dispatch(new SetSelectedMatchAggregate(aggregates[0]));
    }
    if (aggregates !== null && aggregates.length === 0) {
      this.store.dispatch(new SetSelectedMatchAggregate(null));
    }
  }

  onMatchesSelected(selectedItem: MatchAggregate) {
    this.store.dispatch(new SetSelectedMatchAggregate(selectedItem));
  }

  onSecondCallMatchesSelected(selectedItem: MatchAggregate) {
    this.store.dispatch(new SetSelectedSecondCallMatchAggregate(selectedItem));
  }

  onMatchCalled(matchIds: number[]) {
    this.store.dispatch(new CallMatch(matchIds));
  }

  /** The caller announced the selected Second or Third call. */
  onSecondCallCalled(matchIds: number[]) {
    this.store.dispatch(new SecondCallMatch(matchIds));
  }
}
