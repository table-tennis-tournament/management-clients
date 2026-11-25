package de.ttt.management.tournament

/**
 * Published whenever the queue (MatchList) changes: an entry is added, removed or reordered.
 * Carries the full, ordered queue so consumers can refresh their view.
 */
data class MatchListChanged(
    val entries: List<Entry>,
    /** Every match the change concerns: the queued ones and those just added to or removed from the queue. */
    val matchIds: List<Long> = entries.flatMap { it.matchIds },
    /** The disciplines of [matchIds]. */
    val typeIds: List<Long> = emptyList()
) {
    data class Entry(
        val uuid: String,
        val matchIds: List<Long>,
        val asGroup: Long?,
        val position: Int
    )
}
