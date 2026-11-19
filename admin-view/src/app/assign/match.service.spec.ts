import { describeRequests } from '../testing/http-testing';
import { MatchService } from './match.service';

const matches = [{ id: 1 }];

describeRequests(MatchService, [
  { call: (s) => s.freeMatches([1, 2]), method: 'POST', url: '/api/v2/match/free', body: [1, 2] },
  { call: (s) => s.takeBackMatches([3]), method: 'POST', url: '/api/v2/match/takeBack', body: [3] },
  {
    call: (s) => s.assignToSecondTable(4, [5, 6]),
    method: 'POST',
    url: '/api/v2/match/matchtosecondtable/4',
    body: [5, 6],
  },
  {
    call: (s) =>
      s.resultForMatch({
        match: { id: 7 },
        result: [
          { pointsPlayer1: 11, pointsPlayer2: 5 },
          { pointsPlayer1: 9, pointsPlayer2: 11 },
        ],
      }),
    method: 'POST',
    url: '/api/v2/match/setResult/7',
    body: [
      [11, 5],
      [9, 11],
    ],
  },
  {
    call: (s) =>
      s.resultForMatch({
        match: { id: 7 },
        result: [
          { pointsPlayer1: 0, pointsPlayer2: 11 },
          { pointsPlayer1: 0, pointsPlayer2: 11 },
          { pointsPlayer1: 0, pointsPlayer2: 11 },
        ],
        kampflos: true,
      }),
    method: 'POST',
    url: '/api/v2/match/setResult/7?kampflos=true',
    body: [
      [0, 11],
      [0, 11],
      [0, 11],
    ],
  },
  { call: (s) => s.loadAllMatches(), method: 'GET', url: '/api/v2/match/all', body: null, response: matches },
  {
    call: (s) => s.assignMatchToTable({ tableNr: 3, tableId: 30, matchIds: [8] }),
    method: 'POST',
    url: '/api/v2/match/matchtotable/3',
    body: [8],
  },
  { call: (s) => s.reloadMatchesFromDb(), method: 'GET', url: '/api/v2/match/loadnew', body: null },
  { call: (s) => s.loadPlayedMatches(), method: 'GET', url: '/api/v2/match/played/all', body: null, response: matches },
  {
    call: (s) => s.removeMatchFromTable({ tableId: 2, matchIds: [9] }),
    method: 'POST',
    url: '/api/v2/match/remove/2',
    body: [9],
  },
]);
