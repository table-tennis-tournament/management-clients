import { targetsFor, UpdateEvent } from '../shared/update-events/update-events';
import { Table } from './tt-table/table.model';
import { tablemanagerUpdates } from './update-events';

const tables = (...ids: number[]): Table[] => ids.map((id) => ({ table_id: id, matches: [] }));

/** The reload targets of [event] while [displayed] tables are shown. */
const reloadsFor = (event: UpdateEvent, displayed: Table[]) =>
  targetsFor(
    tablemanagerUpdates(() => displayed),
    event
  );

describe('the tablemanager update events', () => {
  it('listens to the tables and matches topics only', () => {
    expect(tablemanagerUpdates(() => []).topics).toEqual(['tables', 'matches']);
  });

  it('reloads when a displayed table is in the scope', () => {
    const event = { type: 'MATCH_STARTED', scope: { matchIds: [1], tableIds: [3] } };
    expect(reloadsFor(event, tables(1, 2, 3))).toEqual(['tables']);
  });

  it('ignores events for tables of other table managers', () => {
    const event = { type: 'MATCH_STARTED', scope: { matchIds: [1], tableIds: [9] } };
    expect(reloadsFor(event, tables(1, 2, 3))).toEqual([]);
  });

  it('ignores a match event that is not on any table', () => {
    const event = { type: 'MATCH_FREED', scope: { matchIds: [1], tableIds: [] } };
    expect(reloadsFor(event, tables(1, 2, 3))).toEqual([]);
  });

  it('reloads when the table the match was taken back from is displayed', () => {
    const event = { type: 'MATCH_TAKEN_BACK', scope: { matchIds: [1], tableIds: [2] } };
    expect(reloadsFor(event, tables(1, 2, 3))).toEqual(['tables']);
  });

  it('reloads when the event carries no scope', () => {
    expect(reloadsFor({ type: 'MATCH_COMPLETED' }, tables(1))).toEqual(['tables']);
  });

  it('reloads while the tables are not loaded yet', () => {
    expect(reloadsFor({ type: 'MATCH_COMPLETED', scope: { tableIds: [9] } }, [])).toEqual(['tables']);
  });

  it('reloads when the displayed tables carry no usable id', () => {
    const event = { type: 'MATCH_STARTED', scope: { tableIds: [3] } };
    expect(reloadsFor(event, [{ matches: [] }, { table_id: null as any, matches: [] }])).toEqual(['tables']);
  });

  it('reloads for a match deleted from a displayed table, not from another one', () => {
    expect(reloadsFor({ type: 'MATCH_DELETED', scope: { matchIds: [1], tableIds: [1] } }, tables(1))).toEqual([
      'tables',
    ]);
    expect(reloadsFor({ type: 'MATCH_DELETED', scope: { matchIds: [1], tableIds: [9] } }, tables(1))).toEqual([]);
  });

  it('ignores table lock events, which the tablemanager does not render', () => {
    expect(reloadsFor({ type: 'TABLE_LOCKED', scope: { tableIds: [1] } }, tables(1))).toEqual([]);
    expect(reloadsFor({ type: 'TABLE_UNLOCKED', scope: { tableIds: [1] } }, tables(1))).toEqual([]);
  });
});
