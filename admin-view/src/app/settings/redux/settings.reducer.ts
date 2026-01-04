import { Settings, TypeColorMap } from '../settings.model';
import { SettingsActionTypes, SettingsActionUnion } from './settings.actions';
import { ALWAYS_PRINT_SETTING, AUTOSTART_SETTING, PRINTER_NAME_SETTING } from '../settings.coonstants';

export interface SettingsState {
  typeColor: string[];
  typeColors: TypeColorMap;
  settings: Settings[];
  printers: string[];
  settingsLoading: boolean;
}

const initialState: SettingsState = {
  typeColor: [
    'brown darken-4',
    'herren-d-einzel  white-text',
    'herren-d-doppel',
    'herren-b-einzel white-text',
    'herren-b-doppel',
    'damen-a-einzel white-text',
    'damen-a-doppel',
    'herren-c-einzel white-text',
    'herren-c-doppel',
    'herren-a-einzel white-text',
    'herren-a-doppel',
    'jungen-c-einzel white-text',
    'jungen-c-doppel',
    'maedchen-c-einzel white-text',
    'maedchen-c-doppel',
    'maedchen-a-einzel white-text',
    'maedchen-a-doppel',
    'jungen-a-einzel white-text',
    'jungen-a-doppel',
    'senioren-50-einzel white-text',
    'senioren-50-doppel',
    'deep-purple darken-4 white-text',
    'deep-purple',
    'light-green darken-1 white-text',
    'green',
    'red lighten-3 white-text',
    'pink',
    'grey white-text',
    'grey darken-3',
    'blue darken-1 white-text',
    'indigo'
  ],
  typeColors: {},
  'settings': [],
  'printers': [],
  'settingsLoading': false
};

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
    case SettingsActionTypes.LoadPrintersSuccess:
      return {
        ...state,
        printers: action.payload
      };
    case SettingsActionTypes.SaveAssignAutomaticallySuccess:
      return {
        ...state,
        settings: state.settings.map((setting) => {
          if (setting.key === AUTOSTART_SETTING) {
            return {
              key: AUTOSTART_SETTING,
              value: action.payload
            };
          }
          return setting;
        })
      };
    case SettingsActionTypes.SavePrintOnAssignSuccess:
      return {
        ...state,
        settings: state.settings.map((setting) => {
          if (setting.key === ALWAYS_PRINT_SETTING) {
            return {
              key: ALWAYS_PRINT_SETTING,
              value: action.payload
            };
          }
          return setting;
        })
      };
    case SettingsActionTypes.SetPrinterSuccess:
      return {
        ...state,
        settings: state.settings.map((setting) => {
          if (setting.key === PRINTER_NAME_SETTING) {
            return {
              key: PRINTER_NAME_SETTING,
              value: action.payload
            };
          }
          return setting;
        })
      };
    case SettingsActionTypes.LoadTypeColorsSuccess:
      return {
        ...state,
        typeColors: action.payload
      };
    case SettingsActionTypes.SaveTypeColorSuccess:
      return {
        ...state,
        typeColors: {
          ...state.typeColors,
          [action.payload.typeId]: action.payload.colorData
        }
      };
    case SettingsActionTypes.SetBulkTypeColorsSuccess:
      return {
        ...state,
        typeColors: action.payload
      };
    default:
      return state;
  }
}

export const getSettings = (state: SettingsState) => state.settings;
export const getSettingsLoading = (state: SettingsState) => state.settingsLoading;
export const getTypeColor = (state: SettingsState) => state.typeColor;
export const getTypeColors = (state: SettingsState) => state.typeColors;
export const getPrinters = (state: SettingsState) => state.printers;
