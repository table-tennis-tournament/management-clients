import { describeRequests } from '../testing/http-testing';
import { DisciplineService } from './discipline.service';

describeRequests(DisciplineService, [
  {
    call: (s) => s.loadAllDisciplines(),
    method: 'GET',
    url: '/api/v2/types/all',
    body: null,
    response: [{ id: 1, name: 'Herren' }],
  },
]);
