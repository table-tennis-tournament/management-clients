package de.ttt.management.registration.domain

import de.ttt.management.registration.domain.discipline.Discipline
import de.ttt.management.registration.domain.player.Player

/**
 * Read model for `typeperplayer` registrations exposed via `/players/allTypePerPlayer`.
 */
data class PlayerTypeRegistration(
    val id: Long,
    val player: Player,
    val type: Discipline,
    val paid: Boolean
)
