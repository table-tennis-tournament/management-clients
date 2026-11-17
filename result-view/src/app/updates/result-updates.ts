import { touchesAny, UpdateClientConfig } from '../shared/update-events/update-events';

/** The pieces of state result-view can reload. */
export type ResultReloadTarget = 'types' | 'matches';

/**
 * result-view shows the results of one discipline. Only events that change a result reload it, and only when
 * their scope names the displayed discipline. Assignments, starts and calls do not change
 * a result. The discipline list changes with no event, so it is only reloaded on a resynchronization.
 */
export function resultUpdates(displayedTypeId: () => number | null): UpdateClientConfig<ResultReloadTarget> {
  return {
    topics: ['matches'],
    reloads: {
      MATCH_RESULT_UPDATED: ['matches'],
      MATCH_COMPLETED: ['matches'],
      MATCH_FREED: ['matches'],
      MATCH_TAKEN_BACK: ['matches'],
      MATCH_DELETED: ['matches'],
    },
    ignored: ['MATCH_ASSIGNED', 'MATCH_STARTED', 'MATCH_CALLED'],
    // reloading the types also reloads the matches of the displayed discipline
    resync: ['types'],
    isRelevant: (_target, scope) => {
      const typeId = displayedTypeId();
      return typeId == null || touchesAny(scope.typeIds, [typeId]);
    },
  };
}
