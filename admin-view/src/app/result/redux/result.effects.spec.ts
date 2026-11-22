import { Mock } from 'vitest';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ToastrService } from 'ngx-toastr';
import { of, ReplaySubject, throwError } from 'rxjs';
import { emittedBy } from '../../testing/effects-testing';
import { MatchService } from '../../assign/match.service';
import { ResultEffects } from './result.effects';
import { LoadResults, LoadResultsError, LoadResultsSuccess } from './result.actions';

describe('the result effects', () => {
  let actions: ReplaySubject<any>;
  let effects: ResultEffects;
  let matchService: MatchService;
  let toast: { error: Mock };

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    toast = { error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        ResultEffects,
        MatchService,
        { provide: ToastrService, useValue: toast },
        HttpClient,
        HttpHandler,
        provideMockActions(() => actions),
      ],
    });
    effects = TestBed.inject(ResultEffects);
    matchService = TestBed.inject(MatchService);
  });

  it('loads the played matches', async () => {
    const matches = [{ id: 4 }] as any;
    const load = vi.spyOn(matchService, 'loadPlayedMatches').mockReturnValue(of(matches));

    expect(await emittedBy(effects.loadResults, actions, new LoadResults(null))).toStrictEqual([
      new LoadResultsSuccess(matches),
    ]);
    expect(load.mock.calls).toEqual([[]]);
  });

  it('shows an error when the played matches do not load', async () => {
    const error = { msg: 'Error' };
    vi.spyOn(matchService, 'loadPlayedMatches').mockReturnValue(throwError(() => error));

    expect(await emittedBy(effects.loadResults, actions, new LoadResults(null))).toStrictEqual([
      new LoadResultsError(error),
    ]);
    expect(toast.error.mock.calls).toEqual([['Fehler beim Laden der Ergebnisliste']]);
  });
});
