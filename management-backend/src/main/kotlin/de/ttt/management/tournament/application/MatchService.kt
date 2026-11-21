package de.ttt.management.tournament.application

import de.ttt.management.tournament.KnockoutMatchFilled
import de.ttt.management.tournament.MatchCallRequested
import de.ttt.management.tournament.MatchCalled
import de.ttt.management.tournament.MatchCompleted
import de.ttt.management.tournament.MatchDeleted
import de.ttt.management.tournament.MatchAssigned
import de.ttt.management.tournament.MatchFreed
import de.ttt.management.tournament.MatchResultUpdated
import de.ttt.management.tournament.MatchStarted
import de.ttt.management.tournament.MatchTakenBack
import de.ttt.management.tournament.domain.*
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Clock
import java.time.LocalDateTime
import java.time.OffsetDateTime

@Service("tournamentMatchService")
class MatchService(
    private val matchRepository: TournamentMatchRepository,
    private val tableRepository: TTTableRepository,
    private val disciplineRepository: TournamentDisciplineRepository,
    private val matchListService: MatchListService,
    private val eventPublisher: ApplicationEventPublisher,
    private val clock: Clock
) {

    fun getAllMatches(): List<TournamentMatch> = matchRepository.findAll()

    fun getMatch(id: Long): TournamentMatch? = matchRepository.findById(id).orElse(null)

    fun getMatchesByType(typeId: Long): List<TournamentMatch> = matchRepository.findByTypeId(typeId)

    fun getOpenMatches(): List<TournamentMatch> = matchRepository.findOpen()

    fun getOpenMatchesByTypeId(typeId: Long): List<TournamentMatch> = matchRepository.findOpenByTypeId(typeId)

    fun getPlayedMatches(): List<TournamentMatch> = matchRepository.findPlayed()

    fun getPlayedMatchesByTypeId(typeId: Long): List<TournamentMatch> = matchRepository.findPlayedByTypeId(typeId)

    /** The matches at a table whose first Call is not announced yet. */
    fun getMatchesWaitingForFirstCall(): List<TournamentMatch> = matchRepository.findWaitingForFirstCall()

    /** The matches at a table with a requested call ([TournamentMatch.requestedCallNumber]) waiting for the caller. */
    fun getMatchesWithRequestedCall(): List<TournamentMatch> = matchRepository.findWithRequestedCall()

    fun getMatchesOnTables(tableIds: Collection<Long>): List<TournamentMatch> = matchRepository.findByTableIds(tableIds)

    fun getAllTypes(): List<TournamentDiscipline> = disciplineRepository.findAll()

    fun getActiveTypes(): List<TournamentDiscipline> = disciplineRepository.findAll().filter { it.active }

    /** A match can only go to a table that exists and is not locked. */
    private fun isUsableTable(tableId: Long): Boolean =
        tableRepository.findById(tableId).map { !it.isLocked }.orElse(false)

    @Transactional
    fun assignMatch(matchId: Long, tableId: Long): Boolean = isUsableTable(tableId) &&
        transition(listOf(matchId), { it.assign(tableId, LocalDateTime.now(clock)) }, onSaved = { matchListService.removeMatchFromList(matchId) }) { (t) ->
            MatchAssigned(matchId = matchId, tableId = tableId, typeId = t.match.typeId, previousTableId = t.movedFrom(tableId), affectedTypeIds = affectedTypeIds(listOf(t.match)))
        }

    @Transactional
    fun startMatch(matchId: Long, tableId: Long): Boolean = isUsableTable(tableId) &&
        transition(listOf(matchId), { it.start(tableId, LocalDateTime.now(clock)) }, onSaved = { matchListService.removeMatchFromList(matchId) }) { (t) ->
            MatchStarted(matchId = matchId, tableId = tableId, typeId = t.match.typeId, previousTableId = t.movedFrom(tableId), affectedTypeIds = affectedTypeIds(listOf(t.match)))
        }

    /**
     * Takes a running match back from its table (the table manager's "back" action).
     * Publishes [MatchTakenBack] like the administrator's take back.
     */
    @Transactional
    fun takeBackRunningMatch(matchId: Long): Boolean =
        transition(listOf(matchId), { require(it.isPlaying) { "Only a running match can be taken back" }; it.takeBack() }, event = ::takenBackEvent)

    @Transactional
    /**
     * Takes matches that wait at two tables off table [tableId] ("Entfernen"); each keeps waiting at its other
     * table. A match at only one table is rejected.
     */
    fun removeMatchesFromTable(tableId: Long, matchIds: List<Long>): Boolean =
        matchIds.map { matchId ->
            transition(listOf(matchId), { it.leaveOneTable(tableId) }) { (t) ->
                MatchAssigned(
                    matchId = matchId,
                    tableId = t.match.tableId!!,
                    typeId = t.match.typeId,
                    previousTableId = tableId
                )
            }
        }.all { it }

    /** Puts a match that waits at a table on [tableId] as well, for a group that plays on two tables. */
    @Transactional
    fun assignSecondTable(matchId: Long, tableId: Long): Boolean = isUsableTable(tableId) &&
        transition(listOf(matchId), { it.assignSecondTable(tableId) }) { (t) ->
            MatchAssigned(matchId = matchId, tableId = tableId, typeId = t.match.typeId, previousTableId = null)
        }

    /**
     * Completes the match with its final result, as a Walkover when it was [kampflos]. In the knockout stage its
     * winner then moves on into the next match of the bracket, in the same transaction.
     */
    @Transactional
    fun setResult(matchId: Long, sets: List<SetResult>, kampflos: Boolean = false): Boolean {
        val completed = transition(listOf(matchId), { it.complete(sets, kampflos) }) { (t) ->
            MatchCompleted(
                matchId = matchId,
                winnerId = t.match.winnerSideId,
                walkover = t.match.isKampflos,
                sets1 = t.match.sets1 ?: 0,
                sets2 = t.match.sets2 ?: 0,
                typeId = t.match.typeId,
                tableId = t.previousTableId,
                affectedTypeIds = affectedTypeIds(listOf(t.match))
            )
        }
        if (completed) moveKnockoutWinnerOn(matchId)
        return completed
    }

    /**
     * The legacy backend's `writeNextKoMatch`: puts the winner of the knockout match [matchId] into its Side of
     * the next match. Nothing moves on from a group match or the final; a missing next match is logged.
     */
    private fun moveKnockoutWinnerOn(matchId: Long) {
        val match = matchRepository.findById(matchId).orElse(null) ?: return
        val nextNr = match.nextKnockoutMatchNr ?: return
        val typeId = match.typeId ?: return
        val next = matchRepository.findByTypeIdAndNr(typeId, nextNr)
        if (next == null) {
            log.warn("The winner of match {} (nr {}) cannot move on: discipline {} has no match nr {}", matchId, match.nr, typeId, nextNr)
            return
        }
        next.takeWinnerOf(match)
        if (matchRepository.saveSides(next) > 0) {
            eventPublisher.publishEvent(
                KnockoutMatchFilled(
                    matchId = requireNotNull(next.id),
                    fromMatchId = matchId,
                    typeId = next.typeId,
                    tableIds = listOfNotNull(next.tableId, next.secondTableId)
                )
            )
        }
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
                    tableIds = listOfNotNull(match?.tableId, match?.secondTableId),
                    affectedTypeIds = affectedTypeIds(listOfNotNull(match))
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
                    tableIds = matches.flatMap { listOfNotNull(it.tableId, it.secondTableId) }.distinct(),
                    affectedTypeIds = affectedTypeIds(matches)
                )
            )
        }
        return deleted
    }

    @Transactional
    fun freeMatches(matchIds: List<Long>): Boolean =
        transition(matchIds, TournamentMatch::free) { freed ->
            MatchFreed(
                freed.mapNotNull { it.match.id },
                freed.mapNotNull { it.match.typeId }.distinct(),
                freed.flatMap { it.previousTableIds }.distinct(),
                affectedTypeIds(freed.map { it.match })
            )
        }

    @Transactional
    fun takeBackMatches(matchIds: List<Long>): Boolean =
        transition(matchIds, TournamentMatch::takeBack, event = ::takenBackEvent)

    /** The caller announces the first Call of the matches. */
    @Transactional
    fun callMatches(matchIds: List<Long>): Boolean =
        transition(matchIds, { it.call(OffsetDateTime.now(clock)) }) { called ->
            calledEvent(called, callNumber = 1, playerIds = called.flatMap { it.match.playerCalls.map(PlayerCall::playerId) })
        }

    /** The table manager requests the next call of the players [playerIds] of match [matchId], who have not appeared. */
    @Transactional
    fun requestCall(matchId: Long, playerIds: List<Long>): Boolean =
        transition(listOf(matchId), { it.requestCall(playerIds) }) { (t) ->
            MatchCallRequested(
                matchId = matchId,
                callNumber = requireNotNull(t.match.requestedCallNumber),
                playerIds = playerIds.distinct(),
                typeId = t.match.typeId,
                tableIds = t.previousTableIds
            )
        }

    /** The caller announces the requested calls of the matches. */
    @Transactional
    fun announceRequestedCalls(matchIds: List<Long>): Boolean {
        val announced = mutableListOf<PlayerCall>()
        return transition(matchIds, { match ->
            val requested = match.playerCalls.filter { it.requested }
            match.announceRequestedCall()
            announced += requested
        }) { called ->
            calledEvent(called, callNumber = announced.maxOf { it.callNumber + 1 }, playerIds = announced.map { it.playerId })
        }
    }

    /** A match after a transition, together with the tables it waited at before (two for a group on two tables). */
    private class Transitioned(val match: TournamentMatch, val previousTableIds: List<Long>) {
        /** The table the match was on before. */
        val previousTableId: Long? get() = previousTableIds.firstOrNull()

        /** The table the match left by going to [tableId], if any: the one it was on, or the other of its two tables. */
        fun movedFrom(tableId: Long): Long? = previousTableIds.firstOrNull { it != tableId }
    }

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
            val previousTableIds = listOfNotNull(match.tableId, match.secondTableId)
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
                transitioned.add(Transitioned(match, previousTableIds))
            }
        }
        if (transitioned.isNotEmpty()) {
            eventPublisher.publishEvent(event(transitioned))
        }
        return allSuccess
    }

    private fun takenBackEvent(matches: List<Transitioned>) = MatchTakenBack(
        matchIds = matches.mapNotNull { it.match.id },
        typeIds = matches.mapNotNull { it.match.typeId }.distinct(),
        tableIds = matches.flatMap { it.previousTableIds }.distinct(),
        affectedTypeIds = affectedTypeIds(matches.map { it.match })
    )

    /**
     * The other disciplines whose matches change `isPlayable` when [matches] start or stop blocking
     * their players: open matches of the same players elsewhere.
     */
    private fun affectedTypeIds(matches: List<TournamentMatch>): List<Long> {
        val playerIds = matches.flatMap { it.team1 + it.team2 }.mapNotNull { it.id }.toSet()
        val ownTypeIds = matches.mapNotNull { it.typeId }.toSet()
        return matchRepository.findOpenTypeIdsOfPlayers(playerIds, matches.mapNotNull { it.id })
            .filter { it !in ownTypeIds }
            .sorted()
    }

    private fun calledEvent(matches: List<Transitioned>, callNumber: Int, playerIds: List<Long>) = MatchCalled(
        matchIds = matches.mapNotNull { it.match.id },
        callNumber = callNumber,
        playerIds = playerIds.distinct(),
        typeIds = matches.mapNotNull { it.match.typeId }.distinct(),
        tableIds = matches.flatMap { it.previousTableIds }.distinct()
    )

    private companion object {
        val log = LoggerFactory.getLogger(MatchService::class.java)
    }
}
