package de.ttt.management.registration.application

import de.ttt.management.registration.PlayerRegistered
import de.ttt.management.registration.PlayerUnregistered
import de.ttt.management.registration.domain.player.Club
import de.ttt.management.registration.domain.player.Player
import de.ttt.management.registration.domain.player.PlayerRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PlayerService(
    private val playerRepository: PlayerRepository,
    private val eventPublisher: ApplicationEventPublisher
) {

    fun getAllPlayers(): List<Player> = playerRepository.findAll()

    fun getPlayer(id: Long): Player? = playerRepository.findById(id).orElse(null)

    fun getPlayersByType(typeId: Long): List<Player> = playerRepository.findByTypeId(typeId)

    @Transactional
    fun registerPlayer(firstName: String, lastName: String, ttr: Int?, sex: String?, clubId: Long?): Player {
        val player = Player(
            firstName = firstName,
            lastName = lastName,
            ttr = ttr,
            sex = sex,
            club = clubId?.let { Club(id = it) }
        )
        val saved = playerRepository.save(player)
        eventPublisher.publishEvent(
            PlayerRegistered(
                playerId = saved.id!!,
                firstName = saved.firstName,
                lastName = saved.lastName
            )
        )
        return saved
    }

    @Transactional
    fun unregisterPlayer(id: Long): Boolean {
        if (playerRepository.findById(id).isEmpty) return false
        playerRepository.deleteById(id)
        eventPublisher.publishEvent(PlayerUnregistered(id))
        return true
    }

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
