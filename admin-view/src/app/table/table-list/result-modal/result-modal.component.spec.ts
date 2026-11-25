import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Match } from '../../../shared/data/match.model';
import { ResultModalComponent } from './result-modal.component';

describe('the result dialog', () => {
  let close: ReturnType<typeof vi.fn>;
  const set = (pointsPlayer1: number, pointsPlayer2: number) => ({ pointsPlayer1, pointsPlayer2 });

  function open(match: Partial<Match>, kampflosAllowed?: boolean) {
    close = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close } },
        { provide: MAT_DIALOG_DATA, useValue: { match, kampflosAllowed } },
      ],
    });
    return TestBed.runInInjectionContext(() => new ResultModalComponent());
  }

  it('starts with the result the match already has', () => {
    const dialog = open({ id: 1, sets: [set(11, 5), set(5, 11), set(11, 3), set(11, 9)] });

    expect([dialog.currentInput, dialog.winner, dialog.resultNotValid()]).toEqual(['5 -5 3 9', 1, false]);
  });

  it('allows kampflos only where the opener says so', () => {
    expect(open({ id: 1 }).kampflosAllowed).toBe(false);
    TestBed.resetTestingModule();
    expect(open({ id: 1 }, true).kampflosAllowed).toBe(true);
  });

  it('closes with the entered result on enter, marked kampflos when ticked', () => {
    const match = { id: 1 };
    const dialog = open(match, true);

    dialog.onKeyUp('0 0 0');
    dialog.kampflos = true;
    dialog.onEnter();

    expect(close.mock.calls).toEqual([[{ match, result: [set(11, 0), set(11, 0), set(11, 0)], kampflos: true }]]);
  });

  it('stays open on enter while the result has no winner', () => {
    const dialog = open({ id: 1 });

    dialog.onKeyUp('5 -5');
    dialog.onEnter();

    expect([dialog.winner, dialog.getResult(), close.mock.calls]).toEqual([null, undefined, []]);
  });

  it('closes without a result on cancel', () => {
    open({ id: 1 }).onCancel();

    expect(close.mock.calls).toEqual([[]]);
  });
});
