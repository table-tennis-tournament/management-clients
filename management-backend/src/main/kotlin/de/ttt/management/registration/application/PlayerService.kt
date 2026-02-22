package de.ttt.management.registration.application

import de.ttt.management.registration.domain.player.ClubRepository
import de.ttt.management.registration.domain.player.DoublePlayerRepository
import de.ttt.management.registration.domain.player.Player
import de.ttt.management.registration.domain.player.PlayerRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PlayerService(
    private val playerRepository: PlayerRepository,
    private val clubRepository: ClubRepository,
    private val doublePlayerRepository: DoublePlayerRepository
) {

    fun getAllPlayers(): List<Player> = playerRepository.findAll()

    fun getPlayer(id: Long): Player? = playerRepository.findById(id).orElse(null)

    @Transactional
    fun setPaid(id: Long, paid: Boolean): Boolean {
        val player = playerRepository.findById(id).orElse(null) ?: return false
        player.paid = paid
        playerRepository.save(player)
        return true
    }
}