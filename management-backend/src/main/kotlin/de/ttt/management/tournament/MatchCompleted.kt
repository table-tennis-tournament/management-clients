package de.ttt.management.tournament

/**
 * Published when a match's result has been recorded and the match is completed.
 * Consumed by the outbound module to push the update to connected clients.
 */
data class MatchCompleted(
    val matchId: Long,
    val winnerId: Long?,
    val sets1: Int,
    val sets2: Int
)
