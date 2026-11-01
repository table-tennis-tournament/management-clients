package de.ttt.management.tournament.application

import de.ttt.management.tournament.domain.AutoStartHeuristic
import de.ttt.management.tournament.domain.TTTable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service("tournamentAutoStartService")
class AutoStartService(
    private val tableService: TableService,
    private val matchService: MatchService,
    private val matchListService: MatchListService
) {

    @Transactional
    fun autoStart(): Boolean {
        if (!matchListService.isActive()) {
            return true
        }

        var allStarted = true
        for (table in freeTablesOrdered()) {
            val entries = matchListService.getAllMatchList()
            val matchesById = matchService.getAllMatches().filter { it.id != null }.associateBy { it.id!! }
            val next = AutoStartHeuristic.selectNext(entries, matchesById) ?: break
            for (matchId in next.matchIds) {
                if (!matchService.startMatch(matchId, table.id!!)) {
                    allStarted = false
                }
            }
        }
        return allStarted
    }

    /**
     * Free tables sorted by number, odd numbers first then even, as in the legacy backend.
     */
    private fun freeTablesOrdered(): List<TTTable> {
        val free = tableService.getFreeTables().sortedBy { it.name?.toIntOrNull() ?: Int.MAX_VALUE }
        return free.filter { (it.name?.toIntOrNull() ?: 0) % 2 == 1 } +
            free.filter { (it.name?.toIntOrNull() ?: 0) % 2 == 0 }
    }
}
