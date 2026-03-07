package de.ttt.management.tournament.infrastructure.web

import de.ttt.management.tournament.TournamentService
import de.ttt.management.tournament.domain.MatchList
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/tournament/matchlist")
class MatchListController(private val tournamentService: TournamentService) {

    @GetMapping("/all")
    fun getAllMatchList(): ResponseEntity<List<MatchList>> {
        return ResponseEntity.ok(tournamentService.getAllMatchList())
    }

    @GetMapping("/next")
    fun getNext(): ResponseEntity<MatchList> {
        val next = tournamentService.getNextMatchFromList()
        return if (next != null) ResponseEntity.ok(next) else ResponseEntity.noContent().build()
    }

    @PostMapping("/add")
    fun addMatch(
        @RequestBody request: AddMatchListRequest
    ): ResponseEntity<MatchList> {
        val newList = tournamentService.addMatchToList(
            matchIds = request.matchIds,
            asGroup = request.asGroup,
            position = request.position
        )
        return ResponseEntity.ok(newList)
    }

    @DeleteMapping("/{uuid}")
    fun deleteMatch(@PathVariable uuid: String): ResponseEntity<Map<String, Any>> {
        val success = tournamentService.deleteMatchFromList(uuid)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "MatchList entry not found"))
        }
    }

    @GetMapping("/active/{isActive}")
    fun setActive(@PathVariable isActive: Boolean): ResponseEntity<Map<String, Any>> {
        tournamentService.setMatchListActive(isActive)
        return ResponseEntity.ok(mapOf("success" to true))
    }

    @GetMapping("/move/{uuid}/{position}")
    fun move(@PathVariable uuid: String, @PathVariable position: Int): ResponseEntity<Map<String, Any>> {
        val success = tournamentService.moveMatchListEntry(uuid, position)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "MatchList entry not found"))
        }
    }

    @GetMapping("/autostart")
    fun autoStart(): Map<String, Any> = mapOf("success" to true)
}

data class AddMatchListRequest(
    val matchIds: List<Long>,
    val asGroup: Long?,
    val position: Int
)
