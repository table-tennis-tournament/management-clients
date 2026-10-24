package de.ttt.management.tournament.domain

/**
 * Pure selection logic for auto-start: decides which queue entry to start next on a free table,
 * replicating the legacy backend's `filterFirst` / `isPossibleMatch` player-blocking heuristics.
 */
object AutoStartHeuristic {

    /**
     * Returns the next [MatchList] entry to start, or `null` if none is eligible.
     *
     * - [filterFirst] greedily skips entries whose players already appear in an earlier entry.
     * - An entry is *possible* when every match is [TournamentMatch.isPlayable].
     * - An entry is skipped when it is blocked by an impossible entry earlier in the queue that
     *   shares one of its players.
     */
    fun selectNext(entries: List<MatchList>, matchesById: Map<Long, TournamentMatch>): MatchList? {
        val ordered = entries.sortedBy { it.position }
        val filtered = filterFirst(ordered, matchesById)
        val impossible = filtered.filterNot { isPossibleMatch(it, matchesById) }
        val candidates = filtered.filter { entry ->
            isPossibleMatch(entry, matchesById) && impossible.all { imp ->
                imp.position > entry.position || noSharedPlayer(imp, entry, matchesById)
            }
        }
        return candidates.minByOrNull { it.position }
    }

    fun filterFirst(entries: List<MatchList>, matchesById: Map<Long, TournamentMatch>): List<MatchList> {
        val result = mutableListOf<MatchList>()
        val used = mutableSetOf<Long>()
        for (entry in entries) {
            val playerIds = playerIdsOf(entry, matchesById)
            if (playerIds.any { it in used }) continue
            result.add(entry)
            used.addAll(playerIds)
        }
        return result
    }

    fun isPossibleMatch(entry: MatchList, matchesById: Map<Long, TournamentMatch>): Boolean =
        entry.matchIds.all { id -> matchesById[id]?.isPlayableAgainst(matchesById.values) == true }

    private fun noSharedPlayer(a: MatchList, b: MatchList, matchesById: Map<Long, TournamentMatch>): Boolean =
        playerIdsOf(a, matchesById).none { it in playerIdsOf(b, matchesById) }

    private fun playerIdsOf(entry: MatchList, matchesById: Map<Long, TournamentMatch>): Set<Long> =
        entry.matchIds.flatMap { id ->
            val match = matchesById[id]
            (match?.team1.orEmpty() + match?.team2.orEmpty()).mapNotNull { it.id }
        }.toSet()
}
