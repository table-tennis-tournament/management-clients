import { Match } from '../../../shared/data/match.model';
import { SetScore } from '../../../shared/result-entry/result-entry';

export interface TTMatchResult {
  match: Match;
  result: SetScore[];
  /** The match was not played: a Side did not appear and the other wins with [result] ("kampflos"). */
  kampflos?: boolean;
}

/** What the result dialog is opened with. */
export interface ResultModalData {
  match: Match;
  /** Offers the kampflos checkbox; only the Assign view enters walkovers. */
  kampflosAllowed?: boolean;
}
