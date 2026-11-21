import { Match } from '../shared/data/match.model';
import { canUseSecondTable, isOnTwoTables, matchesOnTwoTables } from './table-actions';

const groupA = { id: 1, name: 'A' };
const match = (id: number, p1: number, p2: number, extra: Partial<Match> = {}): Match => ({
  id,
  playGroup: groupA,
  team1: [{ id: p1 }],
  team2: [{ id: p2 }],
  ...extra,
});
// a group of four players: 1 to 4
const groupOfFour = [match(1, 1, 2), match(2, 3, 4), match(3, 1, 3)];

describe('the table actions', () => {
  it('a match is on two tables once it has a second table', () => {
    expect(isOnTwoTables(match(1, 1, 2))).toBe(false);
    expect(isOnTwoTables(match(1, 1, 2, { secondTableId: 12 }))).toBe(true);
  });

  it('"Entfernen" lists only the matches on two tables', () => {
    const table = { matches: [match(1, 1, 2, { secondTableId: 12 }), match(2, 3, 4)] };
    expect(matchesOnTwoTables(table).map((m) => m.id)).toEqual([1]);
    expect(matchesOnTwoTables({ matches: [match(2, 3, 4)] })).toEqual([]);
  });

  it('"2.Tisch" for a group of four players', () => {
    expect(canUseSecondTable({ matches: groupOfFour })).toBe(true);
  });

  it('no "2.Tisch" for a group of three players', () => {
    expect(canUseSecondTable({ matches: [match(1, 1, 2), match(2, 2, 3), match(3, 1, 3)] })).toBe(false);
  });

  it('no "2.Tisch" for a single match, matches of several groups or a group already on two tables', () => {
    expect(canUseSecondTable({ matches: [match(1, 1, 2)] })).toBe(false);
    expect(canUseSecondTable({ matches: [...groupOfFour, match(4, 5, 6, { playGroup: { id: 2 } })] })).toBe(false);
    expect(canUseSecondTable({ matches: [match(1, 1, 2, { playGroup: undefined }), match(2, 3, 4)] })).toBe(false);
    expect(canUseSecondTable({ matches: [...groupOfFour, match(4, 2, 4, { secondTableId: 12 })] })).toBe(false);
    expect(canUseSecondTable({ matches: [] })).toBe(false);
  });
});
