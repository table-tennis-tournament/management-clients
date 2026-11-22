import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Action } from '@ngrx/store';
import { lastValueFrom, Observable, of, throwError } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { describe, expect, it, vi } from 'vitest';
import { DisciplineTabService } from '../services/discipline-tab.service';
import { MatchService } from '../services/match.service';
import { TypeService } from '../services/type.service';
import * as ResultActions from './result.actions';
import { ResultEffects } from './result.effects';

describe('the result effects', () => {
  const effectsWith = (
    action: Action,
    selectedTypeId: number | null,
    services: { match?: object; type?: object; snackBar?: object } = {}
  ) => {
    TestBed.configureTestingModule({
      providers: [
        ResultEffects,
        provideMockActions(() => of(action)),
        provideMockStore({ initialState: { disciplines: { types: [], selectedTypeId } } }),
        { provide: MatSnackBar, useValue: services.snackBar ?? {} },
        { provide: MatchService, useValue: services.match ?? {} },
        DisciplineTabService,
        { provide: TypeService, useValue: services.type ?? {} },
      ],
    });
    return TestBed.inject(ResultEffects);
  };
  const emitted = <T>(effect: Observable<T>) => lastValueFrom(effect.pipe(toArray()));

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

  it('loads the open disciplines', async () => {
    const effects = effectsWith(ResultActions.loadTypes(), null, { type: { getOpenTypes: () => of([{ id: 5 }]) } });

    expect(await emitted(effects.loadTypes$)).toStrictEqual([ResultActions.loadTypesSuccess({ types: [{ id: 5 }] })]);
  });

  it('reports an error when the disciplines do not load', async () => {
    const effects = effectsWith(ResultActions.loadTypes(), null, {
      type: { getOpenTypes: () => throwError(() => 'down') },
    });

    expect(await emitted(effects.loadTypes$)).toStrictEqual([ResultActions.loadTypesError()]);
  });

  it('loads the matches of a discipline and splits them into groups and stages', async () => {
    const group = {
      id: 1,
      playGroup: { id: 3, name: 'C' },
      team1: [{ id: 1 }],
      team2: [{ id: 2 }],
      state: 'Open' as const,
    };
    const final = {
      id: 2,
      matchType: { id: 1, name: 'Finale' },
      team1: [{ id: 1 }],
      team2: [{ id: 3 }],
      state: 'Open' as const,
    };
    const getMatchesByType = vi.fn(() => of([group, final]));
    const effects = effectsWith(ResultActions.loadMatches({ typeId: 5 }), 5, { match: { getMatchesByType } });

    const [success] = (await emitted(effects.loadMatches$)) as any[];

    expect(getMatchesByType.mock.calls).toStrictEqual([[5]]);
    expect(success.matches).toEqual([group, final]);
    expect(success.groups.map((g) => [g.name, g.matches.map((m) => m.id)])).toEqual([['Gruppe C', [1]]]);
    expect(success.stages.map((s) => [s.name, s.matches.map((m) => m.id)])).toEqual([['Finale', [2]]]);
  });

  it('reports an error when the matches do not load', async () => {
    const effects = effectsWith(ResultActions.loadMatches({ typeId: 5 }), 5, {
      match: { getMatchesByType: () => throwError(() => 'down') },
    });

    expect(await emitted(effects.loadMatches$)).toStrictEqual([ResultActions.loadMatchesError()]);
  });

  it('tells the viewer when the disciplines or the matches do not load', async () => {
    const open = vi.fn();
    await emitted(effectsWith(ResultActions.loadTypesError(), null, { snackBar: { open } }).loadTypesError$);
    TestBed.resetTestingModule();
    await emitted(effectsWith(ResultActions.loadMatchesError(), null, { snackBar: { open } }).loadMatchesError$);

    expect(open.mock.calls).toStrictEqual([
      ['Konkurrenzen konnten nicht abgerufen werden.'],
      ['Spiele konnten nicht abgerufen werden.'],
    ]);
  });
});
