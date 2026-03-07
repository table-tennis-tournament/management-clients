package de.ttt.management.registration

import de.ttt.management.registration.domain.player.Player
import de.ttt.management.registration.domain.player.PlayerRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PlayerService(
    private val playerRepository: PlayerRepository
) {

    fun getAllPlayers(): List<Player> = playerRepository.findAll()

    fun getPlayer(id: Long): Player? = playerRepository.findById(id).orElse(null)

    fun getPlayersByType(typeId: Long): List<Player> = playerRepository.findByTypeId(typeId)

    @Transactional
    fun setPaid(id: Long, paid: Boolean): Boolean {
        val player = playerRepository.findById(id).orElse(null) ?: return false
        player.paid = paid
        playerRepository.save(player)
        return true
    }

    @Transactional
    fun setPlayerActiveState(id: Long, active: Boolean): Boolean {
        playerRepository.findById(id).orElse(null) ?: return false
        return true
    }
}
