import { canBeCalledAgain, canRequestCall, playersOf } from './player-dialog.component';
import { Match } from '../../match/match.model';

const player = (id: number, calls: number) => ({ player_id: id, call_count: calls });

/** A match at a table, its first Call announced; player 2 had [player2Calls] calls. */
const called = (player2Calls = 1, requestedCallNumber: number | null = null): Match => ({
  match_id: 1,
  state: 'OnTable',
  callNumber: Math.max(1, player2Calls),
  requestedCallNumber,
  players_a: [player(1, 1)],
  players_b: [player(2, player2Calls)],
});

describe('requesting a call', () => {
  it('names the players of both Sides', () => {
    expect(playersOf(called()).map((p) => p.player_id)).toStrictEqual([1, 2]);
    expect(playersOf({ players_a: [], players_b: [] })).toStrictEqual([]);
  });

  it('calls a player again until the Third call', () => {
    expect(canBeCalledAgain(player(1, 1))).toBe(true);
    expect(canBeCalledAgain(player(1, 2))).toBe(true);
    expect(canBeCalledAgain(player(1, 3))).toBe(false);
  });

  it('is possible once the first Call is announced', () => {
    expect(canRequestCall(called())).toBe(true);
    expect(canRequestCall({ ...called(), callNumber: 0 })).toBe(false);
  });

  it('waits while a requested call is not announced', () => {
    expect(canRequestCall(called(1, 2))).toBe(false);
  });

  it('is still possible for the other player after one had the Third call', () => {
    expect(canRequestCall(called(3))).toBe(true);
    expect(canRequestCall({ ...called(3), players_a: [player(1, 3)] })).toBe(false);
  });
});
