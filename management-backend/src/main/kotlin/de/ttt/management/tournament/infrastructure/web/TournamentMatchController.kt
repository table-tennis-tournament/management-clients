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
@RequestMapping
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
    @Operation(summary = "Set match result", description = "Records the final sets and completes the match.")
    fun setResult(
        @Parameter(description = "ID of the match") @PathVariable id: Long,
        @RequestBody sets: List<List<Int>>
    ): ResponseEntity<Map<String, Any>> {
        val success = matchService.setResult(id, sets.toSetResults())
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not set result."))
        }
    }

    @PostMapping("/match/updateResult/{id}")
    @Operation(summary = "Update match result", description = "Records an interim set result for a match that is still being played.")
    fun updateResult(
        @Parameter(description = "ID of the match") @PathVariable id: Long,
        @RequestBody sets: List<List<Int>>
    ): ResponseEntity<Map<String, Any>> {
        val success = matchService.updateResult(id, sets.toSetResults())
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not update result."))
        }
    }

    @DeleteMapping("/match/{id}")
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

    @DeleteMapping("/match/type/{id}")
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
        get() = matchService.getAllTypes().map(::withDoubleName).sortedBy { it.name }

    @get:GetMapping("/types/open/all")
    @get:Operation(summary = "Get active discipline types", description = "Retrieves all active discipline types.")
    val activeTypes: List<TournamentDiscipline>
        get() = matchService.getActiveTypes().map(::withDoubleName).sortedBy { it.name }

    @GetMapping("/match/allmatchtable")
    @Operation(summary = "Get all match table data", description = "Retrieves the current match-to-table assignments.")
    fun allMatchTable(): List<Map<String, Any>> =
        matchService.getAllMatches()
            .filter { it.tableId != null && it.id != null }
            .map { mapOf<String, Any>("matchId" to it.id!!, "tableId" to it.tableId!!) }

    @GetMapping("/testsocket")
    @Operation(summary = "Test WebSocket connection", description = "Simple endpoint to verify WebSocket communication.")
    fun testSocket(): Map<String, Any> = mapOf("success" to true)

    @PostMapping("/match/matchtosecondtable/{tableName}")
    @Operation(summary = "Assign matches to second table", description = "Assigns matches to an alternative table.")
    fun setMatchToSecondTable(
        @Parameter(description = "Name of the second table") @PathVariable tableName: String,
        @RequestBody matchIds: List<Long>
    ): ResponseEntity<Map<String, Any>> {
        val success = tableService.setMatchToTable(tableName, matchIds)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not assign all matches to table."))
        }
    }

    @GetMapping("/match/loadnew")
    @Operation(summary = "Load new matches", description = "Triggers loading of new matches from the registration system.")
    fun loadNewMatches(): Map<String, Any> = mapOf("success" to true)

    @GetMapping("/matchaggregates/caller")
    @Operation(summary = "Get match aggregates for caller", description = "Retrieves summarized match data for the caller view.")
    fun getMatchAggregateForCaller(): List<MatchAggregate> =
        toMatchAggregates(matchService.getMatchesByCallState(CallState.None))

    @GetMapping("/matchaggregates/secondCall")
    @Operation(summary = "Get match aggregates for second call", description = "Retrieves summarized match data for the second call view.")
    fun getMatchAggregateForSecondCall(): List<MatchAggregate> =
        toMatchAggregates(matchService.getMatchesByCallState(CallState.SecondCall))

    @GetMapping("/matchaggregates/thirdCall")
    @Operation(summary = "Get match aggregates for third call", description = "Retrieves summarized match data for the third call view.")
    fun getMatchAggregateForThirdCall(): List<MatchAggregate> =
        toMatchAggregates(matchService.getMatchesByCallState(CallState.ThirdCall))

    @PostMapping("/match/remove/{tableId}")
    @Operation(summary = "Remove matches from table", description = "Removes all matches assigned to a specific table ID.")
    fun removeMatchesFromTable(
        @Parameter(description = "ID of the table") @PathVariable tableId: Long,
        @RequestBody matchIds: List<Long>
    ): ResponseEntity<Map<String, Any>> {
        val success = matchService.removeMatchesFromTable(matchIds)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not remove all matches from table."))
        }
    }

    @PostMapping("/match/call")
    @Operation(summary = "Call matches", description = "Marks a list of matches as 'called'.")
    fun callMatches(
        @RequestBody matchIds: List<Long>
    ): ResponseEntity<Map<String, Any>> {
        val success = matchService.callMatches(matchIds)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Could not call all matches."))
        }
    }

    @PostMapping("/playercall/{matchId}")
    @Operation(summary = "Call players for match", description = "Triggers a player call for a specific match.")
    fun callPlayers(
        @Parameter(description = "ID of the match") @PathVariable matchId: Long
    ): ResponseEntity<Map<String, Any>> {
        val success = matchService.callPlayers(matchId)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Match not found"))
        }
    }

    private fun toMatchAggregates(matches: List<TournamentMatch>): List<MatchAggregate> {
        val disciplines = matchService.getAllTypes().associateBy { it.id }
        return matches
            .groupBy { it.tableId }
            .map { (tableId, ms) ->
                val head = ms.first()
                val discipline = head.typeId?.let { disciplines[it] }
                val players = ms.flatMap { it.team1 + it.team2 }.distinctBy { it.id }
                MatchAggregate(
                    name = aggregateName(head),
                    startTime = head.startTime,
                    tableNumbers = listOfNotNull(tableId),
                    discipline = discipline?.let { DisciplineDto(it.id, it.name, it.kind, it.active) },
                    players = players.map { PlayerDto(it.id, it.firstName, it.lastName, it.ttr) },
                    matches = ms.map { m ->
                        CallerMatchDto(
                            id = m.id!!,
                            startTime = m.startTime,
                            team1 = m.team1.map { PlayerDto(it.id, it.firstName, it.lastName, it.ttr) },
                            team2 = m.team2.map { PlayerDto(it.id, it.firstName, it.lastName, it.ttr) }
                        )
                    }
                )
            }
            .sortedBy { it.tableNumbers.firstOrNull() }
    }

    private fun aggregateName(match: TournamentMatch): String? {
        val matchTypeName = match.matchType?.name ?: return null
        val groupName = match.playGroup?.name
        return if (groupName.isNullOrBlank()) matchTypeName else "$matchTypeName $groupName"
    }

    private fun withDoubleName(discipline: TournamentDiscipline): TournamentDiscipline =
        if (discipline.kind == 2) discipline.copy(name = discipline.name?.plus("-Doppel")) else discipline
}

private fun List<List<Int>>.toSetResults(): List<SetResult> =
    map { pair ->
        require(pair.size == 2) { "Each set must be a [player1, player2] pair" }
        SetResult(pair[0], pair[1])
    }