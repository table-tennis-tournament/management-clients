package de.ttt.management.tournament.application

import de.ttt.management.tournament.MatchCalled
import de.ttt.management.tournament.MatchCompleted
import de.ttt.management.tournament.MatchDeleted
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
        val previousTableId = match.tableId
        return try {
            match.assign(tableId)
            val updatedRows = matchRepository.assignMatch(matchId, tableId, LocalDateTime.now())
            if (updatedRows > 0) {
                matchListService.removeMatchFromList(matchId)
                eventPublisher.publishEvent(MatchAssigned(matchId = matchId, tableId = tableId, typeId = match.typeId, previousTableId = previousTableId))
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
        val previousTableId = match.tableId
        return try {
            match.start()
            val updatedRows = matchRepository.startMatch(matchId, tableId, LocalDateTime.now())
            if (updatedRows > 0) {
                matchListService.removeMatchFromList(matchId)
                eventPublisher.publishEvent(MatchStarted(matchId = matchId, tableId = tableId, typeId = match.typeId, previousTableId = previousTableId))
                true
            } else {
                false
            }
        } catch (e: IllegalArgumentException) {
            false
        }
    }

    /**
     * Takes a running match back from its table (the table manager's "back" action).
     * Publishes [MatchTakenBack] like the administrator's take back.
     */
    @Transactional
    fun stopMatch(matchId: Long): Boolean {
        val isPlaying = matchRepository.isMatchPlaying(matchId)
        if (!isPlaying) {
            return false
        }

        val match = matchRepository.findById(matchId).orElse(null)
        val updatedRows = matchRepository.stopMatch(matchId)
        if (updatedRows > 0) {
            eventPublisher.publishEvent(takenBackEvent(listOfNotNull(match)))
        }
        return updatedRows > 0
    }

    @Transactional
    fun removeMatchesFromTable(matchIds: List<Long>): Boolean {
        var allSuccess = true
        val removed = mutableListOf<TournamentMatch>()
        for (matchId in matchIds) {
            val match = matchRepository.findById(matchId).orElse(null)
            if (matchRepository.removeFromTable(matchId) == 0) {
                allSuccess = false
            } else if (match != null) {
                removed.add(match)
            }
        }
        if (removed.isNotEmpty()) {
            eventPublisher.publishEvent(takenBackEvent(removed))
        }
        return allSuccess
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
                        sets2 = match.sets2 ?: 0,
                        typeId = match.typeId,
                        tableId = match.tableId
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
                        sets2 = match.sets2 ?: 0,
                        typeId = match.typeId,
                        tableId = match.tableId
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
        val match = matchRepository.findById(id).orElse(null)
        val deleted = matchRepository.deleteById(id) > 0
        if (deleted) {
            eventPublisher.publishEvent(
                MatchDeleted(
                    matchIds = listOf(id),
                    typeIds = listOfNotNull(match?.typeId),
                    tableIds = listOfNotNull(match?.tableId)
                )
            )
        }
        return deleted
    }

    @Transactional
    fun deleteType(id: Long): Boolean {
        val matches = matchRepository.findByTypeId(id)
        val deleted = matchRepository.deleteByTypeId(id) > 0
        if (deleted) {
            eventPublisher.publishEvent(
                MatchDeleted(
                    matchIds = matches.mapNotNull { it.id },
                    typeIds = listOf(id),
                    tableIds = matches.mapNotNull { it.tableId }
                )
            )
        }
        return deleted
    }

    @Transactional
    fun freeMatches(matchIds: List<Long>): Boolean {
        var allSuccess = true
        val freed = mutableListOf<TournamentMatch>()
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
                freed.add(match)
            }
        }
        if (freed.isNotEmpty()) {
            eventPublisher.publishEvent(
                MatchFreed(freed.mapNotNull { it.id }, freed.mapNotNull { it.typeId }, freed.mapNotNull { it.tableId })
            )
        }
        return allSuccess
    }

    @Transactional
    fun takeBackMatches(matchIds: List<Long>): Boolean {
        var allSuccess = true
        val affected = mutableListOf<TournamentMatch>()
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
                affected.add(match)
            }
        }
        if (affected.isNotEmpty()) {
            eventPublisher.publishEvent(takenBackEvent(affected))
        }
        return allSuccess
    }

    @Transactional
    fun callMatches(matchIds: List<Long>): Boolean {
        var allSuccess = true
        val called = mutableListOf<TournamentMatch>()
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
                called.add(match)
            }
        }
        if (called.isNotEmpty()) {
            eventPublisher.publishEvent(calledEvent(called, CallState.FirstCall))
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
            eventPublisher.publishEvent(calledEvent(listOf(match), match.callState))
        }
        return updated
    }

    private fun takenBackEvent(matches: List<TournamentMatch>) = MatchTakenBack(
        matchIds = matches.mapNotNull { it.id },
        typeIds = matches.mapNotNull { it.typeId },
        tableIds = matches.mapNotNull { it.tableId }
    )

    private fun calledEvent(matches: List<TournamentMatch>, callState: CallState) = MatchCalled(
        matchIds = matches.mapNotNull { it.id },
        callState = callState.name,
        typeIds = matches.mapNotNull { it.typeId },
        tableIds = matches.mapNotNull { it.tableId }
    )
}
