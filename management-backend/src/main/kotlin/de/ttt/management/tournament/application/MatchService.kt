package de.ttt.management.tournament.application

import de.ttt.management.tournament.domain.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service("tournamentMatchService")
class MatchService(
    private val matchRepository: TournamentMatchRepository,
    private val disciplineRepository: TournamentDisciplineRepository,
    private val matchListService: MatchListService
) {

    fun getAllMatches(): List<TournamentMatch> = matchRepository.findAll()

    fun getMatch(id: Long): TournamentMatch? = matchRepository.findById(id).orElse(null)

    fun getMatchesByType(typeId: Long): List<TournamentMatch> = matchRepository.findByTypeId(typeId)

    fun getOpenMatches(): List<TournamentMatch> = matchRepository.findOpen()

    fun getOpenMatchesByTypeId(typeId: Long): List<TournamentMatch> = matchRepository.findOpenByTypeId(typeId)

    fun getPlayedMatches(): List<TournamentMatch> = matchRepository.findPlayed()

    fun getPlayedMatchesByTypeId(typeId: Long): List<TournamentMatch> = matchRepository.findPlayedByTypeId(typeId)

    fun getAllTypes(): List<TournamentDiscipline> = disciplineRepository.findAll()

    fun getActiveTypes(): List<TournamentDiscipline> = disciplineRepository.findAll().filter { it.active }

    @Transactional
    fun startMatch(matchId: Long, tableId: Long): Boolean {
        val isPlaying = matchRepository.isMatchPlaying(matchId)
        if (isPlaying) {
            return false
        }

        val updatedRows = matchRepository.startMatch(matchId, tableId, LocalDateTime.now())
        matchListService.removeMatchFromList(matchId)
        return updatedRows > 0
    }

    @Transactional
    fun stopMatch(matchId: Long): Boolean {
        val isPlaying = matchRepository.isMatchPlaying(matchId)
        if (!isPlaying) {
            return false
        }

        val updatedRows = matchRepository.stopMatch(matchId)
        return updatedRows > 0
    }

    @Transactional
    fun setResult(matchId: Long, resultRaw: String, sets1: Int, sets2: Int): Boolean {
        val updatedRows = matchRepository.updateResult(matchId, resultRaw, sets1, sets2)
        return updatedRows > 0
    }

    @Transactional
    fun deleteMatch(id: Long): Boolean {
        return matchRepository.deleteById(id) > 0
    }

    @Transactional
    fun deleteType(id: Long): Boolean {
        return matchRepository.deleteByTypeId(id) > 0
    }

    @Transactional
    fun freeMatches(matchIds: List<Long>): Boolean {
        var allSuccess = true
        for (matchId in matchIds) {
            if (matchRepository.freeMatch(matchId) == 0) allSuccess = false
        }
        return allSuccess
    }

    @Transactional
    fun takeBackMatches(matchIds: List<Long>): Boolean {
        var allSuccess = true
        for (matchId in matchIds) {
            if (matchRepository.takeBackMatch(matchId) == 0) allSuccess = false
        }
        return allSuccess
    }
}
