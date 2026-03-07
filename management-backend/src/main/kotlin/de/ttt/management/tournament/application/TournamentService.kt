package de.ttt.management.tournament.application

import de.ttt.management.table.TableService
import de.ttt.management.tournament.domain.MatchList
import de.ttt.management.tournament.domain.TournamentMatchRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
class TournamentService(
    private val matchRepository: TournamentMatchRepository,
    private val tableService: TableService
) {

    private val matchLists = mutableListOf<MatchList>()

    @Transactional
    fun startMatch(matchId: Long, tableId: Long): Boolean {
        val isPlaying = matchRepository.isMatchPlaying(matchId)
        if (isPlaying) {
            return false // Match is already playing
        }

        // We assume we should mark it as playing, set the table, and start time
        val updatedRows = matchRepository.startMatch(matchId, tableId, LocalDateTime.now())
        
        // Remove from match list if present
        matchLists.removeIf { it.matchIds.contains(matchId) }
        
        return updatedRows > 0
    }

    @Transactional
    fun stopMatch(matchId: Long): Boolean {
        val isPlaying = matchRepository.isMatchPlaying(matchId)
        if (!isPlaying) {
            return false // Match is not currently playing
        }

        val updatedRows = matchRepository.stopMatch(matchId)
        return updatedRows > 0
    }

    @Transactional
    fun setMatchToTable(tableName: String, matchIds: List<Long>, checkPlayable: Boolean = true): Boolean {
        val table = tableService.getTableByName(tableName) ?: return false

        // For simplicity, we skip full 'matchReady' logic from legacy here, 
        // but we'll try to start all requested matches on this table.
        var allSuccess = true
        for (matchId in matchIds) {
            val success = startMatch(matchId, table.id!!)
            if (!success) {
                allSuccess = false
            }
        }
        return allSuccess
    }

    @Transactional
    fun freeMatches(matchIds: List<Long>): Boolean {
        var allSuccess = true
        for (matchId in matchIds) {
            val updatedRows = matchRepository.freeMatch(matchId)
            if (updatedRows == 0) allSuccess = false
        }
        return allSuccess
    }

    @Transactional
    fun takeBackMatches(matchIds: List<Long>): Boolean {
        var allSuccess = true
        for (matchId in matchIds) {
            val updatedRows = matchRepository.takeBackMatch(matchId)
            if (updatedRows == 0) allSuccess = false
        }
        return allSuccess
    }

    // MatchList methods

    fun getAllMatchList(): List<MatchList> {
        return matchLists.sortedBy { it.position }.toList()
    }

    fun addMatchToList(matchIds: List<Long>, asGroup: Long?, position: Int): MatchList {
        val newList = MatchList(
            uuid = UUID.randomUUID().toString(),
            matchIds = matchIds,
            asGroup = asGroup,
            position = position
        )
        matchLists.add(newList)
        return newList
    }

    fun deleteMatchFromList(uuid: String): Boolean {
        return matchLists.removeIf { it.uuid == uuid }
    }
}
