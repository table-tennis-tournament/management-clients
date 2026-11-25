import { Match } from '../../../shared/data/match.model';
import { DisciplineGroupComponent } from './discipline-group.component';

describe('the discipline group', () => {
  const match = (id: number, extra: Partial<Match> = {}): Match => ({ id, state: 'Open', isPlayable: true, ...extra });
  const groupOf = (...matches: Match[]) => {
    const component = new DisciplineGroupComponent();
    component.group = { name: 'Gruppe A', isComplete: matches.every((m) => m.state === 'Completed'), matches };
    return component;
  };

  it('shows the numbers of the tables its matches are at, each once', () => {
    const group = groupOf(
      match(1, { tableNumber: 7 }),
      match(2, { tableNumber: 7 }),
      match(3, { tableNumber: 3 }),
      match(4)
    );

    expect(group.tableNumbers).toEqual([7, 3]);
  });

  it('counts its matches that are not over', () => {
    const group = groupOf(match(1, { state: 'Completed' }), match(2, { state: 'Walkover' }), match(3));

    expect([group.openMatches, group.allMatchCount, group.groupIsNotComplete()]).toEqual([1, 3, true]);
  });

  it('is complete once every match is over', () => {
    expect(groupOf(match(1, { state: 'Completed' })).groupIsNotComplete()).toBe(false);
  });

  it('is draggable while one of its matches is open', () => {
    expect(groupOf(match(1, { state: 'OnTable' }), match(2)).groupIsDraggable()).toBe(true);
    expect(groupOf(match(1, { state: 'OnTable' }), match(2, { state: 'Completed' })).groupIsDraggable()).toBe(false);
  });

  it('is in the waiting list when every match is queued', () => {
    expect(groupOf(match(1, { state: 'InQueue' }), match(2, { state: 'InQueue' })).isGroupInWaitingList()).toBe(true);
    expect(groupOf(match(1, { state: 'InQueue' }), match(2)).isGroupInWaitingList()).toBe(false);
  });

  it('is marked not playable when a player is busy elsewhere and the group is at no table', () => {
    expect(groupOf(match(1, { isPlayable: false })).groupIsNotPlayable()).toBe(true);
    expect(groupOf(match(1, { isPlayable: false, tableNumber: 4 })).groupIsNotPlayable()).toBe(false);
    expect(groupOf(match(1)).groupIsNotPlayable()).toBe(false);
  });

  it('keeps the inputs for showing players and matches', () => {
    const group = groupOf(match(1));
    group.showPlayers = false;
    group.showMatches = true;

    expect([group.showPlayers, group.showMatches]).toEqual([false, true]);
  });
});
