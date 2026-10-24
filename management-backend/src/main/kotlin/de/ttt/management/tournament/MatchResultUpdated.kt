package de.ttt.management.tournament

/**
 * Published when an interim set result is recorded for a match that is still being played.
 */
data class MatchResultUpdated(
    val matchId: Long,
    val sets1: Int,
    val sets2: Int
)
