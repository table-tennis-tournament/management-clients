package de.ttt.management.tournament

/**
 * Published when a match's result has been recorded and the match is completed.
 * Consumed by the outbound module to push the update to connected clients.
 * [tableId] is the table the match was played on.
 */
data class MatchCompleted(
    val matchId: Long,
    val winnerId: Long?,
    val sets1: Int,
    val sets2: Int,
    val typeId: Long? = null,
    val tableId: Long? = null
)
