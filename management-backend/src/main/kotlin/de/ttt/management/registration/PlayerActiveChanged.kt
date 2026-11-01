package de.ttt.management.registration

/**
 * Published when a player is activated or deactivated.
 */
data class PlayerActiveChanged(
    val playerId: Long,
    val active: Boolean
)
