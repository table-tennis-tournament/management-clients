import { Action } from '@ngrx/store';
import { MatchActionsUnion, MatchActionTypes } from './match.actions';

import { Match } from '../../shared/data/match.model';

export interface MatchesState {
  matches: Match[];
  matchesLoading: boolean;
}

const initialState: MatchesState = {
  matches: [],
  matchesLoading: false,
};

/** Every action reaches the reducer; it handles those of [MatchActionsUnion]. */
export function reduceMatchState(state: MatchesState = initialState, incoming: Action): MatchesState {
  const action = incoming as MatchActionsUnion;
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
    default:
      return state;
  }
}

export const getMatches = (state: MatchesState) => state.matches;
export const getMatchesLoading = (state: MatchesState) => state.matchesLoading;
