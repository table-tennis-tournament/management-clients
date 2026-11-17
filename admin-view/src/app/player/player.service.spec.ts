import { describeRequests } from '../testing/http-testing';
import { PlayerService } from './player.service';

describeRequests(PlayerService, [
  { call: (s) => s.getAllPlayers(), method: 'GET', url: '/api/v2/players/all', body: null, response: [{ id: 1 }] },
  {
    call: (s) => s.getAllPlayerTypes(),
    method: 'GET',
    url: '/api/v2/players/allTypePerPlayer',
    body: null,
    response: [{ id: 2 }],
  },
  {
    call: (s) => s.setPlayerPaid({ id: 5, type: { id: 1 }, paid: true }),
    method: 'POST',
    url: '/api/v2/players/5/paid?paid=true',
    body: null,
  },
]);
