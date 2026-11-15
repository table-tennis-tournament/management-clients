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
    fun assignMatch(matchId: Long, tableId: Long): Boolean =
        transition(listOf(matchId), { it.assign(tableId) }, onSaved = { matchListService.removeMatchFromList(matchId) }) { (t) ->
            MatchAssigned(matchId = matchId, tableId = tableId, typeId = t.match.typeId, previousTableId = t.previousTableId)
        }

    @Transactional
    fun startMatch(matchId: Long, tableId: Long): Boolean =
        transition(listOf(matchId), { it.start(tableId) }, onSaved = { matchListService.removeMatchFromList(matchId) }) { (t) ->
            MatchStarted(matchId = matchId, tableId = tableId, typeId = t.match.typeId, previousTableId = t.previousTableId)
        }

    /**
     * Takes a running match back from its table (the table manager's "back" action).
     * Publishes [MatchTakenBack] like the administrator's take back.
     */
    @Transactional
    fun stopMatch(matchId: Long): Boolean =
        transition(listOf(matchId), { require(it.isPlaying) { "Only a running match can be stopped" }; it.takeBack() }, event = ::takenBackEvent)

    @Transactional
    fun removeMatchesFromTable(matchIds: List<Long>): Boolean =
        transition(matchIds, TournamentMatch::takeBack, event = ::takenBackEvent)

    @Transactional
    fun setResult(matchId: Long, sets: List<SetResult>): Boolean =
        transition(listOf(matchId), { it.complete(sets) }) { (t) ->
            MatchCompleted(
                matchId = matchId,
                winnerId = t.match.winner?.id,
                sets1 = t.match.sets1 ?: 0,
                sets2 = t.match.sets2 ?: 0,
                typeId = t.match.typeId,
                tableId = t.previousTableId
            )
        }

    @Transactional
    fun updateResult(matchId: Long, sets: List<SetResult>): Boolean =
        transition(listOf(matchId), { it.enterResult(sets) }) { (t) ->
            MatchResultUpdated(
                matchId = matchId,
                sets1 = t.match.sets1 ?: 0,
                sets2 = t.match.sets2 ?: 0,
                typeId = t.match.typeId,
                tableId = t.previousTableId
            )
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
    fun freeMatches(matchIds: List<Long>): Boolean =
        transition(matchIds, TournamentMatch::free) { freed ->
            MatchFreed(freed.mapNotNull { it.match.id }, freed.mapNotNull { it.match.typeId }, freed.mapNotNull { it.previousTableId })
        }

    @Transactional
    fun takeBackMatches(matchIds: List<Long>): Boolean =
        transition(matchIds, TournamentMatch::takeBack, event = ::takenBackEvent)

    @Transactional
    fun callMatches(matchIds: List<Long>): Boolean =
        transition(matchIds, TournamentMatch::call) { calledEvent(it, CallState.FirstCall) }

    @Transactional
    fun callPlayers(matchId: Long): Boolean {
        val match = matchRepository.findById(matchId).orElse(null) ?: return false
        if (match.callState == CallState.None || match.callState == CallState.ThirdCall) {
            return true // nothing to advance
        }
        return transition(listOf(matchId), TournamentMatch::callAgain) { calledEvent(it, it.first().match.callState) }
    }

    /** A match after a transition, together with the table it was on before. */
    private class Transitioned(val match: TournamentMatch, val previousTableId: Long?)

    /**
     * Loads each match, lets it decide the transition, saves it and publishes one event built
     * from the transitioned matches. [onSaved] runs for each saved match before the event is
     * published. A missing match, a rejected transition or a failed save
     * counts as a failure; the other matches are still processed.
     */
    private fun transition(
        matchIds: List<Long>,
        apply: (TournamentMatch) -> Unit,
        onSaved: (TournamentMatch) -> Unit = {},
        event: (List<Transitioned>) -> Any
    ): Boolean {
        var allSuccess = true
        val transitioned = mutableListOf<Transitioned>()
        for (matchId in matchIds) {
            val match = matchRepository.findById(matchId).orElse(null)
            if (match == null) {
                allSuccess = false
                continue
            }
            val previousTableId = match.tableId
            try {
                apply(match)
            } catch (e: IllegalArgumentException) {
                allSuccess = false
                continue
            }
            if (matchRepository.save(match) == 0) {
                allSuccess = false
            } else {
                onSaved(match)
                transitioned.add(Transitioned(match, previousTableId))
            }
        }
        if (transitioned.isNotEmpty()) {
            eventPublisher.publishEvent(event(transitioned))
        }
        return allSuccess
    }

    private fun takenBackEvent(matches: List<Transitioned>) = MatchTakenBack(
        matchIds = matches.mapNotNull { it.match.id },
        typeIds = matches.mapNotNull { it.match.typeId },
        tableIds = matches.mapNotNull { it.previousTableId }
    )

    private fun calledEvent(matches: List<Transitioned>, callState: CallState) = MatchCalled(
        matchIds = matches.mapNotNull { it.match.id },
        callState = callState.name,
        typeIds = matches.mapNotNull { it.match.typeId },
        tableIds = matches.mapNotNull { it.previousTableId }
    )
}
