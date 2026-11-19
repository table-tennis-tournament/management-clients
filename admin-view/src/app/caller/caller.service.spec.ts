import { describeRequests } from '../testing/http-testing';
import { CallerService } from './caller.service';

const aggregates = [{ id: 1 }];

describeRequests(CallerService, [
  {
    call: (s) => s.loadMatchAggregateForCaller(),
    method: 'GET',
    url: '/api/v2/matchaggregates/caller',
    body: null,
    response: aggregates,
  },
  {
    call: (s) => s.loadSecondCallMatches(),
    method: 'GET',
    url: '/api/v2/matchaggregates/secondCall',
    body: null,
    response: aggregates,
  },
  {
    call: (s) => s.loadThirdCallMatches(),
    method: 'GET',
    url: '/api/v2/matchaggregates/thirdCall',
    body: null,
    response: aggregates,
  },
  { call: (s) => s.callMatch([1, 2]), method: 'POST', url: '/api/v2/match/call', body: [1, 2] },
  {
    call: (s) => s.announceRequestedCalls([3]),
    method: 'POST',
    url: '/api/v2/playercall/announce',
    body: [3],
  },
]);
