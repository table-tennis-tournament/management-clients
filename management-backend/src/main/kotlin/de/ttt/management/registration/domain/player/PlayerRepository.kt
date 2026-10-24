package de.ttt.management.registration.domain.player

import de.ttt.management.registration.domain.PlayerTypeRegistration
import java.util.*

interface PlayerRepository {
    fun findAll(): List<Player>
    fun findById(id: Long): Optional<Player>
    fun findByTypeId(typeId: Long): List<Player>
    fun findAllTypePerPlayer(): List<PlayerTypeRegistration>
    fun setTypePerPlayerPaid(typlId: Long, paid: Boolean): Boolean
    fun save(player: Player): Player
    fun deleteById(id: Long)
    fun deleteAll()
}
