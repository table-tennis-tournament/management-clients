import { ResultPipe } from './result.pipe';
import { Match } from './data/match';

const threeOne = [
  { pointsPlayer1: 11, pointsPlayer2: 5 },
  { pointsPlayer1: 11, pointsPlayer2: 7 },
  { pointsPlayer1: 9, pointsPlayer2: 11 },
  { pointsPlayer1: 11, pointsPlayer2: 9 },
];
const nilThree = [
  { pointsPlayer1: 0, pointsPlayer2: 11 },
  { pointsPlayer1: 0, pointsPlayer2: 11 },
  { pointsPlayer1: 0, pointsPlayer2: 11 },
];

describe('the result pipe', () => {
  const pipe = new ResultPipe();
  const results = (match: Match | null) => [pipe.transform(match, true), pipe.transform(match, false)];

  it('gives the Sets won by each Side', () => {
    expect(results({ state: 'Completed', sets: threeOne })).toStrictEqual([3, 1]);
  });

  it('shows nothing for a match without Sets', () => {
    expect(results({ state: 'Open', sets: [] })).toStrictEqual(['', '']);
    expect(results({ state: 'Open' })).toStrictEqual(['', '']);
    expect(results(null)).toStrictEqual(['', '']);
  });

  it('shows "kampflos" for the Side that won a walkover, not its 3:0', () => {
    expect(results({ state: 'Walkover', sets: nilThree })).toStrictEqual(['', 'kampflos']);
  });
});
