package de.ttt.management.registration.infrastructure.web

import de.ttt.management.registration.domain.player.Player
import de.ttt.management.registration.application.PlayerService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/players")
class PlayerController(private val playerService: PlayerService) {

    @GetMapping
    fun getAllPlayers(): List<Player> = playerService.getAllPlayers()

    @GetMapping("/{id}")
    fun getPlayer(@PathVariable id: Long): Player? = playerService.getPlayer(id)

    @PostMapping("/{id}/paid")
    fun setPaid(@PathVariable id: Long, @RequestParam paid: Boolean): Map<String, Any> {
        val success = playerService.setPaid(id, paid)
        return mapOf("success" to success)
    }
}