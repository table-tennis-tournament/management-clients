/*
 * Result entry: the Set and Match-winning rules and the shorthand result input.
 *
 * This file is copied verbatim into admin-view, tablemanager-view and result-view
 * (`src/app/shared/result-entry/`). Keep the copies identical; change all three together.
 *
 * Rules (see GLOSSARY.md): a Set is won with 11 Points and a lead of two (after 10:10 play
 * continues until one side leads by two); a Match is best of five, won by the first Side to
 * win three Sets.
 *
 * Shorthand input: one token per Set, separated by spaces. A token is the loser's Points;
 * a leading minus means Side 2 won the Set. `"5"` is 11:5, `"-5"` is 5:11, `"12"` is 14:12.
 */

/** The Points of one Set, in the shape the v2 backend sends in `Match.sets`. */
export interface SetScore {
  pointsPlayer1: number;
  pointsPlayer2: number;
}

/** Side 1 is `team1` / player A, Side 2 is `team2` / player B. */
export type Side = 1 | 2;

export interface SetsWon {
  player1: number;
  player2: number;
}

export const POINTS_TO_WIN_SET = 11;
export const SETS_TO_WIN_MATCH = 3;

/** The Set won by [winner] when the losing Side scored [loserPoints]. */
export function setWonBy(winner: Side, loserPoints: number): SetScore {
  const winnerPoints = loserPoints < POINTS_TO_WIN_SET - 1 ? POINTS_TO_WIN_SET : loserPoints + 2;
  return winner === 1
    ? { pointsPlayer1: winnerPoints, pointsPlayer2: loserPoints }
    : { pointsPlayer1: loserPoints, pointsPlayer2: winnerPoints };
}

/** Parses one shorthand token, or returns `null` if it is not a whole number of Points. */
export function parseSet(token: string): SetScore | null {
  const match = /^(-?)(\d+)$/.exec(token.trim());
  if (!match) {
    return null;
  }
  return setWonBy(match[1] === '-' ? 2 : 1, Number(match[2]));
}

/**
 * Parses the shorthand input into Sets. Blank input gives no Sets; any invalid token makes
 * the whole input invalid (`null`). The result may be incomplete (an interim result).
 */
export function parseResult(text: string | null | undefined): SetScore[] | null {
  const tokens = (text ?? '').split(/\s+/).filter((token) => token !== '');
  const sets: SetScore[] = [];
  for (const token of tokens) {
    const set = parseSet(token);
    if (set === null) {
      return null;
    }
    sets.push(set);
  }
  return sets;
}

/** Formats Sets back into shorthand input, the inverse of [parseResult]. */
export function formatResult(sets: SetScore[] | null | undefined): string {
  return (sets ?? []).map((set) => (setWinner(set) === 2 ? `-${set.pointsPlayer1}` : `${set.pointsPlayer2}`)).join(' ');
}

/** The Side that won the Set, or `null` for a Set that has not been won (e.g. 0:0). */
export function setWinner(set: SetScore): Side | null {
  if (set.pointsPlayer1 > set.pointsPlayer2) {
    return 1;
  }
  if (set.pointsPlayer2 > set.pointsPlayer1) {
    return 2;
  }
  return null;
}

/** Whether the Set's score is possible under the 11 Points / lead of two rule. */
export function isValidSet(set: SetScore): boolean {
  const high = Math.max(set.pointsPlayer1, set.pointsPlayer2);
  const low = Math.min(set.pointsPlayer1, set.pointsPlayer2);
  if (!Number.isInteger(low) || low < 0) {
    return false;
  }
  return high === POINTS_TO_WIN_SET ? low <= POINTS_TO_WIN_SET - 2 : high > POINTS_TO_WIN_SET && high - low === 2;
}

export function setsWon(sets: SetScore[] | null | undefined): SetsWon {
  const won: SetsWon = { player1: 0, player2: 0 };
  for (const set of sets ?? []) {
    const winner = setWinner(set);
    if (winner === 1) {
      won.player1++;
    } else if (winner === 2) {
      won.player2++;
    }
  }
  return won;
}

/** The Side that has won three Sets, or `null` while the Match is undecided. */
export function matchWinner(sets: SetScore[] | null | undefined): Side | null {
  const won = setsWon(sets);
  if (won.player1 === SETS_TO_WIN_MATCH && won.player2 < SETS_TO_WIN_MATCH) {
    return 1;
  }
  if (won.player2 === SETS_TO_WIN_MATCH && won.player1 < SETS_TO_WIN_MATCH) {
    return 2;
  }
  return null;
}

/**
 * Whether the Sets are a valid final result: every Set is valid and the last Set decided the
 * Match (no Sets are played after one Side has won three).
 */
export function isFinalResult(sets: SetScore[] | null | undefined): boolean {
  return !!sets && sets.every(isValidSet) && matchWinner(sets) !== null && matchWinner(sets.slice(0, -1)) === null;
}

/** The request body shape of `/api/v2/match/setResult` and `/updateResult`: `[[11, 5], …]`. */
export function toRequestBody(sets: SetScore[]): [number, number][] {
  return sets.map((set) => [set.pointsPlayer1, set.pointsPlayer2]);
}
