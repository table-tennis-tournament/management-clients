import { Match } from '../../shared/data/match.model';
import { DisciplineTabService } from './discipline-tab.service';

describe('the discipline tab service', () => {
  const service = new DisciplineTabService();
  const herren = { id: 1, name: 'Herren' };
  const player = (id: number) => ({ id, firstName: `F${id}`, lastName: `L${id}` });
  const groupMatch = (id: number, groupId: number, p1: number, p2: number, extra: Partial<Match> = {}): Match => ({
    id,
    type: herren,
    playGroup: { id: groupId, name: String.fromCharCode(64 + groupId) },
    matchType: { id: 9, name: 'Gruppenspiel' },
    team1: [player(p1)],
    team2: [player(p2)],
    state: 'Open',
    ...extra,
  });
  const koMatch = (id: number, stage: string, state: Match['state'] = 'Open'): Match => ({
    id,
    type: herren,
    matchType: { id: 1, name: stage },
    team1: [player(id)],
    team2: [player(id + 50)],
    state,
  });

  it('makes one tab per discipline', () => {
    expect(service.getTabsForDisciplines([herren, { id: 2, name: 'Damen', active: false }])).toEqual([
      { id: 1, name: 'Herren', groups: [], stages: [], isActive: undefined },
      { id: 2, name: 'Damen', groups: [], stages: [], isActive: false },
    ]);
  });

  it('makes an empty tab without matches', () => {
    expect(service.getTabForMatches([])).toEqual({ groups: [], stages: [] });
    expect(service.getTabForMatches(null)).toEqual({ groups: [], stages: [] });
  });

  it('collects the groups by id with their players once, the tables of their open matches and whether they are over', () => {
    const matches = [
      groupMatch(1, 2, 1, 2, { state: 'Completed' }),
      groupMatch(2, 1, 3, 4, { state: 'OnTable', tableId: 70, tableNumber: 7 }),
      groupMatch(3, 2, 1, 5, { state: 'Walkover' }),
      groupMatch(4, 1, 3, 6),
    ];

    const tab = service.getTabForMatches(matches);

    expect(tab).toEqual({
      id: 1,
      name: 'Herren',
      stages: [],
      groups: [
        {
          name: 'Gruppe A',
          tableNumbers: [7],
          isComplete: false,
          isMatchActive: true,
          isPlayerActive: true,
          players: [player(3), player(4), player(6)],
          matches: [matches[1], matches[3]],
        },
        {
          name: 'Gruppe B',
          tableNumbers: [],
          isComplete: true,
          isMatchActive: true,
          isPlayerActive: true,
          players: [player(1), player(2), player(5)],
          matches: [matches[0], matches[2]],
        },
      ],
    });
  });

  it('collects the knockout matches per stage in the order the stages first appear', () => {
    const matches = [koMatch(1, 'Halbfinale', 'Completed'), koMatch(2, 'Finale'), koMatch(3, 'Halbfinale', 'Finished')];

    expect(service.getTabForMatches(matches).stages).toEqual([
      { id: 1, name: 'Halbfinale', isComplete: true, matches: [matches[0], matches[2]] },
      { id: 1, name: 'Finale', isComplete: false, matches: [matches[1]] },
    ]);
  });
});
