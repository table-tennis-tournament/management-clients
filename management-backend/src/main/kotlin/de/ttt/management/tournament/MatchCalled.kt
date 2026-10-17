package de.ttt.management.tournament

/**
 * Published when a match's call state advances (first, second or third call).
 */
data class MatchCalled(
    val matchId: Long,
    val callState: String
)
