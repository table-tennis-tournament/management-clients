import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TableService } from './table.service';
describe('TableService', () => {
  let service: TableService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TableService]
    });
    service = TestBed.get(TableService);
  });
  it('can load instance', () => {
    expect(service).toBeTruthy();
  });
  it('loads tables for the table-manager', () => {
    expect(service.getTables()).toBeDefined();
  });
});
