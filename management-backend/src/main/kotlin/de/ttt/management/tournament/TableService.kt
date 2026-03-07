package de.ttt.management.tournament

import de.ttt.management.tournament.domain.*
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

    fun getTableByName(name: String): TTTable? = ttTableRepository.findByName(name).orElse(null)

    @Transactional
    fun lockTable(id: Long): Boolean {
        ttTableRepository.findById(id).orElse(null) ?: return false
        return true
    }

    @Transactional
    fun unlockTable(id: Long): Boolean {
        ttTableRepository.findById(id).orElse(null) ?: return false
        return true
    }
}
