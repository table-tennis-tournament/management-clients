import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ResultDialogComponent } from './result-dialog/result-dialog.component';
import { GameDialogComponent } from './game-dialog/game-dialog.component';
import { StartDialogComponent } from './start-dialog/start-dialog.component';

describe('the table manager dialogs', () => {
  let close: ReturnType<typeof vi.fn>;

  function open<T>(type: new () => T, data: unknown): T {
    close = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close } },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    return TestBed.runInInjectionContext(() => new type());
  }

  const game = (a: number, b: number) => ({ score_player_a: a, score_player_b: b });

  describe('the result dialog', () => {
    it('starts with the Sets entered so far', () => {
      const dialog = open(ResultDialogComponent, { match_id: 7, result: { games: [game(11, 5), game(7, 11)] } });
      dialog.ngOnInit();

      expect(dialog.resultString).toBe('5 -7');
    });

    it('starts empty for a match without Sets', () => {
      const dialog = open(ResultDialogComponent, { match_id: 7 });
      dialog.ngOnInit();

      expect(dialog.resultString).toBe('');
    });

    it('closes with the entered Sets, also an interim result', () => {
      const dialog = open(ResultDialogComponent, { match_id: 7 });
      dialog.resultString = '5 -9';
      dialog.onOk();

      expect(close.mock.calls).toEqual([[{ games: [game(11, 5), game(9, 11)] }]]);
    });

    it('stays open for input with an invalid Set', () => {
      const dialog = open(ResultDialogComponent, { match_id: 7 });
      dialog.resultString = '5 x';
      dialog.onOk();
      dialog.onCancel();

      expect(close.mock.calls).toEqual([[]]);
    });
  });

  describe('the game dialog', () => {
    const data = { player: [], gameNr: 2, isPlayerA: true };

    it('closes with the loser points of the Set and the Side that won it', () => {
      const dialog = open(GameDialogComponent, data);
      dialog.ngOnInit();
      dialog.resultString = '9';
      dialog.onOk();

      expect(close.mock.calls).toEqual([[{ result: '9', gameNr: 2, isPlayerA: true }]]);
    });

    it('stays open for input that is not a number', () => {
      const dialog = open(GameDialogComponent, data);
      dialog.resultString = 'neun';
      dialog.onOk();

      expect(close).not.toHaveBeenCalled();
    });

    // documents the current behaviour: an empty input counts as 0, a Set won 11:0
    it('takes an empty input as 0', () => {
      const dialog = open(GameDialogComponent, data);
      dialog.ngOnInit();
      dialog.onOk();

      expect(close.mock.calls).toEqual([[{ result: '', gameNr: 2, isPlayerA: true }]]);
    });

    it('closes without a result on cancel', () => {
      open(GameDialogComponent, data).onCancel();

      expect(close.mock.calls).toEqual([[]]);
    });
  });

  describe('the start dialog', () => {
    it('closes with the chosen match, or with nothing on cancel', () => {
      const dialog = open(StartDialogComponent, [{ match_id: 7 }, { match_id: 8 }]);
      dialog.selectedMatch = { match_id: 8, players_a: [], players_b: [] };
      dialog.onOk();
      dialog.onCancel();

      expect(close.mock.calls).toEqual([[8], []]);
    });
  });
});
