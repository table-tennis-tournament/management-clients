package de.ttt.management.tournament

/**
 * Published when a match is assigned to a table (but not yet started).
 */
data class MatchAssigned(
    val matchId: Long,
    val tableId: Long
)

/**
 * Published when a match is started on a table.
 */
data class MatchStarted(
    val matchId: Long,
    val tableId: Long
)

/**
 * Published when a match is freed (walkover / finished without a played result).
 */
data class MatchFreed(
    val matchId: Long
)

/**
 * Published when a match is taken back to the open state.
 */
data class MatchTakenBack(
    val matchId: Long
)
