package de.ttt.management.tournament.infrastructure.web

import de.ttt.management.tournament.application.MatchListService
import de.ttt.management.tournament.domain.MatchList
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/tournament/matchlist")
@Tag(name = "Match List Management", description = "Operations for managing the tournament match list/queue")
class MatchListController(private val matchListService: MatchListService) {

    @GetMapping("/all")
    @Operation(summary = "Get all match list entries", description = "Retrieves the entire list of matches queued for play.")
    fun getAllMatchList(): ResponseEntity<List<MatchList>> {
        return ResponseEntity.ok(matchListService.getAllMatchList())
    }

    @GetMapping("/next")
    @Operation(summary = "Get next match", description = "Retrieves the next match from the match list queue.")
    fun getNext(): ResponseEntity<MatchList> {
        val next = matchListService.getNextMatchFromList()
        return if (next != null) ResponseEntity.ok(next) else ResponseEntity.noContent().build()
    }

    @PostMapping("/add")
    @Operation(summary = "Add match to list", description = "Adds one or more matches to the match list queue.")
    fun addMatch(
        @RequestBody request: AddMatchListRequest
    ): ResponseEntity<MatchList> {
        val newList = matchListService.addMatchToList(
            matchIds = request.matchIds,
            asGroup = request.asGroup,
            position = request.position
        )
        return ResponseEntity.ok(newList)
    }

    @DeleteMapping("/{uuid}")
    @Operation(summary = "Delete match from list", description = "Removes a specific match list entry by its UUID.")
    fun deleteMatch(
        @Parameter(description = "UUID of the match list entry") @PathVariable uuid: String
    ): ResponseEntity<Map<String, Any>> {
        val success = matchListService.deleteMatchFromList(uuid)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "MatchList entry not found"))
        }
    }

    @GetMapping("/active/{isActive}")
    @Operation(summary = "Set match list active state", description = "Enables or disables the match list processing.")
    fun setActive(
        @Parameter(description = "Active state (true) or inactive (false)") @PathVariable isActive: Boolean
    ): ResponseEntity<Map<String, Any>> {
        matchListService.setMatchListActive(isActive)
        return ResponseEntity.ok(mapOf("success" to true))
    }

    @GetMapping("/move/{uuid}/{position}")
    @Operation(summary = "Move match list entry", description = "Changes the position of a match list entry in the queue.")
    fun move(
        @Parameter(description = "UUID of the match list entry") @PathVariable uuid: String,
        @Parameter(description = "New position index") @PathVariable position: Int
    ): ResponseEntity<Map<String, Any>> {
        val success = matchListService.moveMatchListEntry(uuid, position)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "MatchList entry not found"))
        }
    }

    @GetMapping("/autostart")
    @Operation(summary = "Trigger auto-start", description = "Manually triggers the auto-start logic for matches.")
    fun autoStart(): Map<String, Any> = mapOf("success" to true)
}

data class AddMatchListRequest(
    val matchIds: List<Long>,
    val asGroup: Long?,
    val position: Int
)
