import {settingsTestData} from './test.data';
import {reduceSettingsState, SettingsState} from './settings.reducer';
import {LoadSettings, LoadSettingsError, LoadSettingsSuccess} from './settings.actions';

const initialState: SettingsState = Object.freeze({
        typeColor: [],
        settings: [],
        settingsLoading: false
    })
;

const settingsData = settingsTestData;

describe('the matchList reducer', () => {
    it('should handle the LoadSettings action correctly', () => {
        const expectedState = {
            ...initialState,
            settingsLoading: true
        };

        const newState = reduceSettingsState(initialState, new LoadSettings(null));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the LoadSettingsSuccess action correctly', () => {
        const expectedState = {
            ...initialState,
            settings: settingsData,
            settingsLoading: false
        };

        const newState = reduceSettingsState(initialState, new LoadSettingsSuccess(settingsData));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the LoadSettingsError action correctly', () => {
        const expectedState = {
            ...initialState,
            settingsLoading: false
        };

        const newState = reduceSettingsState(initialState, new LoadSettingsError(null));
        expect(newState).toEqual(expectedState);
    });

});
