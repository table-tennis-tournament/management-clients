package de.ttt.management.tournament.application

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

        val freeTables = tableService.getFreeTables().sortedBy { it.name?.toIntOrNull() ?: Int.MAX_VALUE }
        var allStarted = true
        for (table in freeTables) {
            val next = matchListService.getNextMatchFromList() ?: break
            for (matchId in next.matchIds) {
                if (!matchService.startMatch(matchId, table.id!!)) {
                    allStarted = false
                }
            }
        }
        return allStarted
    }
}
