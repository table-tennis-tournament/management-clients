import { touchesAny, UpdateClientConfig } from '../shared/update-events/update-events';
import { Table } from './tt-table/table.model';

/** The tablemanager reloads one thing: the tables of the displayed table manager. */
export type TablemanagerReloadTarget = 'tables';

/** Events that change a match on a table; they only concern the manager owning that table. */
const TABLE_SCOPED_EVENTS = [
  'MATCH_ASSIGNED',
  'MATCH_STARTED',
  'MATCH_RESULT_UPDATED',
  'MATCH_COMPLETED',
  'MATCH_FREED',
  'MATCH_TAKEN_BACK',
  'MATCH_CALLED',
  'MATCH_DELETED',
];

/**
 * The tablemanager's update events: it renders the `tables` and `matches` Topics, and an event
 * only matters when its scope names one of the [displayedTables]. Before the tables are loaded
 * (or when they carry no usable id) every event is relevant, because reloading is safe.
 */
export function tablemanagerUpdates(displayedTables: () => Table[]): UpdateClientConfig<TablemanagerReloadTarget> {
  return {
    topics: ['tables', 'matches'],
    reloads: Object.fromEntries(TABLE_SCOPED_EVENTS.map((type) => [type, ['tables']])),
    // table locks are not rendered by the tablemanager
    ignored: ['TABLE_LOCKED', 'TABLE_UNLOCKED'],
    resync: ['tables'],
    isRelevant: (_target, scope) => {
      const displayedIds = displayedTables()
        .filter((table) => table.table_id != null)
        .map((table) => table.table_id)
        .filter((id) => !Number.isNaN(id));
      return displayedIds.length === 0 || touchesAny(scope.tableIds, displayedIds);
    },
  };
}
