import { relevanceOf } from './update-events';
import { Table } from './tt-table/table.model';

const tables = (...ids: number[]): Table[] => ids.map((id) => ({ table_id: id as any, matches: [] }));

describe('relevanceOf', () => {
  it('reloads when a displayed table is in the scope', () => {
    const message = { type: 'MATCH_STARTED', scope: { matchIds: [1], tableIds: [3] }, payload: {} };
    expect(relevanceOf(message, tables(1, 2, 3))).toBe('reload');
  });

  it('ignores events for tables of other table managers', () => {
    const message = { type: 'MATCH_STARTED', scope: { matchIds: [1], tableIds: [9] }, payload: {} };
    expect(relevanceOf(message, tables(1, 2, 3))).toBe('ignore');
  });

  it('ignores a match event that is not on any table', () => {
    const message = { type: 'MATCH_FREED', scope: { matchIds: [1], tableIds: [] }, payload: {} };
    expect(relevanceOf(message, tables(1, 2, 3))).toBe('ignore');
  });

  it('reloads when the table the match was taken back from is displayed', () => {
    const message = { type: 'MATCH_TAKEN_BACK', scope: { matchIds: [1], tableIds: [2] }, payload: {} };
    expect(relevanceOf(message, tables(1, 2, 3))).toBe('reload');
  });

  it('reloads when the event carries no scope', () => {
    expect(relevanceOf({ type: 'MATCH_COMPLETED', payload: {} }, tables(1))).toBe('reload');
  });

  it('reloads while the tables are not loaded yet', () => {
    const message = { type: 'MATCH_COMPLETED', scope: { tableIds: [9] }, payload: {} };
    expect(relevanceOf(message, [])).toBe('reload');
  });

  it('reloads when the displayed tables carry no usable id', () => {
    const message = { type: 'MATCH_STARTED', scope: { tableIds: [3] }, payload: {} };
    expect(relevanceOf(message, [{ matches: [] }, { table_id: null as any, matches: [] }])).toBe('reload');
  });

  it('reloads for a deleted match, which does not name its table', () => {
    const message = { type: 'MATCH_DELETED', scope: { matchIds: [1] }, payload: {} };
    expect(relevanceOf(message, tables(1))).toBe('reload');
  });

  it('ignores table lock events, which the tablemanager does not render', () => {
    expect(relevanceOf({ type: 'TABLE_LOCKED', scope: { tableIds: [1] }, payload: {} }, tables(1))).toBe('ignore');
    expect(relevanceOf({ type: 'TABLE_UNLOCKED', scope: { tableIds: [1] }, payload: {} }, tables(1))).toBe('ignore');
  });

  it('reports event types it does not know', () => {
    expect(relevanceOf({ type: 'SOMETHING_NEW', payload: {} }, tables(1))).toBe('unknown');
  });
});
