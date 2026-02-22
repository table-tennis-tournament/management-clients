package de.ttt.management.table

import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/tables")
class TableController(private val tableService: TableService) {

    @GetMapping
    fun getAllTables(): List<TTTable> = tableService.getAllTables()

    @GetMapping("/free")
    fun getFreeTables(): List<TTTable> = tableService.getFreeTables()

    @GetMapping("/{id}")
    fun getTable(@PathVariable id: Long): TTTable? = tableService.getTable(id)

    @PostMapping("/{id}/lock")
    fun lockTable(@PathVariable id: Long): Map<String, Any> {
        val success = tableService.lockTable(id)
        return mapOf("success" to success)
    }
}
