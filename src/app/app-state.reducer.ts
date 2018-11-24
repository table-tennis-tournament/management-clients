import * as fromRouter from '@ngrx/router-store';
import {ActionReducerMap, createSelector, MetaReducer} from '@ngrx/store';

import {storeFreeze} from 'ngrx-store-freeze';
import * as fromTables from './table/redux/table.reducer';
import * as fromMatches from './assign/redux/match.reducer';
import * as fromMatchList from './supervisor/redux/matchlist.reducer';
import {environment} from '../environments/environment';

export interface State {
    router: fromRouter.RouterReducerState;
    table: fromTables.TableState;
    matches: fromMatches.MatchesState;
    matchList: fromMatchList.MatchListState;
}

export const reducers: ActionReducerMap<State> = {
    table: fromTables.reduceTableState,
    router: fromRouter.routerReducer,
    matches: fromMatches.reduceMatchState,
    matchList: fromMatchList.reduceMatchListState
};

export const metaReducers: MetaReducer<State>[] = !environment.production
    ? [storeFreeze]
    : [];

export const getTableState = createSelector((state: State) => state.table, fromTables.getTables);
export const getTablesLoading = createSelector((state: State) => state.table, fromTables.getTablesLoading);

export const getMatchesState = createSelector((state: State) => state.matches, fromMatches.getMatches);
export const getMatchesLoading = createSelector((state: State) => state.matches, fromMatches.getMatchesLoading);

export const getMatchListState = createSelector((state: State) => state.matchList, fromMatchList.getMatchList);
export const getMatchListLoading = createSelector((state: State) => state.matchList, fromMatchList.getMatchListLoading);
