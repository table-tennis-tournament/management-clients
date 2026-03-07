package de.ttt.management.tournament.infrastructure.web

import de.ttt.management.tournament.TournamentService
import de.ttt.management.tournament.domain.*
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/tournament")
class TournamentMatchController(private val tournamentService: TournamentService) {

    @get:GetMapping("/match/all")
    val allMatches: List<TournamentMatch>
        get() = tournamentService.getAllMatches()

    @GetMapping("/match/{id}")
    fun getMatch(@PathVariable id: Long): ResponseEntity<TournamentMatch> {
        val match = tournamentService.getMatch(id)
        return if (match != null) ResponseEntity.ok(match) else ResponseEntity.notFound().build()
    }

    @GetMapping("/match/typeid/{typeid}")
    fun getMatchesByType(@PathVariable typeid: Long): List<TournamentMatch> = tournamentService.getMatchesByType(typeid)

    @get:GetMapping("/match/open/all")
    val openMatches: List<TournamentMatch>
        get() = tournamentService.getOpenMatches()

    @GetMapping("/match/open/typeid/{typeid}")
    fun getOpenMatchesByTypeId(@PathVariable typeid: Long): List<TournamentMatch> = tournamentService.getOpenMatchesByTypeId(typeid)

    @get:GetMapping("/match/played/all")
    val playedMatches: List<TournamentMatch>
        get() = tournamentService.getPlayedMatches()

    @GetMapping("/match/played/typeid/{typeid}")
    fun getPlayedMatchesByTypeId(@PathVariable typeid: Long): List<TournamentMatch> = tournamentService.getPlayedMatchesByTypeId(typeid)

    @PostMapping("/match/start/{id}/{tableId}")
    fun startMatch(
        @PathVariable id: Long,
        @PathVariable tableId: Long
    ): ResponseEntity<Map<String, Any>> {
        val success = tournamentService.startMatch(id, tableId)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not start match."))
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
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not stop match."))
        }
    }

    @PostMapping("/match/setResult/{id}")
    fun setResult(@PathVariable id: Long, @RequestBody result: ResultRequest): ResponseEntity<Map<String, Any>> {
        val success = tournamentService.setResult(id, result.resultRaw, result.sets1, result.sets2)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not set result."))
        }
    }

    @GetMapping("/match/delete/{id}")
    fun deleteMatch(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        val success = tournamentService.deleteMatch(id)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Match not found"))
        }
    }

    @GetMapping("/match/deleteType/{id}")
    fun deleteType(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        val success = tournamentService.deleteType(id)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Type not found or matches not found for type"))
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

    @get:GetMapping("/types/all")
    val allTypes: List<TournamentDiscipline>
        get() = tournamentService.getAllTypes()

    @get:GetMapping("/types/open/all")
    val activeTypes: List<TournamentDiscipline>
        get() = tournamentService.getActiveTypes()

    @GetMapping("/match/allmatchtable")
    fun allMatchTable(): List<Map<String, Any>> = emptyList()

    @GetMapping("/testsocket")
    fun testSocket(): Map<String, Any> = mapOf("success" to true)

    @PostMapping("/match/matchtosecondtable/{tableName}")
    fun setMatchToSecondTable(
        @PathVariable tableName: String,
        @RequestBody matchIds: List<Long>
    ): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(mapOf("success" to true))
    }

    @GetMapping("/match/loadnew")
    fun loadNewMatches(): Map<String, Any> = mapOf("success" to true)

    @GetMapping("/matchaggregates/caller")
    fun getMatchAggregateForCaller(): List<Map<String, Any>> = emptyList()

    @GetMapping("/matchaggregates/secondCall")
    fun getMatchAggregateForSecondCall(): List<Map<String, Any>> = emptyList()

    @GetMapping("/matchaggregates/thirdCall")
    fun getMatchAggregateForThirdCall(): List<Map<String, Any>> = emptyList()

    @PostMapping("/match/remove/{tableId}")
    fun removeMatchesFromTable(@PathVariable tableId: Long): Map<String, Any> = mapOf("success" to true)

    @PostMapping("/match/call")
    fun callMatches(@RequestBody matchIds: List<Long>): Map<String, Any> = mapOf("success" to true)

    @PostMapping("/playercall/{matchId}")
    fun callPlayers(@PathVariable matchId: Long): Map<String, Any> = mapOf("success" to true)
}

data class ResultRequest(
    val resultRaw: String,
    val sets1: Int,
    val sets2: Int
)
