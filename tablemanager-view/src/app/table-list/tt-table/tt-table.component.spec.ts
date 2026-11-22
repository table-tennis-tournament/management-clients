import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { Match } from '../match/match.model';
import { Table } from './table.model';
import { TtTableComponent } from './tt-table.component';
import { ResultDialogComponent } from './result-dialog/result-dialog.component';
import { GameDialogComponent } from './game-dialog/game-dialog.component';
import { PlayerDialogComponent } from './player-dialog/player-dialog.component';

describe('the table card of a table manager', () => {
  let card: TtTableComponent;
  let dialogClosed: Subject<unknown>;
  let dialog: { open: ReturnType<typeof vi.fn> };
  let emitted: Record<string, unknown[]>;

  const anna = { player_id: 1, first_name: 'Anna', last_name: 'Berg', call_count: 1 };
  const bernd = { player_id: 2, first_name: 'Bernd', last_name: 'Kurz', call_count: 1 };
  const game = (a: number, b: number) => ({ score_player_a: a, score_player_b: b });
  const started = (games = [game(11, 5), game(9, 11)]): Match => ({
    match_id: 7,
    state: 'Started',
    callNumber: 1,
    players_a: [anna],
    players_b: [bernd],
    result: { games },
  });
  const waiting = (callNumber: number): Match => ({ match_id: 8, state: 'OnTable', callNumber });
  const tableWith = (...matches: Match[]): Table => ({ table_id: 30, table_number: 3, matches });

  beforeEach(() => {
    dialogClosed = new Subject();
    dialog = { open: vi.fn(() => ({ afterClosed: () => dialogClosed })) };
    TestBed.configureTestingModule({ providers: [{ provide: MatDialog, useValue: dialog }] });
    card = TestBed.runInInjectionContext(() => new TtTableComponent());
    emitted = {};
    for (const output of [
      'updateMatchResult',
      'finishMatch',
      'startMatchOnTable',
      'callPlayersForMatch',
      'takeBackMatch',
    ]) {
      emitted[output] = [];
      (card as any)[output].subscribe((value: unknown) => emitted[output].push(value));
    }
  });

  it('shows the scoreboard of the started match with five Sets', () => {
    card.table = tableWith(started(), waiting(1));

    expect(card.startedMatch.match_id).toBe(7);
    expect(card.scoreboard).toEqual({
      sets: [
        { pointsPlayer1: 11, pointsPlayer2: 5, winner: 1 },
        { pointsPlayer1: 9, pointsPlayer2: 11, winner: 2 },
        { pointsPlayer1: 0, pointsPlayer2: 0, winner: null },
        { pointsPlayer1: 0, pointsPlayer2: 0, winner: null },
        { pointsPlayer1: 0, pointsPlayer2: 0, winner: null },
      ],
      setsWon: { player1: 1, player2: 1 },
      winner: null,
    });
  });

  it('shows no scoreboard without a started match', () => {
    card.table = tableWith(waiting(1));

    expect([card.startedMatch, card.scoreboard]).toEqual([null, null]);
  });

  it('marks a second and a third call of a waiting match', () => {
    card.table = tableWith(waiting(2));
    expect([card.secondCall, card.thirdCall]).toEqual([true, false]);

    card.table = tableWith(waiting(3));
    expect([card.secondCall, card.thirdCall]).toEqual([false, true]);
  });

  it('starts a waiting match at this table, ends and takes back the started one', () => {
    const match = started();
    card.table = tableWith(match);

    card.startMatch(8);
    card.endMatch();
    card.takeBack();

    expect(emitted['startMatchOnTable']).toEqual([{ tableId: 30, matchId: 8 }]);
    expect(emitted['finishMatch']).toEqual([match]);
    expect(emitted['takeBackMatch']).toEqual([{ matchId: 7 }]);
  });

  it('enters the result of the started match in the result dialog', () => {
    const match = started();
    card.table = tableWith(match);

    card.openResultDialog();
    dialogClosed.next(undefined);
    dialogClosed.next({ games: [game(11, 1)] });

    expect(dialog.open.mock.calls).toEqual([[ResultDialogComponent, { width: '400px', data: match }]]);
    expect(emitted['updateMatchResult']).toEqual([{ matchId: 7, result: { games: [game(11, 1)] } }]);
  });

  it('adds the next Set won by a Side, with the loser points entered in the game dialog', () => {
    card.table = tableWith(started());

    card.openGameDialog([bernd], false);
    expect(dialog.open.mock.calls).toEqual([
      [GameDialogComponent, { width: '400px', data: { player: [bernd], gameNr: 2, isPlayerA: false } }],
    ]);

    dialogClosed.next({ isPlayerA: false, result: '10' });
    expect(emitted['updateMatchResult']).toEqual([
      { matchId: 7, result: { games: [game(11, 5), game(9, 11), game(10, 12)] } },
    ]);
  });

  it('names an empty 0:0 Set when there is one', () => {
    card.table = tableWith(started([game(11, 5), game(0, 0)]));

    card.openGameDialog([anna], true);

    expect(dialog.open.mock.calls[0][1].data.gameNr).toBe(1);
  });

  it('starts counting Sets at the first one for a match without Sets', () => {
    card.table = tableWith(started([]));

    card.openGameDialog([anna], true);
    dialogClosed.next(undefined);

    expect(dialog.open.mock.calls[0][1].data.gameNr).toBe(0);
    expect(emitted['updateMatchResult']).toEqual([]);
  });

  it('calls the missing players of a started match, e.g. after an auto-start', () => {
    card.table = tableWith(started());
    expect(card.canCallStartedMatch()).toBe(true);

    card.callPlayersOfStartedMatch();
    expect(dialog.open.mock.calls).toEqual([[PlayerDialogComponent, { width: '400px', data: [anna, bernd] }]]);

    dialogClosed.next([]);
    dialogClosed.next([2]);
    expect(emitted['callPlayersForMatch']).toEqual([{ matchId: 7, playerIds: [2] }]);
  });

  it('calls nobody without a started match', () => {
    card.table = tableWith(waiting(1));

    expect(card.canCallStartedMatch()).toBe(false);
  });
});
