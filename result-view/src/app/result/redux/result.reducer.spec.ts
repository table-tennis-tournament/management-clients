import { describe, expect, it } from 'vitest';
import * as ResultActions from './result.actions';
import { initialState, reducer } from './result.reducer';

const herren = { id: 1, name: 'Herren' };
const damen = { id: 2, name: 'Damen' };

describe('the types reducer', () => {
  it('selects the first discipline when nothing is selected yet', () => {
    expect(reducer(initialState, ResultActions.loadTypesSuccess({ types: [herren, damen] }))).toStrictEqual({
      types: [herren, damen],
      selectedTypeId: 1,
    });
  });

  // regression: every reload of the types used to jump back to the first discipline
  it('keeps the selected discipline when the types are reloaded', () => {
    const selected = reducer(initialState, ResultActions.selectType({ typeId: 2 }));
    expect(reducer(selected, ResultActions.loadTypesSuccess({ types: [herren, damen] }))).toStrictEqual({
      types: [herren, damen],
      selectedTypeId: 2,
    });
  });

  it('falls back to the first discipline when the selected one is gone', () => {
    const selected = reducer(initialState, ResultActions.selectType({ typeId: 3 }));
    expect(reducer(selected, ResultActions.loadTypesSuccess({ types: [herren, damen] })).selectedTypeId).toBe(1);
  });

  it('selects nothing without disciplines', () => {
    expect(reducer(initialState, ResultActions.loadTypesSuccess({ types: [] })).selectedTypeId).toBeNull();
  });
});
