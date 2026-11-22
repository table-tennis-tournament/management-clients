import { Match } from '../../shared/data/match.model';
import { MatchList } from '../../supervisor/matchlist.model';
import { DisciplineMatchListComponent } from './discipline-match-list.component';

describe('the match list of the Assign view', () => {
  const match = (
    id: number,
    typeId: number,
    state: Match['state'] = 'Open',
    groupId?: number,
    isPlayable = true
  ): Match => ({
    id,
    type: { id: typeId, name: `T${typeId}` },
    state,
    isPlayable,
    playGroup: groupId ? { id: groupId, name: 'A' } : undefined,
  });
  const matches = [
    match(1, 1),
    match(2, 1, 'OnTable'),
    match(3, 2, 'InQueue'),
    match(4, 1, 'Open', 7),
    match(5, 1, 'Open', 7, false),
    match(6, 1, 'Completed', 7),
  ];
  const queue: MatchList[] = [{ matchinfo: [matches[0]] }, { matchinfo: [matches[3], matches[4]] }];

  let list: DisciplineMatchListComponent;
  const shown = () => list.currentMatchesToShow.map((m) => m.id);

  beforeEach(() => {
    list = new DisciplineMatchListComponent();
    list.matches = matches;
    list.matchList = queue;
  });

  it('shows every waiting match for "all disciplines" (0)', () => {
    list.onDisciplineSelected(0);

    expect(shown()).toEqual([1, 3, 4, 5]);
  });

  it('shows the waiting matches of one discipline', () => {
    list.onDisciplineSelected(1);

    expect(shown()).toEqual([1, 4, 5]);
  });

  it('shows the queued matches for the queue ("Warteschlange", -1)', () => {
    list.onDisciplineSelected(-1);

    expect(shown()).toEqual([1, 4, 5]);
  });

  it('follows new matches and a new queue for the selected discipline', () => {
    list.onDisciplineSelected(1);
    list.matches = [match(1, 1), match(8, 1)];
    expect(shown()).toEqual([1, 8]);

    list.onDisciplineSelected(-1);
    list.matchList = [{ matchinfo: [match(9, 2)] }];
    expect(shown()).toEqual([9]);
  });

  it('drags the waiting matches of a group together', () => {
    expect(list.getMatch(7).map((m) => m.id)).toEqual([4, 5]);
  });

  it('blocks a queue entry with a match that is not playable', () => {
    expect([list.anyMatchIsNotPlayable(queue[0]), list.anyMatchIsNotPlayable(queue[1])]).toEqual([false, true]);
    expect(list.firstMatch(queue[1]).id).toBe(4);
  });
});
