import { ResultActionsUnion, ResultActionTypes } from './result.actions';
import { Match } from '../../shared/data/match.model';
import { MatchState } from '../../shared/data/matchstate.model';

export interface ResultState {
  resultMatches: Match[];
  resultMatchesLoading: boolean;
}

const initialState: ResultState = {
  resultMatches: [],
  resultMatchesLoading: false,
};

export function reduceResultState(state: ResultState = initialState, action: ResultActionsUnion) {
  function unionArrays(arr1: Match[], arr2: Match[]) {
    const union = arr1.concat(arr2);

    for (let i = 0; i < union.length; i++) {
      for (let j = i + 1; j < union.length; j++) {
        if (union[i].id === union[j].id) {
          union.splice(j, 1);
          j--;
        }
      }
    }

    return union;
  }

  switch (action.type) {
    case ResultActionTypes.Load:
      return {
        ...state,
        resultMatchesLoading: true,
      };
    case ResultActionTypes.LoadSuccess:
      return {
        ...state,
        resultMatchesLoading: false,
        resultMatches: action.payload,
      };
    case ResultActionTypes.LoadError:
      return {
        ...state,
        resultMatchesLoading: false,
      };
    case ResultActionTypes.UpdateResult:
      return {
        ...state,
        resultMatchesLoading: false,
        resultMatches: unionArrays(action.payload, state.resultMatches).filter(
          (match) => match.state === MatchState[MatchState.Finished]
        ),
      };
    default:
      return state;
  }
}

export const getResultMatches = (state: ResultState) => state.resultMatches;
export const getResultMatchesLoading = (state: ResultState) => state.resultMatchesLoading;
