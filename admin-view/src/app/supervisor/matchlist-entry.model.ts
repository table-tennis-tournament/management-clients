/** A Queue/MatchList entry as delivered by the v2 backend (`GET /api/v2/matchlist/all`). */
export interface MatchListEntry {
  uuid: string;
  matchIds: number[];
  asGroup?: number;
  position: number;
}
