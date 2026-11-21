import { Match } from '../shared/data/match.model';
import { TableDto } from './tabledto.model';

/** A group with at least this many players may play its matches on a second table. */
export const SECOND_TABLE_MIN_PLAYERS = 4;

/** Waits at two tables: it is started at one of them and then leaves the other. */
export function isOnTwoTables(match: Match): boolean {
  return match.secondTableId != null;
}

/** The matches of [table] that also wait at another table; "Entfernen" takes them off this one. */
export function matchesOnTwoTables(table: TableDto): Match[] {
  return (table?.matches ?? []).filter(isOnTwoTables);
}

/**
 * "2.Tisch": the matches at [table] are one group of at least four players,
 * so its upcoming matches may wait at a second table as well.
 */
export function canUseSecondTable(table: TableDto): boolean {
  const matches = table?.matches ?? [];
  if (matches.length < 2 || matches.some(isOnTwoTables)) {
    return false;
  }
  const groupId = matches[0].playGroup?.id;
  if (groupId == null || matches.some((match) => match.playGroup?.id !== groupId)) {
    return false;
  }
  const players = new Set(
    matches.flatMap((match) => [...(match.team1 ?? []), ...(match.team2 ?? [])]).map((player) => player.id)
  );
  return players.size >= SECOND_TABLE_MIN_PLAYERS;
}
