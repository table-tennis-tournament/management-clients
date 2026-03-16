package de.ttt.management.registration.domain.player
import java.util.*
interface DoublePlayerRepository {
    fun findAll(): List<DoublePlayer>
    fun findById(id: Long): Optional<DoublePlayer>
    fun save(doublePlayer: DoublePlayer): DoublePlayer
    fun deleteAll()
}
