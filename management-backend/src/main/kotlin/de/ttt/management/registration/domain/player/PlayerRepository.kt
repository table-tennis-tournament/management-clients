package de.ttt.management.registration.domain.player

import java.util.*

interface PlayerRepository {
    fun findAll(): List<Player>
    fun findById(id: Long): Optional<Player>
    fun save(player: Player): Player
    fun deleteAll()
}
