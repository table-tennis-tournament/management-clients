import { TestBed } from '@angular/core/testing';
import { Match } from '../../shared/data/match.model';
import { DisciplineViewComponent } from './discipline-view.component';

describe('the discipline view', () => {
  let view: DisciplineViewComponent;
  let selected: number[];

  const herren = { id: 1, name: 'Herren', active: true };
  const damen = { id: 2, name: 'Damen', active: true };
  const match = (id: number, typeId: number, groupId: number, state: Match['state'] = 'Open'): Match => ({
    id,
    type: typeId === 1 ? herren : damen,
    playGroup: { id: groupId, name: `${groupId}` },
    matchType: { id: 9, name: 'Gruppenspiel' },
    team1: [{ id: id * 10 }],
    team2: [{ id: id * 10 + 1 }],
    state,
  });
  const ko = (id: number, state: Match['state']): Match => ({
    id,
    type: herren,
    matchType: { id: 1, name: 'Finale' },
    team1: [{ id: 1 }],
    team2: [{ id: 2 }],
    state,
  });
  const groupNames = () => view.selectedTab.groups.map((group) => group.name);

  beforeEach(() => {
    view = TestBed.runInInjectionContext(() => new DisciplineViewComponent());
    selected = [];
    view.selectDiscipline.subscribe((id) => selected.push(id));
  });

  it('shows the active disciplines only, and selects the first when none is selected', () => {
    view.selectedDiscipline = 0;
    view.disciplines = [{ id: 3, name: 'Senioren', active: false }, herren, damen];

    expect(view.disciplines).toEqual([herren, damen]);
    expect(view.tabs.map((tab) => tab.id)).toEqual([1, 2]);
    expect(selected).toEqual([1]);
  });

  it('shows the groups of the selected discipline that are not over', () => {
    view.matches = [match(1, 1, 1), match(2, 1, 2, 'Completed'), match(3, 2, 3)];
    view.selectedDiscipline = 1;

    expect(groupNames()).toEqual(['Gruppe 1']);
  });

  it('shows the groups that are over as well when asked to, and hides them again', () => {
    view.matches = [match(1, 1, 1), match(2, 1, 2, 'Completed')];
    view.selectedDiscipline = 1;

    view.showAllMatches = true;
    view.onRemovePlayedChanged();
    expect(groupNames()).toEqual(['Gruppe 1', 'Gruppe 2']);

    view.showAllMatches = false;
    view.onRemovePlayedChanged();
    expect(groupNames()).toEqual(['Gruppe 1']);
  });

  it('keeps the shown group objects when new matches change nothing in them', () => {
    view.showAllMatches = true;
    view.matches = [match(1, 1, 1), match(2, 1, 2)];
    view.selectedDiscipline = 1;
    const [first, second] = view.selectedTab.groups;

    view.matches = [match(1, 1, 1), match(2, 1, 2, 'OnTable')];

    expect(view.selectedTab.groups[0]).toBe(first);
    expect(view.selectedTab.groups[1]).not.toBe(second);
    expect(view.selectedTab.groups[1].matches[0].state).toBe('OnTable');
  });

  it('stops following new matches while refreshing is stopped', () => {
    view.matches = [match(1, 1, 1)];
    view.selectedDiscipline = 1;
    view.stopRefresh = true;

    view.matches = [match(1, 1, 1), match(2, 1, 2)];

    expect(groupNames()).toEqual(['Gruppe 1']);
  });

  it('removes a knockout stage on request', () => {
    view.showAllMatches = true;
    view.matches = [ko(1, 'Completed')];
    view.selectedDiscipline = 1;

    view.onDeleteStage(view.selectedTab.stages[0]);

    expect(view.selectedTab.stages).toEqual([]);
  });

  it('copes with a selected discipline before the matches arrive', () => {
    view.selectedDiscipline = 1;

    expect(view.selectedTab).toEqual({ groups: [], stages: [] });
  });

  it('selects the first discipline when the selection is reset', () => {
    view.selectedDiscipline = 1;
    view.disciplines = [herren, damen];

    view.selectedDiscipline = 0;

    expect(selected).toEqual([1]);
  });
});
