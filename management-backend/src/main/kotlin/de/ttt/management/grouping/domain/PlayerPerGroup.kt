package de.ttt.management.grouping.domain

/**
 * A player's standing within a group (the `playerpergroup` table).
 * The aggregate owns the position and the accumulated match statistics.
 */
data class PlayerPerGroup(
    val id: Long,
    val playerId: Long,
    val groupId: Long,
    val position: Int = 0,
    val matchesWon: Int = 0,
    val matchesLost: Int = 0,
    val setsWon: Int = 0,
    val setsLost: Int = 0,
    val pointsWon: Int = 0,
    val pointsLost: Int = 0,
    val games: String = "0 : 0",
    val sets: String = "0 : 0",
    val points: String = "0 : 0",
    val checked: Boolean = false,
    val setsDiff: Int = 0
)
