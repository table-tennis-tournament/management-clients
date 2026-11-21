package de.ttt.management.tournament

/**
 * Published when the winner of the knockout match [fromMatchId] moved on into a Side of the next match of the
 * bracket, [matchId]. [tableIds] are the tables the next match waits at, if any.
 */
data class KnockoutMatchFilled(
    val matchId: Long,
    val fromMatchId: Long,
    val typeId: Long? = null,
    val tableIds: List<Long> = emptyList()
)
