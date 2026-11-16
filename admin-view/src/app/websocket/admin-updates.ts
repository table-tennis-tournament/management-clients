import { Action } from '@ngrx/store';
import { LoadMatches } from '../assign/redux/match.actions';
import { LoadCallerMatches, LoadSecondCallMatches, LoadThirdCallMatches } from '../caller/redux/caller.actions';
import { LoadDiscipline } from '../discipline/redux/discipline.actions';
import { LoadPlayers } from '../player/redux/player.actions';
import { LoadResults } from '../result/redux/result.actions';
import { LoadTypeColors } from '../settings/redux/settings.actions';
import { touches, UpdateClientConfig } from '../shared/update-events/update-events';
import { LoadMatchList } from '../supervisor/redux/matchlist.actions';
import { LoadTables } from '../table/redux/table.actions';

/** The pieces of state admin-view can reload. */
export type AdminReloadTarget =
  | 'matches'
  | 'tables'
  | 'caller'
  | 'secondCall'
  | 'thirdCall'
  | 'results'
  | 'matchList'
  | 'discipline'
  | 'players'
  | 'typeColors';

/** Events that can change a match, the tables, the call lists and the results. */
const MATCH_CHANGED: AdminReloadTarget[] = ['matches', 'tables', 'caller', 'secondCall', 'thirdCall', 'results'];

/** Targets that only show matches at a table: an event whose scope names no table leaves them as they are. */
const AT_TABLE_TARGETS: AdminReloadTarget[] = ['tables', 'caller', 'secondCall', 'thirdCall'];

/** admin-view renders every area of the tournament, so it listens to all five Topics. */
export const ADMIN_UPDATES: UpdateClientConfig<AdminReloadTarget> = {
  topics: ['matches', 'tables', 'queue', 'players', 'settings'],
  reloads: {
    MATCH_ASSIGNED: MATCH_CHANGED,
    MATCH_STARTED: MATCH_CHANGED,
    MATCH_RESULT_UPDATED: MATCH_CHANGED,
    MATCH_COMPLETED: MATCH_CHANGED,
    MATCH_FREED: MATCH_CHANGED,
    MATCH_TAKEN_BACK: MATCH_CHANGED,
    MATCH_DELETED: MATCH_CHANGED,
    MATCH_CALLED: ['caller', 'secondCall', 'thirdCall'],
    TABLE_LOCKED: ['tables'],
    TABLE_UNLOCKED: ['tables'],
    MATCH_LIST_CHANGED: ['matchList', 'matches'],
    PLAYER_REGISTERED: ['discipline', 'players'],
    PLAYER_UNREGISTERED: ['discipline', 'players'],
    PLAYER_PAID: ['players'],
    PLAYER_ACTIVE_CHANGED: ['players', 'discipline'],
    DISCIPLINE_COLORS_CHANGED: ['typeColors'],
  },
  // everything the AppComponent loads on start
  resync: [
    'typeColors',
    'discipline',
    'matches',
    'tables',
    'matchList',
    'caller',
    'secondCall',
    'thirdCall',
    'results',
  ],
  isRelevant: (target, scope) => !AT_TABLE_TARGETS.includes(target) || touches(scope.tableIds),
};

/** The action that reloads [target]. */
export function reloadAction(target: AdminReloadTarget): Action {
  switch (target) {
    case 'matches':
      return new LoadMatches(null);
    case 'tables':
      return new LoadTables(null);
    case 'caller':
      return new LoadCallerMatches();
    case 'secondCall':
      return new LoadSecondCallMatches();
    case 'thirdCall':
      return new LoadThirdCallMatches();
    case 'results':
      return new LoadResults(null);
    case 'matchList':
      return new LoadMatchList(null);
    case 'discipline':
      return new LoadDiscipline(null);
    case 'players':
      return new LoadPlayers(null);
    case 'typeColors':
      return new LoadTypeColors();
  }
}
