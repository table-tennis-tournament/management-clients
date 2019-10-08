import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TableService } from './table.service';
import {Club} from './club.model';
import {Player} from './player.model';
import {Match} from './match.model';
import {Table} from './table.model';
xdescribe('TableService', () => {
  let service: TableService;
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TableService, HttpTestingController]
    });
    service = TestBed.get(TableService);
    httpMock = TestBed.get(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  });
  it('can load instance', () => {
    expect(service).toBeTruthy();
  });
  it('loads tables for the table-manager', () => {
   // httpMock.expectOne('/api/tables?table_manager=22');
    const dummyTables = [
      {
        table_id: 4711,
        current_match: {
          match_id: 815,
          player_a: {
            player_id: 1,
            first_name: 'Hans',
            last_name: 'Muster',
            club: {
              club_id: 1,
              name: 'BTV Basel'
            } as Club
          } as Player,
          player_b: {
            player_id: 2,
            first_name: 'Gabi',
            last_name: 'Meier',
            club: {
              club_id: 2,
              name: 'TTT Mühlhausen'
            } as Club
          } as Player,
          classification: 'beginners',
        } as Match
      } as Table
    ];

    service.getTables(22).subscribe(tables => {
      expect(tables.length).toEqual(dummyTables.length);
    });

    const req = httpMock.expectOne('/api/tables?table_manager=22');
    expect(req.request.method).toBe('GET');
    req.flush(dummyTables);
  });
});
