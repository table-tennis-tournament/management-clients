import { DisciplineTypePipe } from './discipline-type.pipe';
import { ResultPipe } from './result.pipe';
import { TtMatchDisciplinePipe } from './tt-match-discipline.pipe';
import { TtPlayerNameReducerPipe } from './tt-player-name-reducer.pipe';

describe('the shared pipes', () => {
  describe('ttPlayerNameReducer', () => {
    const pipe = new TtPlayerNameReducerPipe();
    const anna = { id: 1, firstName: 'Anna', lastName: 'Berg', club: { id: 1, name: 'TTC Mühringen' } };
    const bernd = { id: 2, firstName: 'Bernd', lastName: 'Kurz' };

    it('shows a single player with their club', () => {
      expect(pipe.transform([anna])).toBe('Anna Berg (TTC Mühringen)');
    });

    it('shows a single player without a club by name only', () => {
      expect(pipe.transform([bernd])).toBe('Bernd Kurz');
    });

    it('abbreviates the first names of a doubles team', () => {
      expect(pipe.transform([anna, bernd])).toBe('An. Berg/Be. Kurz');
    });

    it('shows nothing for no players, and for more than two', () => {
      expect(pipe.transform(null)).toBe('');
      expect(pipe.transform([])).toBe('');
      expect(pipe.transform([anna, bernd, anna])).toBe('');
    });

    it('copes with a player whose names are missing', () => {
      expect(pipe.transform([{ id: 3 }])).toBe('');
      expect(pipe.transform([{ id: 3 }, { id: 4 }])).toBe('. /. ');
    });
  });

  describe('resultPipe', () => {
    const pipe = new ResultPipe();
    const sets = [
      [11, 5],
      [8, 11],
      [11, 9],
      [11, 3],
    ].map(([pointsPlayer1, pointsPlayer2]) => ({ pointsPlayer1, pointsPlayer2 }));

    it('shows the Sets won by both Sides', () => {
      expect(pipe.transform(sets)).toBe('3 : 1');
    });

    it('shows the Sets won by one Side', () => {
      expect(pipe.transform(sets, 1)).toBe(3);
      expect(pipe.transform(sets, 2)).toBe(1);
    });

    it('shows nothing without Sets', () => {
      expect(pipe.transform([])).toBe('');
      expect(pipe.transform(null)).toBe('');
      expect(pipe.transform(undefined, 1)).toBe('');
    });
  });

  describe('disciplineType', () => {
    const pipe = new DisciplineTypePipe();

    it('abbreviates the knockout stages', () => {
      const stages = ['Finale', 'Halbfinale', 'Viertelfinale', 'Achtelfinale', 'Runde 3', 'Runde 2', 'Runde 1'];
      expect(stages.map((name) => pipe.transform({ id: 1, name }))).toEqual(['FI', 'HF', 'VF', 'AF', 'R3', 'R2', 'R1']);
    });

    it('shows nothing for a stage it does not know', () => {
      expect(pipe.transform({ id: 9, name: 'Gruppenspiel' })).toBeUndefined();
    });
  });

  describe('ttMatchDiscipline', () => {
    it('names the discipline and the stage of a match', () => {
      const match = { type: { id: 1, name: 'Herren A' }, matchType: { id: 1, name: 'Finale' } } as any;
      expect(new TtMatchDisciplinePipe().transform(match)).toBe('Herren A Finale');
    });
  });
});
