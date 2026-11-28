import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { MinuteClock } from '../../../shared/clock/minute-clock.service';
import { MatchItemComponent } from './match-item.component';

describe('a match waiting at a table', () => {
  const now = Date.parse('2026-11-22T10:30:00Z');
  let item: MatchItemComponent;
  let dialog: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    dialog = { open: vi.fn(() => ({ afterClosed: () => of([2]) })) };
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: MinuteClock, useValue: { now: signal(now) } },
      ],
    });
    item = TestBed.runInInjectionContext(() => new MatchItemComponent());
    item.match = {
      match_id: 8,
      state: 'OnTable',
      callNumber: 2,
      firstCallTime: '2026-11-22T10:17:30Z',
      players_a: [{ player_id: 1, call_count: 1 }],
      players_b: [
        { player_id: 2, call_count: 2 },
        { player_id: 3, call_count: 1 },
      ],
    };
  });

  it('shows the highest call of each Side', () => {
    expect([
      item.highestCall(item.match.players_a),
      item.highestCall(item.match.players_b),
      item.highestCall(undefined),
    ]).toEqual([1, 2, 0]);
  });

  it('shows the whole minutes since the first Call', () => {
    expect(item.waitingMinutes()).toBe(12);
    item.match = { match_id: 8, players_a: [], players_b: [] };
    expect(item.waitingMinutes()).toBeNull();
  });

  it('requests the next call of the players ticked as missing', () => {
    const calls: unknown[] = [];
    item.callPlayersForMatch.subscribe((value) => calls.push(value));

    expect(item.canCall()).toBe(true);
    item.callPlayers();

    expect(calls).toEqual([{ matchId: 8, playerIds: [2] }]);
  });
});
