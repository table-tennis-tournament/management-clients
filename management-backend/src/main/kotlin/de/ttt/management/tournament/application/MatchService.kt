package de.ttt.management.tournament.application

import de.ttt.management.tournament.MatchCalled
import de.ttt.management.tournament.MatchCompleted
import de.ttt.management.tournament.MatchAssigned
import de.ttt.management.tournament.MatchFreed
import de.ttt.management.tournament.MatchResultUpdated
import de.ttt.management.tournament.MatchStarted
import de.ttt.management.tournament.MatchTakenBack
import de.ttt.management.tournament.domain.*
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service("tournamentMatchService")
class MatchService(
    private val matchRepository: TournamentMatchRepository,
    private val disciplineRepository: TournamentDisciplineRepository,
    private val matchListService: MatchListService,
    private val eventPublisher: ApplicationEventPublisher
) {

    fun getAllMatches(): List<TournamentMatch> = matchRepository.findAll()

    fun getMatch(id: Long): TournamentMatch? = matchRepository.findById(id).orElse(null)

    fun getMatchesByType(typeId: Long): List<TournamentMatch> = matchRepository.findByTypeId(typeId)

    fun getOpenMatches(): List<TournamentMatch> = matchRepository.findOpen()

    fun getOpenMatchesByTypeId(typeId: Long): List<TournamentMatch> = matchRepository.findOpenByTypeId(typeId)

    fun getPlayedMatches(): List<TournamentMatch> = matchRepository.findPlayed()

    fun getPlayedMatchesByTypeId(typeId: Long): List<TournamentMatch> = matchRepository.findPlayedByTypeId(typeId)

    fun getMatchesByCallState(callState: CallState): List<TournamentMatch> = matchRepository.findByCallState(callState)

    fun getMatchesOnTables(tableIds: Collection<Long>): List<TournamentMatch> = matchRepository.findByTableIds(tableIds)

    fun getAllTypes(): List<TournamentDiscipline> = disciplineRepository.findAll()

    fun getActiveTypes(): List<TournamentDiscipline> = disciplineRepository.findAll().filter { it.active }

    @Transactional
    fun assignMatch(matchId: Long, tableId: Long): Boolean {
        val match = matchRepository.findById(matchId).orElse(null) ?: return false
        return try {
            match.assign(tableId)
            val updatedRows = matchRepository.assignMatch(matchId, tableId, LocalDateTime.now())
            if (updatedRows > 0) {
                matchListService.removeMatchFromList(matchId)
                eventPublisher.publishEvent(MatchAssigned(matchId = matchId, tableId = tableId))
                true
            } else {
                false
            }
        } catch (e: IllegalArgumentException) {
            false
        }
    }

    @Transactional
    fun startMatch(matchId: Long, tableId: Long): Boolean {
        val match = matchRepository.findById(matchId).orElse(null) ?: return false
        return try {
            match.start()
            val updatedRows = matchRepository.startMatch(matchId, tableId, LocalDateTime.now())
            if (updatedRows > 0) {
                matchListService.removeMatchFromList(matchId)
                eventPublisher.publishEvent(MatchStarted(matchId = matchId, tableId = tableId))
                true
            } else {
                false
            }
        } catch (e: IllegalArgumentException) {
            false
        }
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
    fun setResult(matchId: Long, sets: List<SetResult>): Boolean {
        val match = matchRepository.findById(matchId).orElse(null) ?: return false
        return try {
            match.complete(sets)
            val updatedRows = matchRepository.completeResult(
                matchId = matchId,
                resultRaw = match.resultRaw ?: "",
                result = match.result ?: "",
                sets1 = match.sets1 ?: 0,
                sets2 = match.sets2 ?: 0,
                balls1 = match.balls1 ?: 0,
                balls2 = match.balls2 ?: 0,
                winnerId = match.winner?.id
            )
            if (updatedRows > 0) {
                eventPublisher.publishEvent(
                    MatchCompleted(
                        matchId = matchId,
                        winnerId = match.winner?.id,
                        sets1 = match.sets1 ?: 0,
                        sets2 = match.sets2 ?: 0
                    )
                )
                true
            } else {
                false
            }
        } catch (e: IllegalArgumentException) {
            false
        }
    }

    @Transactional
    fun updateResult(matchId: Long, sets: List<SetResult>): Boolean {
        val match = matchRepository.findById(matchId).orElse(null) ?: return false
        return try {
            match.enterResult(sets)
            val updatedRows = matchRepository.updatePartialResult(
                matchId = matchId,
                resultRaw = match.resultRaw ?: "",
                result = match.result ?: "",
                sets1 = match.sets1 ?: 0,
                sets2 = match.sets2 ?: 0,
                balls1 = match.balls1 ?: 0,
                balls2 = match.balls2 ?: 0
            )
            if (updatedRows > 0) {
                eventPublisher.publishEvent(
                    MatchResultUpdated(
                        matchId = matchId,
                        sets1 = match.sets1 ?: 0,
                        sets2 = match.sets2 ?: 0
                    )
                )
                true
            } else {
                false
            }
        } catch (e: IllegalArgumentException) {
            false
        }
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
            val match = matchRepository.findById(matchId).orElse(null)
            if (match == null) {
                allSuccess = false
                continue
            }
            match.free()
            if (matchRepository.freeMatch(matchId) == 0) {
                allSuccess = false
            } else {
                eventPublisher.publishEvent(MatchFreed(matchId = matchId))
            }
        }
        return allSuccess
    }

    @Transactional
    fun takeBackMatches(matchIds: List<Long>): Boolean {
        var allSuccess = true
        for (matchId in matchIds) {
            val match = matchRepository.findById(matchId).orElse(null)
            if (match == null) {
                allSuccess = false
                continue
            }
            match.takeBack()
            if (matchRepository.takeBackMatch(matchId) == 0) {
                allSuccess = false
            } else {
                eventPublisher.publishEvent(MatchTakenBack(matchId = matchId))
            }
        }
        return allSuccess
    }

    @Transactional
    fun callMatches(matchIds: List<Long>): Boolean {
        var allSuccess = true
        for (matchId in matchIds) {
            val match = matchRepository.findById(matchId).orElse(null)
            if (match == null) {
                allSuccess = false
                continue
            }
            match.call()
            if (matchRepository.updateCallState(matchId, match.callState) == 0) {
                allSuccess = false
            } else {
                eventPublisher.publishEvent(MatchCalled(matchId = matchId, callState = match.callState.name))
            }
        }
        return allSuccess
    }

    @Transactional
    fun callPlayers(matchId: Long): Boolean {
        val match = matchRepository.findById(matchId).orElse(null) ?: return false
        val previous = match.callState
        match.callAgain()
        if (match.callState == previous) {
            return true
        }
        val updated = matchRepository.updateCallState(matchId, match.callState) > 0
        if (updated) {
            eventPublisher.publishEvent(MatchCalled(matchId = matchId, callState = match.callState.name))
        }
        return updated
    }
}
