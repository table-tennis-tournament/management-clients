package de.ttt.management.tournament

/**
 * Published when a match's result has been recorded and the match is completed.
 * Consumed by the outbound module to push the update to connected clients.
 * [tableId] is the table the match was played on.
 */
data class MatchCompleted(
    val matchId: Long,
    val winnerId: Long?,
    /** `true` for a Walkover: the winner's Side won without playing ("kampflos"). */
    val walkover: Boolean = false,
    val sets1: Int,
    val sets2: Int,
    val typeId: Long? = null,
    val tableId: Long? = null,
    /** Disciplines of other open matches of the same players, whose `isPlayable` this event changes. */
    val affectedTypeIds: List<Long> = emptyList()
)
