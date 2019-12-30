import * as fromRouter from '@ngrx/router-store';
import {ActionReducerMap, createSelector, MetaReducer} from '@ngrx/store';

import {storeFreeze} from 'ngrx-store-freeze';
import * as fromTables from './table/redux/table.reducer';
import * as fromMatches from './assign/redux/match.reducer';
import * as fromMatchList from './supervisor/redux/matchlist.reducer';
import * as fromDisciplines from './discipline/redux/discipline.reducer';
import * as fromSettings from './settings/redux/settings.reducer';
import * as fromWebSocket from './websocket/redux/websocket.reducer';
import * as fromCaller from './caller/redux/caller.reducer';
import * as fromResult from './result/redux/result.reducer';
import {environment} from '../environments/environment';

export interface State {
    router: fromRouter.RouterReducerState;
    table: fromTables.TableState;
    matches: fromMatches.MatchesState;
    matchList: fromMatchList.MatchListState;
    settings: fromSettings.SettingsState;
    websocket: fromWebSocket.WebSocketState;
    caller: fromCaller.CallerState;
    result: fromResult.ResultState;
}

export const reducers: ActionReducerMap<State> = {
    table: fromTables.reduceTableState,
    router: fromRouter.routerReducer,
    matches: fromMatches.reduceMatchState,
    matchList: fromMatchList.reduceMatchListState,
    settings: fromSettings.reduceSettingsState,
    websocket: fromWebSocket.reduceWebsocketState,
    caller: fromCaller.reduceCallerState,
    result: fromResult.reduceResultState
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
export const getSelectedDiscipline = createSelector((state: State) => state.matchList, fromMatchList.getSelectedDiscipline);

export const getResultMatchesState = createSelector((state: State) => state.result, fromResult.getResultMatches);
export const getResultMatchesLoading = createSelector((state: State) => state.result, fromResult.getResultMatchesLoading);

export const getSettingsState = createSelector((state: State) => state.settings, fromSettings.getSettings);
export const getSettingsLoading = createSelector((state: State) => state.settings, fromSettings.getSettingsLoading);
export const getTypeColorsState = createSelector((state: State) => state.settings, fromSettings.getTypeColor);
export const getPrintersState = createSelector((state: State) => state.settings, fromSettings.getPrinters);

export const getWebSocketState = createSelector((state: State) => state.websocket, fromWebSocket.getWebsocketConnectedState);

export const getRefereesState = createSelector((state: State) => state.caller, fromCaller.getReferees);
export const getRefereesLoading = createSelector((state: State) => state.caller, fromCaller.getRefereesLoading);
export const getCallerMatchAggregateState = createSelector((state: State) => state.caller, fromCaller.getCallerMatchAggregates);
export const getSelectedMatchAggregateState = createSelector((state: State) => state.caller, fromCaller.getSelectedMatchAggregate);
export const getSecondCallMatchesState = createSelector((state: State) => state.caller, fromCaller.getSecondCallMatchAggregates);
export const getThirdCallMatchesState = createSelector((state: State) => state.caller, fromCaller.getThirdCallMatchAggregates);

