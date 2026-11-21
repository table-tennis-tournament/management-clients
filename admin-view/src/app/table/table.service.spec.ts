import { describeRequests } from '../testing/http-testing';
import { TableService } from './table.service';

const tables = [{ id: 1, number: 1, isLocked: false, matches: [] }];

describeRequests(
  TableService,
  [
    { call: (s) => s.getAllTables(), method: 'GET', url: '/api/v2/table/all', body: null, response: tables },
    { call: (s) => s.lockTable(3), method: 'POST', url: '/api/v2/table/3/lock', body: null },
    { call: (s) => s.unLockTable(3), method: 'POST', url: '/api/v2/table/3/unlock', body: null },
    { call: (s) => s.getFreeTables(), method: 'GET', url: '/api/v2/table/free', body: null, response: tables },
  ],
  // TableService is not providedIn root
  [TableService]
);
