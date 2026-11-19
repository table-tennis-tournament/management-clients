package de.ttt.management.tournament

/**
 * Published once per call operation when a Call is announced: the first Call of matches ([callNumber] 1, all
 * their players) or a requested Second or Third call of the players [playerIds].
 */
data class MatchCalled(
    val matchIds: List<Long>,
    val callNumber: Int,
    val playerIds: List<Long> = emptyList(),
    val typeIds: List<Long> = emptyList(),
    val tableIds: List<Long> = emptyList()
)

/**
 * Published when the table manager requests the next call ([callNumber] 2 or 3) of the players [playerIds] of
 * match [matchId], who have not appeared. The caller announces it later ([MatchCalled]).
 */
data class MatchCallRequested(
    val matchId: Long,
    val callNumber: Int,
    val playerIds: List<Long>,
    val typeId: Long? = null,
    val tableIds: List<Long> = emptyList()
)
