package de.ttt.management.tournament.infrastructure.web

import de.ttt.management.tournament.TableService
import de.ttt.management.tournament.domain.TTTable
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class TableController(private val tableService: TableService) {

    @GetMapping("/table/all")
    fun getAllTables(): List<TTTable> = tableService.getAllTables()

    @GetMapping("/table/free")
    fun getFreeTables(): List<TTTable> = tableService.getFreeTables()

    @GetMapping("/table/{id}")
    fun getTable(@PathVariable id: Long): ResponseEntity<TTTable> {
        val table = tableService.getTable(id)
        return if (table != null) ResponseEntity.ok(table) else ResponseEntity.notFound().build()
    }

    @GetMapping("/table/{nr}/lock")
    fun lockTable(@PathVariable nr: Long): ResponseEntity<Map<String, Any>> {
        val success = tableService.lockTable(nr)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Table not found"))
        }
    }

    @GetMapping("/table/{nr}/unlock")
    fun unlockTable(@PathVariable nr: Long): ResponseEntity<Map<String, Any>> {
        val success = tableService.unlockTable(nr)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Table not found"))
        }
    }

    @GetMapping("/tables")
    fun getByTablemanager(@RequestParam(name = "table_manager", defaultValue = "1") tableManager: Long): List<TTTable> {
        return tableService.getAllTables()
    }
}
