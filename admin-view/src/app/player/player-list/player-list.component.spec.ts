import { PlayerType } from '../data/player.type.model';
import { PlayerListComponent } from './player-list.component';

describe('the player list', () => {
  const herren = { id: 1, name: 'Herren', kind: 1 };
  const damen = { id: 2, name: 'Damen', kind: 1 };
  const registration = (
    id: number,
    firstName: string,
    lastName: string,
    club: string | null,
    type = herren,
    paid = false
  ) =>
    ({
      id,
      type,
      paid,
      player: { id, firstName, lastName, club: club ? { id, name: club } : null },
    }) as PlayerType;
  const anna = registration(1, 'Anna', 'Berg', 'TTC Mühringen', herren, true);
  const annika = registration(2, 'Annika', 'Kurz', 'SG Sossenheim');
  const bernd = registration(3, 'Bernd', 'Bergmann', null, damen);

  let list: PlayerListComponent;
  const shown = () => list.filteredPlayers.map((p) => p.id);

  beforeEach(() => {
    list = new PlayerListComponent();
    list.players = [anna, annika, bernd];
  });

  it('shows every registration and remembers which are paid', () => {
    expect(shown()).toEqual([1, 2, 3]);
    expect(list.paidValues).toEqual({ 1: true, 2: false, 3: false });
    expect(list.getPaidPlayersCount()).toBe(1);
  });

  it('offers the singles disciplines as filter', () => {
    list.disciplines = [herren, { id: 3, name: 'Herren', kind: 2 }, damen];

    expect(list.filteredDisciplines).toEqual([herren, damen]);
  });

  it('filters by first name, last name and club, ignoring case', () => {
    list.firstNameInput = 'ann';
    list.applyFilters();
    expect(shown()).toEqual([1, 2]);

    list.firstNameInput = '';
    list.lastNameInput = 'BERG';
    list.applyFilters();
    expect(shown()).toEqual([1, 3]);

    list.lastNameInput = '';
    list.clubInput = 'sossen';
    list.applyFilters();
    expect(shown()).toEqual([2]);
  });

  it('combines the name filters', () => {
    list.firstNameInput = 'ann';
    list.lastNameInput = 'kurz';
    list.applyFilters();

    expect(shown()).toEqual([2]);
  });

  it('filters by club over players without a club', () => {
    list.clubInput = 'TTC';
    list.applyFilters();

    expect(shown()).toEqual([1]);
  });

  it('keeps the name filters when the discipline changes, and shows all disciplines again', () => {
    list.lastNameInput = 'berg';
    list.applyFilters();

    list.onDisciplineChanged(2);
    expect(shown()).toEqual([3]);

    list.onDisciplineChanged(0);
    expect(shown()).toEqual([1, 3]);
  });

  it('keeps the filters when new registrations arrive', () => {
    list.onDisciplineChanged(1);
    list.players = [anna, annika, bernd, registration(4, 'Carl', 'Ott', null)];

    expect(shown()).toEqual([1, 2, 4]);
  });

  it('reports a registration whose paid box was ticked, without changing the shown one', () => {
    const changed: PlayerType[] = [];
    list.playerChanged.subscribe((p) => changed.push(p));

    list.paidValues[2] = true;
    list.onChange(annika);

    expect(changed).toEqual([{ ...annika, paid: true }]);
    expect(annika.paid).toBe(false);
  });
});
