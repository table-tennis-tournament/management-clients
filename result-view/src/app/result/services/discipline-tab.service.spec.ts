import { describe, expect, it } from 'vitest';
import { Match } from '../data/match';
import { DisciplineTabService } from './discipline-tab.service';

describe('the discipline tab service of the result view', () => {
  const service = new DisciplineTabService();
  const player = (id: number) => ({ id, firstName: `F${id}`, lastName: `L${id}` });
  const groupMatch = (id: number, groupId: number, p1: number, p2: number, state: Match['state'] = 'Open'): Match => ({
    id,
    playGroup: { id: groupId, name: String.fromCharCode(64 + groupId) },
    matchType: { id: 9, name: 'Gruppenspiel' },
    team1: [player(p1)],
    team2: [player(p2)],
    state,
  });
  const koMatch = (id: number, stage: string, state: Match['state']): Match => ({
    id,
    matchType: { id: 1, name: stage },
    team1: [player(id)],
    team2: [player(id + 50)],
    state,
  });

  it('makes an empty tab without matches', () => {
    expect(service.getTabForMatches([])).toEqual({ groups: [], stages: [] });
    expect(service.getTabForMatches(null)).toEqual({ groups: [], stages: [] });
  });

  it('collects the groups by id with their players once and whether they are over, in any order of the matches', () => {
    const matches = [
      groupMatch(1, 2, 1, 2, 'Completed'),
      groupMatch(2, 1, 3, 4),
      groupMatch(3, 2, 1, 5, 'Walkover'),
      groupMatch(4, 1, 3, 6, 'Completed'),
    ];

    expect(service.getTabForMatches(matches).groups).toEqual([
      {
        id: 1,
        name: 'Gruppe A',
        isComplete: false,
        isMatchActive: true,
        isPlayerActive: true,
        players: [player(3), player(4), player(6)],
        matches: [matches[1], matches[3]],
      },
      {
        id: 2,
        name: 'Gruppe B',
        isComplete: true,
        isMatchActive: true,
        isPlayerActive: true,
        players: [player(1), player(2), player(5)],
        matches: [matches[0], matches[2]],
      },
    ]);
  });

  it('collects the knockout matches per stage in the order the stages first appear', () => {
    const matches = [
      koMatch(1, 'Halbfinale', 'Completed'),
      koMatch(2, 'Finale', 'Open'),
      koMatch(3, 'Halbfinale', 'Finished'),
    ];

    expect(service.getTabForMatches(matches).stages).toEqual([
      { name: 'Halbfinale', isComplete: true, matches: [matches[0], matches[2]] },
      { name: 'Finale', isComplete: false, matches: [matches[1]] },
    ]);
  });

  describe('the standings of the groups', () => {
    const row = (sideId: number, position: number) => ({
      sideId,
      position,
      matchesWon: 3 - position,
      matchesLost: position - 1,
      setsWon: 0,
      setsLost: 0,
      pointsWon: 0,
      pointsLost: 0,
    });
    const doubles = (id: number, side1: number, side2: number, team1: number[], team2: number[]): Match => ({
      ...groupMatch(id, 1, 0, 0),
      team1: team1.map(player),
      team2: team2.map(player),
      side1Id: side1,
      side2Id: side2,
    });

    it('names each side by the players of its matches, by place', () => {
      const matches = [doubles(1, 100001, 100002, [1, 2], [3, 4]), doubles(2, 100003, 100001, [5, 6], [1, 2])];
      const [group] = service.getTabForMatches(matches).groups;

      const [withStandings] = service.withStandings(
        [group],
        [{ groupId: 1, rows: [row(100001, 1), row(100003, 2), row(100002, 3)] }]
      );

      expect(withStandings.standings.map((line) => [line.position, line.players.map((p) => p.id)])).toEqual([
        [1, [1, 2]],
        [2, [5, 6]],
        [3, [3, 4]],
      ]);
      expect(withStandings.matches).toBe(group.matches);
    });

    it('leaves out a side without a match in the group, and a group without standings gets none', () => {
      const matches = [
        { ...groupMatch(1, 1, 1, 2), side1Id: 1, side2Id: 2 },
        { ...groupMatch(2, 2, 3, 4), side1Id: 3, side2Id: 4 },
      ];
      const groups = service.getTabForMatches(matches).groups;

      const result = service.withStandings(groups, [{ groupId: 1, rows: [row(1, 1), row(9, 2)] }]);

      expect(result.map((g) => [g.name, g.standings.map((line) => line.sideId)])).toEqual([
        ['Gruppe A', [1]],
        ['Gruppe B', []],
      ]);
    });
  });
});
