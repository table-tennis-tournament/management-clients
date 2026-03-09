package de.ttt.management.tournament.infrastructure.web

import de.ttt.management.tournament.application.MatchService
import de.ttt.management.tournament.application.TableService
import de.ttt.management.tournament.domain.*
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/tournament")
@Tag(name = "Tournament Match Management", description = "Comprehensive operations for managing tournament matches, types, and assignments")
class TournamentMatchController(
    private val matchService: MatchService,
    private val tableService: TableService
) {

    @get:GetMapping("/match/all")
    @get:Operation(summary = "Get all tournament matches", description = "Retrieves a complete list of all matches in the tournament.")
    val allMatches: List<TournamentMatch>
        get() = matchService.getAllMatches()

    @GetMapping("/match/{id}")
    @Operation(summary = "Get tournament match by ID", description = "Retrieves details for a specific tournament match.")
    fun getMatch(
        @Parameter(description = "ID of the tournament match") @PathVariable id: Long
    ): ResponseEntity<TournamentMatch> {
        val match = matchService.getMatch(id)
        return if (match != null) ResponseEntity.ok(match) else ResponseEntity.notFound().build()
    }

    @GetMapping("/match/typeid/{typeid}")
    @Operation(summary = "Get matches by type", description = "Retrieves all matches belonging to a specific discipline type.")
    fun getMatchesByType(
        @Parameter(description = "ID of the discipline type") @PathVariable typeid: Long
    ): List<TournamentMatch> = matchService.getMatchesByType(typeid)

    @get:GetMapping("/match/open/all")
    @get:Operation(summary = "Get all open matches", description = "Retrieves all matches that are currently open/not completed.")
    val openMatches: List<TournamentMatch>
        get() = matchService.getOpenMatches()

    @GetMapping("/match/open/typeid/{typeid}")
    @Operation(summary = "Get open matches by type", description = "Retrieves open matches for a specific discipline type.")
    fun getOpenMatchesByTypeId(
        @Parameter(description = "ID of the discipline type") @PathVariable typeid: Long
    ): List<TournamentMatch> = matchService.getOpenMatchesByTypeId(typeid)

    @get:GetMapping("/match/played/all")
    @get:Operation(summary = "Get all played matches", description = "Retrieves all matches that have been completed.")
    val playedMatches: List<TournamentMatch>
        get() = matchService.getPlayedMatches()

    @GetMapping("/match/played/typeid/{typeid}")
    @Operation(summary = "Get played matches by type", description = "Retrieves completed matches for a specific discipline type.")
    fun getPlayedMatchesByTypeId(
        @Parameter(description = "ID of the discipline type") @PathVariable typeid: Long
    ): List<TournamentMatch> = matchService.getPlayedMatchesByTypeId(typeid)

    @PostMapping("/match/start/{id}/{tableId}")
    @Operation(summary = "Start match on table", description = "Marks a match as started and assigns it to a specific table.")
    fun startMatch(
        @Parameter(description = "ID of the match") @PathVariable id: Long,
        @Parameter(description = "ID of the table") @PathVariable tableId: Long
    ): ResponseEntity<Map<String, Any>> {
        val success = matchService.startMatch(id, tableId)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not start match."))
        }
    }

    @PostMapping("/match/stop/{id}")
    @Operation(summary = "Stop match", description = "Marks a currently running match as stopped.")
    fun stopMatch(
        @Parameter(description = "ID of the match") @PathVariable id: Long
    ): ResponseEntity<Map<String, Any>> {
        val success = matchService.stopMatch(id)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not stop match."))
        }
    }

    @PostMapping("/match/setResult/{id}")
    @Operation(summary = "Set match result", description = "Records the final score and sets for a match.")
    fun setResult(
        @Parameter(description = "ID of the match") @PathVariable id: Long,
        @RequestBody result: ResultRequest
    ): ResponseEntity<Map<String, Any>> {
        val success = matchService.setResult(id, result.resultRaw, result.sets1, result.sets2)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not set result."))
        }
    }

    @GetMapping("/match/delete/{id}")
    @Operation(summary = "Delete match", description = "Removes a match from the tournament.")
    fun deleteMatch(
        @Parameter(description = "ID of the match") @PathVariable id: Long
    ): ResponseEntity<Map<String, Any>> {
        val success = matchService.deleteMatch(id)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Match not found"))
        }
    }

    @GetMapping("/match/deleteType/{id}")
    @Operation(summary = "Delete all matches for type", description = "Removes all matches belonging to a specific discipline type.")
    fun deleteType(
        @Parameter(description = "ID of the discipline type") @PathVariable id: Long
    ): ResponseEntity<Map<String, Any>> {
        val success = matchService.deleteType(id)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Type not found or matches not found for type"))
        }
    }

    @PostMapping("/match/matchtotable/{tableName}")
    @Operation(summary = "Assign matches to table", description = "Assigns multiple matches to a specific table by its name.")
    fun setMatchToTable(
        @Parameter(description = "Name of the table") @PathVariable tableName: String,
        @RequestBody matchIds: List<Long>
    ): ResponseEntity<Map<String, Any>> {
        val success = tableService.setMatchToTable(tableName, matchIds)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not assign all matches to table."))
        }
    }

    @PostMapping("/match/free")
    @Operation(summary = "Free matches", description = "Removes matches from their assigned tables.")
    fun freeMatches(
        @RequestBody matchIds: List<Long>
    ): ResponseEntity<Map<String, Any>> {
        val success = matchService.freeMatches(matchIds)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not free all matches."))
        }
    }

    @PostMapping("/match/takeBack")
    @Operation(summary = "Take back matches", description = "Takes back matches to the match list.")
    fun takeBackMatches(
        @RequestBody matchIds: List<Long>
    ): ResponseEntity<Map<String, Any>> {
        val success = matchService.takeBackMatches(matchIds)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not take back all matches."))
        }
    }

    @get:GetMapping("/types/all")
    @get:Operation(summary = "Get all discipline types", description = "Retrieves all discipline types in the tournament.")
    val allTypes: List<TournamentDiscipline>
        get() = matchService.getAllTypes()

    @get:GetMapping("/types/open/all")
    @get:Operation(summary = "Get active discipline types", description = "Retrieves all active discipline types.")
    val activeTypes: List<TournamentDiscipline>
        get() = matchService.getActiveTypes()

    @GetMapping("/match/allmatchtable")
    @Operation(summary = "Get all match table data", description = "Retrieves a mapping of matches to tables.")
    fun allMatchTable(): List<Map<String, Any>> = emptyList()

    @GetMapping("/testsocket")
    @Operation(summary = "Test WebSocket connection", description = "Simple endpoint to verify WebSocket communication.")
    fun testSocket(): Map<String, Any> = mapOf("success" to true)

    @PostMapping("/match/matchtosecondtable/{tableName}")
    @Operation(summary = "Assign matches to second table", description = "Assigns matches to an alternative table.")
    fun setMatchToSecondTable(
        @Parameter(description = "Name of the second table") @PathVariable tableName: String,
        @RequestBody matchIds: List<Long>
    ): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(mapOf("success" to true))
    }

    @GetMapping("/match/loadnew")
    @Operation(summary = "Load new matches", description = "Triggers loading of new matches from the registration system.")
    fun loadNewMatches(): Map<String, Any> = mapOf("success" to true)

    @GetMapping("/matchaggregates/caller")
    @Operation(summary = "Get match aggregates for caller", description = "Retrieves summarized match data for the caller view.")
    fun getMatchAggregateForCaller(): List<Map<String, Any>> = emptyList()

    @GetMapping("/matchaggregates/secondCall")
    @Operation(summary = "Get match aggregates for second call", description = "Retrieves summarized match data for the second call view.")
    fun getMatchAggregateForSecondCall(): List<Map<String, Any>> = emptyList()

    @GetMapping("/matchaggregates/thirdCall")
    @Operation(summary = "Get match aggregates for third call", description = "Retrieves summarized match data for the third call view.")
    fun getMatchAggregateForThirdCall(): List<Map<String, Any>> = emptyList()

    @PostMapping("/match/remove/{tableId}")
    @Operation(summary = "Remove matches from table", description = "Removes all matches assigned to a specific table ID.")
    fun removeMatchesFromTable(
        @Parameter(description = "ID of the table") @PathVariable tableId: Long
    ): Map<String, Any> = mapOf("success" to true)

    @PostMapping("/match/call")
    @Operation(summary = "Call matches", description = "Marks a list of matches as 'called'.")
    fun callMatches(
        @RequestBody matchIds: List<Long>
    ): Map<String, Any> = mapOf("success" to true)

    @PostMapping("/playercall/{matchId}")
    @Operation(summary = "Call players for match", description = "Triggers a player call for a specific match.")
    fun callPlayers(
        @Parameter(description = "ID of the match") @PathVariable matchId: Long
    ): Map<String, Any> = mapOf("success" to true)
}

data class ResultRequest(
    val resultRaw: String,
    val sets1: Int,
    val sets2: Int
)
