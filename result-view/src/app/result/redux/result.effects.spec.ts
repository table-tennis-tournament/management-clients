import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Action } from '@ngrx/store';
import { lastValueFrom, of } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { describe, expect, it } from 'vitest';
import { DisciplineTabService } from '../services/discipline-tab.service';
import { MatchService } from '../services/match.service';
import { TypeService } from '../services/type.service';
import * as ResultActions from './result.actions';
import { ResultEffects } from './result.effects';

describe('the result effects', () => {
  const effectsWith = (action: Action, selectedTypeId: number | null) => {
    TestBed.configureTestingModule({
      providers: [
        ResultEffects,
        provideMockActions(() => of(action)),
        provideMockStore({ initialState: { disciplines: { types: [], selectedTypeId } } }),
        { provide: MatSnackBar, useValue: {} },
        { provide: MatchService, useValue: {} },
        { provide: DisciplineTabService, useValue: {} },
        { provide: TypeService, useValue: {} },
      ],
    });
    return TestBed.inject(ResultEffects);
  };

  it('loads the matches of the selected discipline', async () => {
    const effects = effectsWith(ResultActions.selectType({ typeId: 2 }), 2);
    expect(await lastValueFrom(effects.loadSelectedMatches$.pipe(toArray()))).toStrictEqual([
      ResultActions.loadMatches({ typeId: 2 }),
    ]);
  });

  it('loads the matches of the displayed discipline after the types were loaded', async () => {
    const effects = effectsWith(ResultActions.loadTypesSuccess({ types: [{ id: 5 }] }), 5);
    expect(await lastValueFrom(effects.loadSelectedMatches$.pipe(toArray()))).toStrictEqual([
      ResultActions.loadMatches({ typeId: 5 }),
    ]);
  });

  it('loads nothing without a displayed discipline', async () => {
    const effects = effectsWith(ResultActions.loadTypesSuccess({ types: [] }), null);
    expect(await lastValueFrom(effects.loadSelectedMatches$.pipe(toArray()))).toStrictEqual([]);
  });
});
