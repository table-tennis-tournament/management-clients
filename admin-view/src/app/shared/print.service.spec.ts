import { describeRequests } from '../testing/http-testing';
import { PrintService } from './print.service';

describeRequests(PrintService, [
  { call: (s) => s.printMatch(4), method: 'POST', url: '/api/v2/printer/print/4', body: null },
]);
