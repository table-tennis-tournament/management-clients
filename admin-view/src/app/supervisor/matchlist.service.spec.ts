import { describeRequests } from '../testing/http-testing';
import { MatchListService } from './matchlist.service';

describeRequests(MatchListService, [
  {
    call: (s) => s.loadAllMatchListItems(),
    method: 'GET',
    url: '/api/v2/matchlist/all',
    body: null,
    response: [
      { uuid: 'a', matchIds: [1, 2], asGroup: 7, position: 0 },
      { uuid: 'b', matchIds: [3], asGroup: null, position: 1 },
    ],
    // the backend entry becomes a MatchList; the matches are joined from the matches state later
    emitted: [
      { matchListItem: { id: 'a', matchIds: [1, 2], position: 0, group: 7 }, matchinfo: [] },
      { matchListItem: { id: 'b', matchIds: [3], position: 1, group: null }, matchinfo: [] },
    ],
  },
  {
    call: (s) => s.assignToMatchList({ matchIds: [1, 2], group: 7, position: 3 }),
    method: 'POST',
    url: '/api/v2/matchlist/add',
    body: { matchIds: [1, 2], asGroup: 7, position: 3 },
  },
  { call: (s) => s.deleteMatchListItem('a'), method: 'DELETE', url: '/api/v2/matchlist/a', body: null },
  {
    call: (s) => s.moveMatchListItem({ id: 'a', position: 2 }),
    method: 'POST',
    url: '/api/v2/matchlist/move/a/2',
    body: null,
  },
]);
