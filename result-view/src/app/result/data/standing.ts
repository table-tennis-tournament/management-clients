import { Player } from './player';

/** A row of `GET /groups/standings/{typeId}`: [sideId] is the match side id (`side1Id`/`side2Id`). */
export interface StandingRow {
  sideId: number;
  position: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  pointsWon: number;
  pointsLost: number;
}

export interface GroupStandings {
  groupId: number;
  rows: StandingRow[];
}

/** A shown row of a group's standings: the row and the players of its side. */
export interface StandingLine extends StandingRow {
  players: Player[];
}
