import { ClubNamePipe } from './club-name.pipe';
import { PlayerNamePipe } from './player-name.pipe';
import { SinglePlayerPipe } from './single-player.pipe';

describe('the table manager pipes', () => {
  const anna = { player_id: 1, first_name: 'Anna', last_name: 'Berg', club: 'TTC Mühringen' };
  const bernd = { player_id: 2, first_name: 'Bernd', last_name: 'Kurz', club: 'SG Sossenheim' };

  it('names a player and a doubles team, its first names cut to three letters', () => {
    const pipe = new PlayerNamePipe();

    expect([pipe.transform([anna]), pipe.transform([anna, bernd])]).toEqual(['Anna Berg', 'Berg Ann. / Kurz Ber.']);
    expect([pipe.transform([]), pipe.transform(undefined)]).toEqual([undefined, undefined]);
  });

  it('names the club of a player and the clubs of a doubles team', () => {
    const pipe = new ClubNamePipe();

    expect([pipe.transform([anna]), pipe.transform([anna, bernd])]).toEqual([
      'TTC Mühringen',
      'TTC Mühringen/SG Sossenheim',
    ]);
    expect(pipe.transform([])).toBeUndefined();
  });

  it('names a single player', () => {
    expect(new SinglePlayerPipe().transform(bernd)).toBe('Bernd Kurz');
  });
});
