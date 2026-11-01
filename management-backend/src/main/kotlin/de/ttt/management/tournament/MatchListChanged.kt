package de.ttt.management.tournament

/**
 * Published whenever the queue (MatchList) changes: an entry is added, removed or reordered.
 * Carries the full, ordered queue so consumers can refresh their view.
 */
data class MatchListChanged(
    val entries: List<Entry>
) {
    data class Entry(
        val uuid: String,
        val matchIds: List<Long>,
        val asGroup: Long?,
        val position: Int
    )
}
