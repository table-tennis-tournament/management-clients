package de.ttt.management.registration.infrastructure.web

import de.ttt.management.registration.domain.player.Player
import de.ttt.management.registration.PlayerService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/players")
class PlayerController(private val playerService: PlayerService) {

    @GetMapping("/load")
    fun load(): Map<String, Any> = mapOf("success" to true)

    @GetMapping
    fun getAllPlayers(): List<Player> = playerService.getAllPlayers()

    @GetMapping("/all")
    fun getAllPlayersLegacy(): List<Player> = playerService.getAllPlayers()

    @GetMapping("/allTypePerPlayer")
    fun getAllTypePerPlayer(): Map<Long, List<Long>> = emptyMap() // Placeholder

    @GetMapping("/{id}")
    fun getPlayer(@PathVariable id: Long): ResponseEntity<Player> {
        val player = playerService.getPlayer(id)
        return if (player != null) ResponseEntity.ok(player) else ResponseEntity.notFound().build()
    }

    @GetMapping("/setPayed/{id}/{paid}")
    fun setPayed(@PathVariable id: Long, @PathVariable paid: Boolean): ResponseEntity<Map<String, Any>> {
        val success = playerService.setPaid(id, paid)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Player not found"))
        }
    }

    @GetMapping("/type/{typeId}")
    fun getPlayesByType(@PathVariable typeId: Long): List<Player> = playerService.getPlayersByType(typeId)

    @GetMapping("/{id}/{active}")
    fun setPlayerActiveState(@PathVariable id: Long, @PathVariable active: Boolean): ResponseEntity<Map<String, Any>> {
        val success = playerService.setPlayerActiveState(id, active)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Player not found"))
        }
    }

    @PostMapping("/{id}/paid")
    fun setPaid(@PathVariable id: Long, @RequestParam paid: Boolean): Map<String, Any> {
        val success = playerService.setPaid(id, paid)
        return mapOf("success" to success)
    }
}
