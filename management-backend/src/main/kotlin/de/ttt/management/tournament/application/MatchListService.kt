package de.ttt.management.tournament.application

import de.ttt.management.tournament.domain.MatchList
import org.springframework.stereotype.Service
import java.util.*

@Service("tournamentMatchListService")
class MatchListService {

    private val matchLists = mutableListOf<MatchList>()
    private var matchListActive = true

    fun getAllMatchList(): List<MatchList> = matchLists.sortedBy { it.position }

    fun addMatchToList(matchIds: List<Long>, asGroup: Long?, position: Int): MatchList {
        val newList = MatchList(UUID.randomUUID().toString(), matchIds, asGroup, position)
        matchLists.add(newList)
        return newList
    }

    fun deleteMatchFromList(uuid: String): Boolean = matchLists.removeIf { it.uuid == uuid }

    fun getNextMatchFromList(): MatchList? = if (matchListActive) matchLists.minByOrNull { it.position } else null

    fun setMatchListActive(active: Boolean) { this.matchListActive = active }

    fun moveMatchListEntry(uuid: String, newPosition: Int): Boolean {
        val entry = matchLists.find { it.uuid == uuid } ?: return false
        entry.position = newPosition
        return true
    }

    fun removeMatchFromList(matchId: Long) {
        matchLists.removeIf { it.matchIds.contains(matchId) }
    }
}
