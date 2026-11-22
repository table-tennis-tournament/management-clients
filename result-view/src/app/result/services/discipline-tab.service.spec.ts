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
        name: 'Gruppe A',
        isComplete: false,
        isMatchActive: true,
        isPlayerActive: true,
        players: [player(3), player(4), player(6)],
        matches: [matches[1], matches[3]],
      },
      {
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
});
