import {Settings} from '../settings.model';
import {SettingsActionTypes, SettingsActionUnion} from './settings.actions';

export interface SettingsState {
    typeColor: string [];
    settings: Settings[];
    settingsLoading: boolean;
}

const initialState: SettingsState = {
        typeColor: ['brown darken-4',
            'amber darken-1  white-text',
            'orange',
            'light-green darken-1 white-text',
            'green',
            'red lighten-3 white-text',
            'pink',
            'grey white-text',
            'grey darken-3',
            'blue darken-1 white-text',
            'indigo',
            'amber darken-1 white-text',
            'orange',
            'light-green darken-1 white-text',
            'green',
            'red lighten-3 white-text',
            'pink',
            'grey white-text',
            'grey darken-3',
            'blue darken-1 white-text',
            'indigo',
            'amber darken-4 white-text',
            'orange',
            'light-green darken-1 white-text',
            'green',
            'red lighten-3 white-text',
            'pink',
            'grey white-text',
            'grey darken-3',
            'blue darken-1 white-text',
            'indigo',
        ],
        settings: [],
        settingsLoading: false
    }
;

export function reduceSettingsState(state: SettingsState = initialState, action: SettingsActionUnion) {
    switch (action.type) {
        case SettingsActionTypes.Load:
            return {
                ...state,
                settingsLoading: true
            };
        case SettingsActionTypes.LoadSuccess:
            return {
                ...state,
                settingsLoading: false,
                settings: action.payload
            };
        case SettingsActionTypes.LoadError:
            return {
                ...state,
                settingsLoading: false
            };
        default:
            return state;
    }

}

export const getSettings = (state: SettingsState) => state.settings;
export const getSettingsLoading = (state: SettingsState) => state.settingsLoading;
export const getTypeColor = (state: SettingsState) => state.typeColor;
