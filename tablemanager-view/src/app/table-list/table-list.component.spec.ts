import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { TableListComponent } from './table-list.component';
import * as MatchActions from './match/redux/match.actions';
import * as TableActions from './redux/table-list.actions';

describe('the table list of a table manager', () => {
  let dispatched: unknown[];
  let list: TableListComponent;

  beforeEach(() => {
    dispatched = [];
    TestBed.configureTestingModule({
      providers: [
        { provide: Store, useValue: { dispatch: (a: unknown) => dispatched.push(a), pipe: () => of([]) } },
        { provide: ActivatedRoute, useValue: { data: of({ tableManagerId: 4 }) } },
      ],
    });
    list = TestBed.runInInjectionContext(() => new TableListComponent());
  });

  it('loads the tables of the table manager of its route', () => {
    list.ngOnInit();

    expect(dispatched).toStrictEqual([TableActions.loadTables({ tableManagerId: 4 })]);
  });

  it('turns the events of a table card into commands', () => {
    const result = { games: [{ score_player_a: 11, score_player_b: 3 }] };

    list.onUpdateMatchResult({ matchId: 7, result });
    list.onFinishMatch({ match_id: 7, result });
    list.onMatchOnTableStarted({ tableId: 30, matchId: 8 });
    list.onCallPlayersForMatch({ matchId: 8, playerIds: [2] });
    list.onTakeBackMatch({ matchId: 7 });

    expect(dispatched).toStrictEqual([
      MatchActions.updateMatchResult({ matchId: 7, result }),
      MatchActions.finishMatch({ matchId: 7, result }),
      MatchActions.startMatchOnTable({ tableId: 30, matchId: 8 }),
      MatchActions.callPlayerForMatch({ matchId: 8, playerIds: [2] }),
      MatchActions.takeBackMatch({ matchId: 7 }),
    ]);
  });
});
