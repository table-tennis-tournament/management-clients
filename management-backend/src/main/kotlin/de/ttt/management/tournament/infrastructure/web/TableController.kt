package de.ttt.management.tournament.infrastructure.web

import de.ttt.management.tournament.application.TableService
import de.ttt.management.tournament.domain.TTTable
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
@Tag(name = "Table Management", description = "Operations for managing table tennis tables, including locking and unlocking")
class TableController(private val tableService: TableService) {

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

    @GetMapping("/table/{nr}/lock")
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

    @GetMapping("/table/{nr}/unlock")
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
    ): List<TTTable> {
        return tableService.getAllTables()
    }
}
