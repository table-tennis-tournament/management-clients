import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { MatchService } from '../match.service';
import { loadTables } from '../../redux/table-list.actions';
import { MatchEffects } from './match.effects';
import * as MatchActions from './match.actions';

describe('the match effects', () => {
  const setup = (tableManagerId: number | null) => {
    TestBed.configureTestingModule({
      providers: [
        MatchEffects,
        provideMockActions(() => of(MatchActions.takeBackMatchSuccess())),
        provideMockStore({ initialState: { tables: { tableManagerId, tables: [] } } }),
        { provide: MatSnackBar, useValue: { open: () => undefined } },
        { provide: MatchService, useValue: {} },
      ],
    });
    return TestBed.inject(MatchEffects);
  };

  it('reloads the tables of the displayed manager after a match was taken back', async () => {
    const effects = setup(3);
    expect(await firstValueFrom(effects.reloadTablesAfterTakeBack$)).toEqual(loadTables({ tableManagerId: 3 }));
  });

  it('does not reload when no table manager is displayed', async () => {
    const effects = setup(null);
    const result = await Promise.race([
      firstValueFrom(effects.reloadTablesAfterTakeBack$, { defaultValue: 'none' }),
      new Promise((resolve) => setTimeout(() => resolve('none'), 50)),
    ]);
    expect(result).toBe('none');
  });
});
