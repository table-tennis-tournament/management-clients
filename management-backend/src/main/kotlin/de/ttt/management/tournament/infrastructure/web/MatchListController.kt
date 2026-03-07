package de.ttt.management.tournament.infrastructure.web

import de.ttt.management.tournament.application.TournamentService
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
}

data class AddMatchListRequest(
    val matchIds: List<Long>,
    val asGroup: Long?,
    val position: Int
)
