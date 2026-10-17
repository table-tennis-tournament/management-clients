package de.ttt.management.tournament.infrastructure.web

import de.ttt.management.tournament.application.MatchService
import de.ttt.management.tournament.application.TableService
import de.ttt.management.tournament.domain.CallState
import de.ttt.management.tournament.domain.TTTable
import de.ttt.management.tournament.domain.TournamentMatch
import de.ttt.management.tournament.domain.TournamentPlayer
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping
@Tag(name = "Table Management", description = "Operations for managing table tennis tables, including locking and unlocking")
class TableController(
    private val tableService: TableService,
    private val matchService: MatchService
) {

    @GetMapping("/table/all")
    @Operation(summary = "Get all tables", description = "Retrieves a list of all tables in the tournament.")
    fun getAllTables(): List<TTTable> = tableService.getAllTables()

    @GetMapping("/table/free")
    @Operation(summary = "Get free tables", description = "Retrieves a list of tables that are currently not assigned to a match.")
    fun getFreeTables(): List<TTTable> = tableService.getFreeTables()

    @GetMapping("/table/{id}")
    @Operation(summary = "Get table by ID", description = "Retrieves details for a specific table.")
    fun getTable(
        @Parameter(description = "ID of the table") @PathVariable id: Long
    ): ResponseEntity<TTTable> {
        val table = tableService.getTable(id)
        return if (table != null) ResponseEntity.ok(table) else ResponseEntity.notFound().build()
    }

    @PostMapping("/table/{nr}/lock")
    @Operation(summary = "Lock table", description = "Locks a table to prevent it from being assigned to matches.")
    fun lockTable(
        @Parameter(description = "Number/ID of the table to lock") @PathVariable nr: Long
    ): ResponseEntity<Map<String, Any>> {
        val success = tableService.lockTable(nr)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Table not found"))
        }
    }

    @PostMapping("/table/{nr}/unlock")
    @Operation(summary = "Unlock table", description = "Unlocks a previously locked table.")
    fun unlockTable(
        @Parameter(description = "Number/ID of the table to unlock") @PathVariable nr: Long
    ): ResponseEntity<Map<String, Any>> {
        val success = tableService.unlockTable(nr)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Table not found"))
        }
    }

    @GetMapping("/tables")
    @Operation(summary = "Get tables by manager", description = "Retrieves tables managed by a specific table manager.")
    fun getByTablemanager(
        @Parameter(description = "ID of the table manager") @RequestParam(name = "table_manager", defaultValue = "1") tableManager: Long
    ): List<TableManagerTableInfo> {
        val tables = tableService.getTablesForManager(tableManager)
        val tableIds = tables.mapNotNull { it.id }
        val matches = matchService.getMatchesOnTables(tableIds)
        val disciplines = matchService.getAllTypes().associateBy { it.id }

        return tables.map { table ->
            TableManagerTableInfo(
                table_id = table.id,
                table_number = table.name?.toLongOrNull(),
                table_manager_id = tableManager,
                matches = matches
                    .filter { it.tableId == table.id }
                    .map { toTableManagerMatch(it, disciplines[it.typeId]?.name) }
            )
        }
    }

    private fun toTableManagerMatch(match: TournamentMatch, classification: String?): TableManagerMatch {
        return TableManagerMatch(
            match_id = match.id,
            result = TableManagerResult(
                games = match.sets.map { TableManagerGame(it.pointsPlayer1, it.pointsPlayer2) },
                games_won_player_a = match.sets.count { it.pointsPlayer1 > it.pointsPlayer2 },
                games_won_player_b = match.sets.count { it.pointsPlayer2 > it.pointsPlayer1 }
            ),
            players_a = match.players1.map { toTableManagerPlayer(it) },
            players_b = match.players2.map { toTableManagerPlayer(it) },
            stage = match.matchType?.name,
            classification = classification,
            state = legacyState(match)
        )
    }

    private fun toTableManagerPlayer(player: TournamentPlayer): TableManagerPlayer {
        return TableManagerPlayer(
            player_id = player.id,
            first_name = player.firstName,
            last_name = player.lastName,
            club = null,
            call_count = 1
        )
    }

    private fun legacyState(match: TournamentMatch): String = when {
        match.isPlayed && match.isKampflos -> "Finished"
        match.isPlayed -> "Completed"
        match.isPlaying -> "Started"
        match.callState == CallState.ThirdCall -> "ThirdCall"
        match.callState == CallState.SecondCall -> "SecondCall"
        match.callState == CallState.FirstCall -> "OnTable"
        match.tableId != null -> "Callable"
        match.waitingList -> "InWaitingList"
        else -> "Open"
    }
}
