import { MatchActionsUnion, MatchActionTypes } from './match.actions';
import { Match } from '../../shared/data/match.model';
import { TableActionTypes } from '../../table/redux/table.actions';

export interface MatchesState {
  matches: Match[];
  matchesLoading: boolean;
}

const initialState: MatchesState = {
  matches: [],
  matchesLoading: false,
};

export function reduceMatchState(state: MatchesState = initialState, action: MatchActionsUnion) {
  switch (action.type) {
    case MatchActionTypes.Load:
      return {
        ...state,
        matchesLoading: true,
      };
    case MatchActionTypes.LoadSuccess:
      return {
        matchesLoading: false,
        matches: action.payload,
      };
    case MatchActionTypes.LoadError:
      return {
        ...state,
        matchesLoading: false,
      };
    case MatchActionTypes.UpdateSuccess:
      return {
        ...state,
        matches: state.matches.map((match) => {
          const matches = action.payload.filter((item) => item.id === match.id);
          if (matches.length > 0) {
            return matches[0];
          }
          return match;
        }),
      };
    default:
      return state;
  }
}

export const getMatches = (state: MatchesState) => state.matches;
export const getMatchesLoading = (state: MatchesState) => state.matchesLoading;
