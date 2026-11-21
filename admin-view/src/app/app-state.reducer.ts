import * as fromRouter from '@ngrx/router-store';
import { ActionReducerMap, createSelector, MetaReducer } from '@ngrx/store';

import { storeFreeze } from 'ngrx-store-freeze';
import * as fromTables from './table/redux/table.reducer';
import * as fromMatches from './assign/redux/match.reducer';
import * as fromMatchList from './supervisor/redux/matchlist.reducer';
import * as fromSettings from './settings/redux/settings.reducer';
import * as fromCaller from './caller/redux/caller.reducer';
import * as fromResult from './result/redux/result.reducer';
import { environment } from '../environments/environment';
import { Match } from './shared/data/match.model';
import { MatchList } from './supervisor/matchlist.model';

export interface State {
  router: fromRouter.RouterReducerState;
  table: fromTables.TableState;
  matches: fromMatches.MatchesState;
  matchList: fromMatchList.MatchListState;
  settings: fromSettings.SettingsState;
  caller: fromCaller.CallerState;
  result: fromResult.ResultState;
}

export const reducers: ActionReducerMap<State> = {
  table: fromTables.reduceTableState,
  router: fromRouter.routerReducer,
  matches: fromMatches.reduceMatchState,
  matchList: fromMatchList.reduceMatchListState,
  settings: fromSettings.reduceSettingsState,
  caller: fromCaller.reduceCallerState,
  result: fromResult.reduceResultState,
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [storeFreeze] : [];

export const getTableState = createSelector((state: State) => state.table, fromTables.getTables);
export const getTablesLoading = createSelector((state: State) => state.table, fromTables.getTablesLoading);

export const getMatchesState = createSelector((state: State) => state.matches, fromMatches.getMatches);
export const getMatchesLoading = createSelector((state: State) => state.matches, fromMatches.getMatchesLoading);

const getMatchListEntries = createSelector((state: State) => state.matchList, fromMatchList.getMatchList);

/**
 * The queue with the matches of each entry resolved from the matches state. Entries whose
 * matches are not (yet) loaded are left out, as every queue view renders the entry's first match.
 */
export const getMatchListState = createSelector(
  getMatchListEntries,
  getMatchesState,
  (entries: MatchList[], matches: Match[]): MatchList[] => {
    const matchesById = new Map((matches ?? []).map((match) => [match.id, match]));
    return (entries ?? [])
      .map((entry) => ({
        ...entry,
        matchinfo: (entry.matchListItem?.matchIds ?? []).map((id) => matchesById.get(id)).filter((match) => !!match),
      }))
      .filter((entry) => entry.matchinfo.length > 0);
  }
);
export const getMatchListLoading = createSelector((state: State) => state.matchList, fromMatchList.getMatchListLoading);
export const getSelectedDiscipline = createSelector(
  (state: State) => state.matchList,
  fromMatchList.getSelectedDiscipline
);

export const getResultMatchesState = createSelector((state: State) => state.result, fromResult.getResultMatches);
export const getResultMatchesLoading = createSelector(
  (state: State) => state.result,
  fromResult.getResultMatchesLoading
);

export const getSettingsState = createSelector((state: State) => state.settings, fromSettings.getSettings);
export const getSettingsLoading = createSelector((state: State) => state.settings, fromSettings.getSettingsLoading);
export const getTypeColorsMapState = createSelector((state: State) => state.settings, fromSettings.getTypeColors);
export const getPrintersState = createSelector((state: State) => state.settings, fromSettings.getPrinters);

export const getRefereesState = createSelector((state: State) => state.caller, fromCaller.getReferees);
export const getRefereesLoading = createSelector((state: State) => state.caller, fromCaller.getRefereesLoading);
export const getCallerMatchAggregateState = createSelector(
  (state: State) => state.caller,
  fromCaller.getCallerMatchAggregates
);
export const getSelectedMatchAggregateState = createSelector(
  (state: State) => state.caller,
  fromCaller.getSelectedMatchAggregate
);
export const getSelectedSecondCallMatchAggregateState = createSelector(
  (state: State) => state.caller,
  fromCaller.getSelectedSecondCallMatchAggregate
);
export const getSecondCallMatchesState = createSelector(
  (state: State) => state.caller,
  fromCaller.getSecondCallMatchAggregates
);
export const getThirdCallMatchesState = createSelector(
  (state: State) => state.caller,
  fromCaller.getThirdCallMatchAggregates
);
