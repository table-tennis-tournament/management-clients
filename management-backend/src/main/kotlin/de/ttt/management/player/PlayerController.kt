package de.ttt.management.player

import org.springframework.web.bind.annotation.*

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
