import { CallerActionTypes, CallerActionUnion } from './caller.actions';
import { Player } from '../../shared/data/player.model';
import { MatchAggregate } from '../../shared/data/match.aggregate';

export interface CallerState {
  referees: Player[];
  refereesLoading: boolean;
  callerMatches: MatchAggregate[];
  selectedMatchAggregate: MatchAggregate;
  selectedSecondCallMatchAggregate: MatchAggregate;
  secondCallMatches: MatchAggregate[];
  thirdCallMatches: MatchAggregate[];
}

const initialState: CallerState = {
  referees: [],
  refereesLoading: false,
  callerMatches: [],
  selectedMatchAggregate: null,
  selectedSecondCallMatchAggregate: null,
  secondCallMatches: [],
  thirdCallMatches: [],
};

export function reduceCallerState(state: CallerState = initialState, action: CallerActionUnion) {
  switch (action.type) {
    case CallerActionTypes.Load:
      return {
        ...state,
        refereesLoading: true,
      };
    case CallerActionTypes.LoadSuccess:
      return {
        ...state,
        refereesLoading: false,
        callerMatches: action.payload,
      };
    case CallerActionTypes.LoadError:
      return {
        ...state,
        refereesLoading: false,
      };
    case CallerActionTypes.LoadReferees:
      return {
        ...state,
        refereesLoading: true,
      };
    case CallerActionTypes.LoadRefereesSuccess:
      return {
        ...state,
        refereesLoading: false,
        referees: action.payload,
      };
    case CallerActionTypes.LoadRefereesError:
      return {
        ...state,
        refereesLoading: false,
      };
    case CallerActionTypes.LoadSecondCallMatchesSuccess:
      return withSelectedRepeatCall({
        ...state,
        secondCallMatches: action.payload,
      });
    case CallerActionTypes.LoadThirdCallMatchesSuccess:
      return withSelectedRepeatCall({
        ...state,
        thirdCallMatches: action.payload,
      });
    case CallerActionTypes.SetSelectedMatchAggregate:
      return {
        ...state,
        selectedMatchAggregate: action.payload,
      };
    case CallerActionTypes.SetSelectedSecondCallMatchAggregate:
      return {
        ...state,
        selectedSecondCallMatchAggregate: action.payload,
      };
    default:
      return state;
  }
}

/** The match ids of an aggregate, to find it again in a reloaded list. */
const matchIdsOf = (aggregate: MatchAggregate) => (aggregate.matches ?? []).map((match) => match.id).join(',');

/**
 * Keeps the selected Second or Third call while it still waits to be announced (taking its reloaded data),
 * otherwise selects the next one: the Second calls first, then the Third calls, as they were requested.
 */
function withSelectedRepeatCall(state: CallerState): CallerState {
  const waiting = [...(state.secondCallMatches ?? []), ...(state.thirdCallMatches ?? [])];
  const selected = state.selectedSecondCallMatchAggregate;
  const stillWaiting = selected && waiting.find((aggregate) => matchIdsOf(aggregate) === matchIdsOf(selected));
  return { ...state, selectedSecondCallMatchAggregate: stillWaiting ?? waiting[0] ?? null };
}

export const getReferees = (state: CallerState) => state.referees;
export const getRefereesLoading = (state: CallerState) => state.refereesLoading;
export const getSelectedMatchAggregate = (state: CallerState) => state.selectedMatchAggregate;
export const getSelectedSecondCallMatchAggregate = (state: CallerState) => state.selectedSecondCallMatchAggregate;
export const getCallerMatchAggregates = (state: CallerState) => state.callerMatches;
export const getSecondCallMatchAggregates = (state: CallerState) => state.secondCallMatches;
export const getThirdCallMatchAggregates = (state: CallerState) => state.thirdCallMatches;
