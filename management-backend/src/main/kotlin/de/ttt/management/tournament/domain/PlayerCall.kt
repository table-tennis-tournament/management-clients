package de.ttt.management.tournament.domain

/**
 * How often player [playerId] of a match has been called: 1 for the first Call of the match, 2 and 3 for a
 * Second and Third call of this player. [requested] is set while the table manager's request for this player's
 * next call waits for the caller to announce it.
 */
data class PlayerCall(
    val playerId: Long,
    val callNumber: Int,
    val requested: Boolean = false
)

/** The Third call is the last one. */
const val LAST_CALL_NUMBER = 3
