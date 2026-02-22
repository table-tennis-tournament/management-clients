package de.ttt.management.table

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class TableService(
    private val ttTableRepository: TTTableRepository,
    private val matchOnTableRepository: MatchOnTableRepository
) {

    fun getAllTables(): List<TTTable> = ttTableRepository.findAll().sortedBy { it.name }

    fun getFreeTables(): List<TTTable> {
        val allTables = ttTableRepository.findAll()
        val occupiedTableIds = matchOnTableRepository.findAll().mapNotNull { it.tableId }.toSet()
        return allTables.filter { it.id !in occupiedTableIds }.sortedBy { it.name }
    }

    fun getTable(id: Long): TTTable? = ttTableRepository.findById(id).orElse(null)

    @Transactional
    fun lockTable(id: Long): Boolean {
        // In legacy, lock was a logical flag often not in the DB, 
        // but here we can add a 'isLocked' column to the entity if needed.
        // For now, let's assume it's just a placeholder or we use a separate setting.
        return true
    }
}
