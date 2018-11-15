import {LoadTables, LoadTablesError, LoadTablesSuccess, LockTable, LockTableError, LockTableSuccess} from './table.actions';
import {reduceTableState, TableState} from './table.reducer';
import {TableTestData} from './test-data';

const initialState: TableState = Object.freeze({
    tables: [],
    tablesLoading: false
});

const someTableTestData = TableTestData.twoTables;
const secondTableLocked = TableTestData.twoTablesSecondLocked;

describe('the table reducer', () => {
    it('should handle the LoadTable action correctly', () => {
        let expectedState = {
            ...initialState,
            tablesLoading: true
        };

        let newState = reduceTableState(initialState, new LoadTables(null));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the LoadTablesSuccess action correctly', () => {
        let expectedState = {
            ...initialState,
            tables: someTableTestData,
            tablesLoading: false
        };

        let newState = reduceTableState(initialState, new LoadTablesSuccess(someTableTestData));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the LoadTablesError action correctly', () => {
        let expectedState = {
            ...initialState,
            tablesLoading: false
        };

        let newState = reduceTableState(initialState, new LoadTablesError(null));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the LockTable action correctly', () => {
        let expectedState = {
            ...initialState
        };

        let newState = reduceTableState(initialState, new LockTable(null));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the LockTablesSuccess action correctly', () => {
        const twoTableState = {
            tables : someTableTestData,
            tablesLoading: false
        };
        let expectedState = {
            ...initialState,
            tables: secondTableLocked,
        };

        let newState = reduceTableState(twoTableState, new LockTableSuccess(5));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the LockTablesError action correctly', () => {
        let expectedState = {
            ...initialState,
        };

        let newState = reduceTableState(initialState, new LockTableError(null));
        expect(newState).toEqual(expectedState);
    });
});