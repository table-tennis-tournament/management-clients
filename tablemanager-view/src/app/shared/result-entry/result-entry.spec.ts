// Copied verbatim into each client next to result-entry.ts; keep the copies identical.
import {
  formatResult,
  isFinalResult,
  isValidSet,
  matchWinner,
  parseResult,
  parseSet,
  setsWon,
  setWinner,
  setWonBy,
  toRequestBody,
} from './result-entry';

const sets = (...scores: [number, number][]) => scores.map(([a, b]) => ({ pointsPlayer1: a, pointsPlayer2: b }));

describe('result entry', () => {
  describe('parseSet', () => {
    it('reads a plain number as a Set won by Side 1', () => {
      expect(parseSet('5')).toEqual({ pointsPlayer1: 11, pointsPlayer2: 5 });
    });

    it('reads a leading minus as a Set won by Side 2', () => {
      expect(parseSet('-5')).toEqual({ pointsPlayer1: 5, pointsPlayer2: 11 });
    });

    it('continues past 10:10 with a lead of two', () => {
      expect(parseSet('10')).toEqual({ pointsPlayer1: 12, pointsPlayer2: 10 });
      expect(parseSet('-12')).toEqual({ pointsPlayer1: 12, pointsPlayer2: 14 });
    });

    it('reads 0 as a Set to love', () => {
      expect(parseSet('0')).toEqual({ pointsPlayer1: 11, pointsPlayer2: 0 });
    });

    it('rejects tokens that are not whole numbers', () => {
      expect(parseSet('a')).toBeNull();
      expect(parseSet('5.5')).toBeNull();
      expect(parseSet('--5')).toBeNull();
      expect(parseSet('')).toBeNull();
    });
  });

  describe('parseResult', () => {
    it('parses one Set per token', () => {
      expect(parseResult('-3 4 -5 6 -5')).toEqual(sets([3, 11], [11, 4], [5, 11], [11, 6], [5, 11]));
    });

    it('ignores repeated and surrounding whitespace', () => {
      expect(parseResult('  3   4 5 ')).toEqual(sets([11, 3], [11, 4], [11, 5]));
    });

    it('gives no Sets for blank input', () => {
      expect(parseResult('')).toEqual([]);
      expect(parseResult(undefined)).toEqual([]);
    });

    it('rejects the whole input if one token is invalid', () => {
      expect(parseResult('3 x 5')).toBeNull();
    });
  });

  describe('formatResult', () => {
    it('is the inverse of parseResult', () => {
      const input = '10 -4 -4 10 -12';
      expect(formatResult(parseResult(input))).toBe(input);
    });

    it('formats no Sets as empty input', () => {
      expect(formatResult(undefined)).toBe('');
    });
  });

  it('setWonBy builds the Set for the winning Side', () => {
    expect(setWonBy(1, 7)).toEqual({ pointsPlayer1: 11, pointsPlayer2: 7 });
    expect(setWonBy(2, 13)).toEqual({ pointsPlayer1: 13, pointsPlayer2: 15 });
  });

  it('setWinner names the Side with more Points, or none', () => {
    expect(setWinner({ pointsPlayer1: 11, pointsPlayer2: 3 })).toBe(1);
    expect(setWinner({ pointsPlayer1: 3, pointsPlayer2: 11 })).toBe(2);
    expect(setWinner({ pointsPlayer1: 0, pointsPlayer2: 0 })).toBeNull();
  });

  it('isValidSet applies the 11 Points / lead of two rule', () => {
    expect(isValidSet({ pointsPlayer1: 11, pointsPlayer2: 9 })).toBe(true);
    expect(isValidSet({ pointsPlayer1: 12, pointsPlayer2: 10 })).toBe(true);
    expect(isValidSet({ pointsPlayer1: 11, pointsPlayer2: 10 })).toBe(false);
    expect(isValidSet({ pointsPlayer1: 13, pointsPlayer2: 10 })).toBe(false);
    expect(isValidSet({ pointsPlayer1: 9, pointsPlayer2: 7 })).toBe(false);
  });

  it('setsWon counts the Sets per Side', () => {
    expect(setsWon(sets([11, 3], [4, 11], [11, 5]))).toEqual({ player1: 2, player2: 1 });
    expect(setsWon(undefined)).toEqual({ player1: 0, player2: 0 });
  });

  describe('matchWinner', () => {
    it('is the first Side to win three Sets', () => {
      expect(matchWinner(parseResult('3 4 5'))).toBe(1);
      expect(matchWinner(parseResult('-3 4 -5 -6'))).toBe(2);
    });

    it('is undecided before three Sets', () => {
      expect(matchWinner(parseResult('3 -4 5 -6'))).toBeNull();
    });
  });

  describe('isFinalResult', () => {
    it('accepts a decided best of five', () => {
      expect(isFinalResult(parseResult('3 4 5'))).toBe(true);
      expect(isFinalResult(parseResult('-3 4 -5 6 -5'))).toBe(true);
    });

    it('rejects an undecided result', () => {
      expect(isFinalResult(parseResult('3 4'))).toBe(false);
      expect(isFinalResult([])).toBe(false);
      expect(isFinalResult(null)).toBe(false);
    });

    it('rejects Sets played after the Match was decided', () => {
      expect(isFinalResult(parseResult('3 4 5 -6'))).toBe(false);
    });

    it('rejects an impossible Set score', () => {
      expect(isFinalResult(sets([11, 10], [11, 4], [11, 5]))).toBe(false);
    });
  });

  it('toRequestBody gives the backend tuple shape', () => {
    expect(toRequestBody(sets([11, 3], [4, 11]))).toEqual([
      [11, 3],
      [4, 11],
    ]);
  });
});
