package de.ttt.management.outbound.infrastructure.messaging

import de.ttt.management.outbound.application.OutboundService
import de.ttt.management.outbound.domain.Topic
import de.ttt.management.outbound.domain.UpdateScope
import de.ttt.management.registration.DisciplineColorsChanged
import de.ttt.management.registration.PlayerPaid
import de.ttt.management.registration.PlayerRegistered
import de.ttt.management.registration.PlayerUnregistered
import de.ttt.management.tournament.MatchAssigned
import de.ttt.management.tournament.MatchCalled
import de.ttt.management.tournament.MatchCompleted
import de.ttt.management.tournament.MatchDeleted
import de.ttt.management.tournament.MatchFreed
import de.ttt.management.tournament.MatchListChanged
import de.ttt.management.tournament.MatchResultUpdated
import de.ttt.management.tournament.MatchStarted
import de.ttt.management.tournament.MatchTakenBack
import de.ttt.management.tournament.TableLockChanged
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

/**
 * Translates domain events into update events on the matching [Topic].
 *
 * Listeners run after the originating transaction has committed, so a client that
 * re-fetches on an update event always reads the committed state. Events published
 * outside a transaction are delivered immediately (`fallbackExecution`).
 */
@Component
class OutboundEventListeners(private val outboundService: OutboundService) {

    // --- matches -----------------------------------------------------------

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun on(event: MatchAssigned) {
        push(Topic.MATCHES, "MATCH_ASSIGNED", scope(listOf(event.matchId), listOfNotNull(event.typeId), listOfNotNull(event.tableId, event.previousTableId)), event)
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun on(event: MatchStarted) {
        push(Topic.MATCHES, "MATCH_STARTED", scope(listOf(event.matchId), listOfNotNull(event.typeId), listOfNotNull(event.tableId, event.previousTableId)), event)
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun on(event: MatchResultUpdated) {
        push(
            Topic.MATCHES, "MATCH_RESULT_UPDATED",
            scope(listOf(event.matchId), listOfNotNull(event.typeId), listOfNotNull(event.tableId)), event
        )
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun on(event: MatchCompleted) {
        push(
            Topic.MATCHES, "MATCH_COMPLETED",
            scope(listOf(event.matchId), listOfNotNull(event.typeId), listOfNotNull(event.tableId)), event
        )
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun on(event: MatchFreed) {
        push(Topic.MATCHES, "MATCH_FREED", scope(event.matchIds, event.typeIds, event.tableIds), event)
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun on(event: MatchTakenBack) {
        push(Topic.MATCHES, "MATCH_TAKEN_BACK", scope(event.matchIds, event.typeIds, event.tableIds), event)
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun on(event: MatchCalled) {
        push(Topic.MATCHES, "MATCH_CALLED", scope(event.matchIds, event.typeIds, event.tableIds), event)
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun on(event: MatchDeleted) {
        push(Topic.MATCHES, "MATCH_DELETED", scope(event.matchIds, event.typeIds, emptyList()), event)
    }

    // --- tables ------------------------------------------------------------

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun on(event: TableLockChanged) {
        val type = if (event.locked) "TABLE_LOCKED" else "TABLE_UNLOCKED"
        push(Topic.TABLES, type, scope(emptyList(), emptyList(), listOf(event.tableId)), event)
    }

    // --- queue -------------------------------------------------------------

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun on(event: MatchListChanged) {
        push(Topic.QUEUE, "MATCH_LIST_CHANGED", scope(event.entries.flatMap { it.matchIds }, emptyList(), emptyList()), event)
    }

    // --- players -----------------------------------------------------------

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun on(event: PlayerRegistered) {
        push(Topic.PLAYERS, "PLAYER_REGISTERED", UpdateScope(), event)
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun on(event: PlayerUnregistered) {
        push(Topic.PLAYERS, "PLAYER_UNREGISTERED", UpdateScope(), event)
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun on(event: PlayerPaid) {
        push(Topic.PLAYERS, "PLAYER_PAID", UpdateScope(), event)
    }

    // --- settings ----------------------------------------------------------

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    fun on(event: DisciplineColorsChanged) {
        push(Topic.SETTINGS, "DISCIPLINE_COLORS_CHANGED", scope(emptyList(), event.disciplineIds, emptyList()), event)
    }

    private fun push(topic: Topic, type: String, scope: UpdateScope, payload: Any) =
        outboundService.pushUpdate(topic, type, scope, payload)

    private fun scope(matchIds: List<Long>, typeIds: List<Long>, tableIds: List<Long>) =
        UpdateScope(matchIds.distinct(), typeIds.distinct(), tableIds.distinct())
}
