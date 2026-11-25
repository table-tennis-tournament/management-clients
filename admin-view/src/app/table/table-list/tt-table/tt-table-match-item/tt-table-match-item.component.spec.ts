import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinuteClock } from '../../../../shared/clock/minute-clock.service';
import { Match } from '../../../../shared/data/match.model';
import { TtTableMatchItemComponent } from './tt-table-match-item.component';

describe('the match on a table card', () => {
  let item: TtTableMatchItemComponent;
  const started: Match = {
    id: 1,
    team1: [],
    team2: [],
    state: 'Started',
    startTime: '2026-11-22T10:05:00+01:00',
    sets: [
      { pointsPlayer1: 11, pointsPlayer2: 5 },
      { pointsPlayer1: 9, pointsPlayer2: 11 },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MinuteClock, useValue: { now: signal(Date.parse('2026-11-22T09:17:40Z')) } }],
    });
    item = TestBed.runInInjectionContext(() => new TtTableMatchItemComponent());
  });

  it('shows the points of each Set of the current result', () => {
    expect(item.setPoints(started)).toBe('11:5 9:11');
    expect(item.setPoints({})).toBe('');
  });

  it('shows the whole minutes since the start, in the offset the backend sends', () => {
    expect(item.playingMinutes(started)).toBe(12);
  });

  it('shows no playing time without a start time', () => {
    expect(item.playingMinutes({ ...started, startTime: undefined })).toBeNull();
  });

  it('shows the playing time only while the match is played', () => {
    expect([item.isPlaying(started), item.isPlaying({ ...started, state: 'OnTable' })]).toEqual([true, false]);
  });
});
