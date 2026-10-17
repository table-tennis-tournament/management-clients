package de.ttt.management.tournament.application

import de.ttt.management.tournament.domain.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service("tournamentTableService")
class TableService(
    private val ttTableRepository: TTTableRepository,
    private val matchRepository: TournamentMatchRepository,
    private val matchService: MatchService
) {

    fun getAllTables(): List<TTTable> = ttTableRepository.findAll().sortedBy { it.name?.toIntOrNull() ?: Int.MAX_VALUE }

    fun getFreeTables(): List<TTTable> {
        val allTables = ttTableRepository.findAll()
        val occupiedTableIds = matchRepository.findTableIdsInUse()
        return allTables
            .filter { !it.isLocked && it.id !in occupiedTableIds }
            .sortedBy { it.name?.toIntOrNull() ?: Int.MAX_VALUE }
    }

    fun getTable(id: Long): TTTable? = ttTableRepository.findById(id).orElse(null)

    fun getTableByName(name: String): TTTable? = ttTableRepository.findByName(name).orElse(null)

    @Transactional
    fun lockTable(id: Long): Boolean {
        return ttTableRepository.setLocked(id, true) > 0
    }

    @Transactional
    fun unlockTable(id: Long): Boolean {
        return ttTableRepository.setLocked(id, false) > 0
    }

    @Transactional
    fun setMatchToTable(tableName: String, matchIds: List<Long>): Boolean {
        val table = getTableByName(tableName) ?: return false
        var allSuccess = true
        for (matchId in matchIds) {
            if (!matchService.assignMatch(matchId, table.id!!)) {
                allSuccess = false
            }
        }
        return allSuccess
    }

    fun getTablesForManager(managerId: Long): List<TTTable> {
        val tableNumbers = TABLE_MANAGER_TABLES[managerId] ?: return emptyList()
        return ttTableRepository.findAll()
            .filter { it.name?.toIntOrNull() in tableNumbers }
            .sortedBy { it.name?.toIntOrNull() ?: Int.MAX_VALUE }
    }

    companion object {
        /**
         * Maps a table-manager id to the physical table numbers that manager is responsible for.
         * Migrated from the legacy backend's hardcoded `getByTablemanager` switch.
         */
        val TABLE_MANAGER_TABLES: Map<Long, Set<Int>> = mapOf(
            1L to setOf(1, 2, 3, 4, 5),
            2L to setOf(6, 7, 8, 11, 12),
            3L to setOf(9, 10, 13, 14, 15),
            4L to setOf(16, 17, 18, 19, 20),
            5L to setOf(21, 22, 23, 24)
        )
    }
}
