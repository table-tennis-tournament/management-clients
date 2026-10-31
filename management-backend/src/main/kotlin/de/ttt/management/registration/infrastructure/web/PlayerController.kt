package de.ttt.management.registration.infrastructure.web

import de.ttt.management.registration.application.PlayerService
import de.ttt.management.registration.domain.PlayerTypeRegistration
import de.ttt.management.registration.domain.player.Player
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/players")
@Tag(name = "Player Management", description = "Operations for managing tournament players")
class PlayerController(private val playerService: PlayerService) {

    @GetMapping("/load")
    @Operation(summary = "Check player service status", description = "Returns a success indicator if the player service is responsive.")
    fun load(): Map<String, Any> = mapOf("success" to true)

    @GetMapping
    @Operation(summary = "Get all players", description = "Retrieves a list of all registered players in the tournament.")
    fun getAllPlayers(): List<Player> = playerService.getAllPlayers()

    @GetMapping("/all")
    @Operation(summary = "Get all players (legacy)", description = "Legacy endpoint to retrieve all registered players.")
    fun getAllPlayersLegacy(): List<Player> = playerService.getAllPlayers()

    @GetMapping("/allTypePerPlayer")
    @Operation(summary = "Get all registrations grouped by player and type", description = "Retrieves each player's type registrations for types that have no matches yet (excluding doubles).")
    fun getAllTypePerPlayer(): List<PlayerTypeRegistration> = playerService.getAllTypePerPlayer()

    @PostMapping
    @Operation(summary = "Register a player", description = "Registers a new player for the tournament.")
    fun registerPlayer(@RequestBody request: RegisterPlayerRequest): ResponseEntity<Player> {
        val player = playerService.registerPlayer(
            firstName = request.firstName,
            lastName = request.lastName,
            ttr = request.ttr,
            sex = request.sex,
            clubId = request.clubId
        )
        return ResponseEntity.ok(player)
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get player by ID", description = "Retrieves detailed information for a specific player.")
    fun getPlayer(
        @Parameter(description = "ID of the player to retrieve") @PathVariable id: Long
    ): ResponseEntity<Player> {
        val player = playerService.getPlayer(id)
        return if (player != null) ResponseEntity.ok(player) else ResponseEntity.notFound().build()
    }

    @GetMapping("/type/{typeId}")
    @Operation(summary = "Get players by type", description = "Retrieves a list of players matching the specified type ID.")
    fun getPlayersByType(
        @Parameter(description = "ID of the player type") @PathVariable typeId: Long
    ): List<Player> = playerService.getPlayersByType(typeId)

    @PostMapping("/{id}/active/{active}")
    @Operation(summary = "Set player active state", description = "Updates the active/inactive state of a player.")
    fun setPlayerActiveState(
        @Parameter(description = "ID of the player") @PathVariable id: Long,
        @Parameter(description = "Active state (true for active)") @PathVariable active: Boolean
    ): ResponseEntity<Map<String, Any>> {
        val success = playerService.setPlayerActiveState(id, active)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Player not found"))
        }
    }

    @PostMapping("/{id}/paid")
    @Operation(summary = "Set player payment status (POST)", description = "Updates the payment status for a player.")
    fun setPaid(
        @Parameter(description = "ID of the player") @PathVariable id: Long,
        @Parameter(description = "Payment status (true for paid)") @RequestParam paid: Boolean
    ): Map<String, Any> {
        val success = playerService.setPaid(id, paid)
        return mapOf("success" to success)
    }

    @PostMapping("/{id}/unregister")
    @Operation(summary = "Unregister a player", description = "Removes a player from the tournament.")
    fun unregisterPlayer(
        @Parameter(description = "ID of the player") @PathVariable id: Long
    ): Map<String, Any> {
        val success = playerService.unregisterPlayer(id)
        return mapOf("success" to success)
    }
}

data class RegisterPlayerRequest(
    val firstName: String,
    val lastName: String,
    val ttr: Int? = null,
    val sex: String? = null,
    val clubId: Long? = null
)
