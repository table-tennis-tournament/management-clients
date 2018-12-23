import {settingsTestData} from './test.data';
import {reduceSettingsState, SettingsState} from './settings.reducer';
import {
    LoadPrintersSuccess,
    LoadSettings,
    LoadSettingsError,
    LoadSettingsSuccess,
    SaveAssignAutomaticallySuccess,
    SavePrintOnAssignSuccess,
    SetPrinterSuccess
} from './settings.actions';
import {ALWAYS_PRINT_SETTING, AUTOSTART_SETTING, PRINTER_NAME_SETTING} from '../settings.coonstants';

const initialState: SettingsState = Object.freeze({
    typeColor: [],
    settings: [],
    printers: [],
    settingsLoading: false
});

const settingsData = settingsTestData;

describe('the settings reducer', () => {
    it('should handle the LoadSettings action correctly', () => {
        const expectedState = {
            ...initialState,
            settingsLoading: true
        };

        const newState = reduceSettingsState(initialState, new LoadSettings());
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


    it('should handle the LoadPrintersSuccess action correctly', () => {
        const printers = ['first printer', 'second printer'];
        const expectedState = {
            ...initialState,
            printers: printers
        };

        const newState = reduceSettingsState(initialState, new LoadPrintersSuccess(printers));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the SaveAssignAutomaticallySuccess action correctly', () => {
        const startState = {
            ...initialState,
            settings: settingsTestData
        };
        const expectedState = {
            ...initialState,
            settings: [
                {'key': PRINTER_NAME_SETTING, 'value': 'Microsoft Print to PDF'},
                {'key': ALWAYS_PRINT_SETTING, 'value': true},
                {'key': AUTOSTART_SETTING, 'value': true}
            ]
        };

        const newState = reduceSettingsState(startState, new SaveAssignAutomaticallySuccess(true));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the SavePrintOnAssignSuccess action correctly', () => {
        const startState = {
            ...initialState,
            settings: settingsTestData
        };
        const expectedState = {
            ...initialState,
            settings: [
                {'key': PRINTER_NAME_SETTING, 'value': 'Microsoft Print to PDF'},
                {'key': ALWAYS_PRINT_SETTING, 'value': false},
                {'key': AUTOSTART_SETTING, 'value': false}
            ]
        };

        const newState = reduceSettingsState(startState, new SavePrintOnAssignSuccess(false));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the SetPrinterSuccess action correctly', () => {
        const startState = {
            ...initialState,
            settings: settingsTestData
        };
        const expectedState = {
            ...initialState,
            settings: [
                {'key': PRINTER_NAME_SETTING, 'value': 'MyPrinterName'},
                {'key': ALWAYS_PRINT_SETTING, 'value': true},
                {'key': AUTOSTART_SETTING, 'value': false}
            ]
        };

        const newState = reduceSettingsState(startState, new SetPrinterSuccess('MyPrinterName'));
        expect(newState).toEqual(expectedState);
    });

});
