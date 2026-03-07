package de.ttt.management.tournament.infrastructure.web

import de.ttt.management.tournament.application.TournamentService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/tournament")
class TournamentMatchController(private val tournamentService: TournamentService) {

    @PostMapping("/match/start/{id}/{tableId}")
    fun startMatch(
        @PathVariable id: Long,
        @PathVariable tableId: Long
    ): ResponseEntity<Map<String, Any>> {
        val success = tournamentService.startMatch(id, tableId)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not start match. It may already be playing or the table is occupied."))
        }
    }

    @PostMapping("/match/stop/{id}")
    fun stopMatch(
        @PathVariable id: Long
    ): ResponseEntity<Map<String, Any>> {
        val success = tournamentService.stopMatch(id)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not stop match. It may not be currently playing."))
        }
    }

    @PostMapping("/match/matchtotable/{tableName}")
    fun setMatchToTable(
        @PathVariable tableName: String,
        @RequestBody matchIds: List<Long>
    ): ResponseEntity<Map<String, Any>> {
        val success = tournamentService.setMatchToTable(tableName, matchIds)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not assign all matches to table."))
        }
    }

    @PostMapping("/match/free")
    fun freeMatches(@RequestBody matchIds: List<Long>): ResponseEntity<Map<String, Any>> {
        val success = tournamentService.freeMatches(matchIds)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not free all matches."))
        }
    }

    @PostMapping("/match/takeBack")
    fun takeBackMatches(@RequestBody matchIds: List<Long>): ResponseEntity<Map<String, Any>> {
        val success = tournamentService.takeBackMatches(matchIds)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not take back all matches."))
        }
    }
}
