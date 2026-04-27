package de.ttt.management.tournament.application

import de.ttt.management.tournament.domain.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service("tournamentTableService")
class TableService(
    private val ttTableRepository: TTTableRepository,
    private val matchOnTableRepository: MatchOnTableRepository,
    private val matchService: MatchService
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

    @Transactional
    fun setMatchToTable(tableName: String, matchIds: List<Long>): Boolean {
        val table = getTableByName(tableName) ?: return false
        var allSuccess = true
        for (matchId in matchIds) {
            if (!matchService.startMatch(matchId, table.id!!)) {
                allSuccess = false
            }
        }
        return allSuccess
    }
}
