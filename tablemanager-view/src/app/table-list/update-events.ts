import { UpdateTopic, WebsocketMessage } from '../services/websocket.service';
import { Table } from './tt-table/table.model';

/** The tablemanager renders the tables and the matches on them. */
export const TABLEMANAGER_TOPICS: UpdateTopic[] = ['tables', 'matches'];

/** Burst window: at most one reload per period, however many events arrive. */
export const RELOAD_AUDIT_MS = 200;

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

/** Events that are not rendered by the tablemanager. */
const IGNORED_EVENTS = ['TABLE_LOCKED', 'TABLE_UNLOCKED'];

export type EventRelevance = 'reload' | 'ignore' | 'unknown';

/**
 * Decides whether an update event requires a reload of the tables of the displayed table manager.
 *
 * Events whose scope names tables only matter when one of them is displayed. Without a scope
 * (or before the tables were loaded) the event is treated as relevant, because reloading is safe.
 */
export function relevanceOf(message: WebsocketMessage, displayedTables: Table[]): EventRelevance {
  if (IGNORED_EVENTS.includes(message.type)) {
    return 'ignore';
  }
  if (!TABLE_SCOPED_EVENTS.includes(message.type)) {
    return 'unknown';
  }
  const tableIds = message.scope?.tableIds;
  if (!tableIds) {
    return 'reload';
  }
  const displayedIds = displayedTables
    .filter((table) => table.table_id != null)
    .map((table) => Number(table.table_id))
    .filter((id) => !Number.isNaN(id));
  if (displayedIds.length === 0) {
    return 'reload';
  }
  return tableIds.some((id) => displayedIds.includes(Number(id))) ? 'reload' : 'ignore';
}
