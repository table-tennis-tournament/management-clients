package de.ttt.management.grouping.domain

/**
 * A lightweight read projection of a group match's result, owned by the grouping module.
 */
data class GroupMatchResult(
    val matchId: Long,
    val groupId: Long?,
    val player1Id: Long?,
    val player2Id: Long?,
    val sets1: Int,
    val sets2: Int,
    val balls1: Int,
    val balls2: Int,
    val isPlayed: Boolean
)
