package de.ttt.management.tournament

/**
 * Published once per call operation when the call state of matches advances
 * (first, second or third call).
 */
data class MatchCalled(
    val matchIds: List<Long>,
    val callState: String,
    val typeIds: List<Long> = emptyList(),
    val tableIds: List<Long> = emptyList()
)
