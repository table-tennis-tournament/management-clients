import { describeRequests } from '../testing/http-testing';
import { SettingsService } from './settings.service';

const colors = { 1: { bgColor: '#fff', textColor: '#000' } };

describeRequests(SettingsService, [
  {
    call: (s) => s.loadSettings(),
    method: 'GET',
    url: '/api/v2/settings/all',
    body: null,
    response: [{ key: 'autoStart', value: false }],
  },
  { call: (s) => s.loadPrinters(), method: 'GET', url: '/api/v2/printer/all', body: null, response: ['PDF'] },
  {
    call: (s) => s.saveAssignAutomatically(true),
    method: 'POST',
    url: '/api/v2/matchlist/active/true',
    body: null,
  },
  {
    call: (s) => s.savePrintOnAssign(false),
    method: 'POST',
    url: '/api/v2/printer/setprintonstart/false',
    body: null,
  },
  { call: (s) => s.setPrinter('PDF'), method: 'POST', url: '/api/v2/printer/set/PDF', body: null },
  { call: (s) => s.loadTypeColors(), method: 'GET', url: '/api/v2/disciplines/colors', body: null, response: colors },
  {
    call: (s) => s.saveTypeColor(1, { bgColor: '#fff', textColor: '#000' }),
    method: 'POST',
    url: '/api/v2/disciplines/1/color',
    body: { bgColor: '#fff', textColor: '#000' },
  },
  { call: (s) => s.setBulkTypeColors(colors), method: 'PUT', url: '/api/v2/disciplines/colors', body: colors },
]);
