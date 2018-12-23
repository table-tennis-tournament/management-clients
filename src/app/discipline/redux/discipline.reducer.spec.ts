import {DisciplineTestData} from './test-data';
import {DisciplineState, reduceDisciplineState} from './discipline.reducer';
import {LoadDiscipline, LoadDisciplineError, LoadDisciplineSuccess} from './discipline.actions';

const initialState: DisciplineState = Object.freeze({
    disciplines: [],
    disciplinesLoading: false
});

const disciplineTestData = DisciplineTestData;

describe('the discipline reducer', () => {
    it('should handle the LoadDiscipline action correctly', () => {
        const expectedState = {
            ...initialState,
            disciplinesLoading: true
        };

        const newState = reduceDisciplineState(initialState, new LoadDiscipline(null));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the LoadDisciplineSuccess action correctly', () => {
        const expectedState = {
            ...initialState,
            disciplines: disciplineTestData,
            disciplinesLoading: false
        };

        const newState = reduceDisciplineState(initialState, new LoadDisciplineSuccess(disciplineTestData));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the LoadDisciplineError action correctly', () => {
        const expectedState = {
            ...initialState,
            disciplinesLoading: false
        };

        const newState = reduceDisciplineState(initialState, new LoadDisciplineError(null));
        expect(newState).toEqual(expectedState);
    });

});
