package de.ttt.management.outbound.application

import de.ttt.management.outbound.domain.LegacyReadRepository
import de.ttt.management.outbound.domain.LegacyWebSocketSender
import de.ttt.management.registration.PlayerRegistered
import de.ttt.management.registration.PlayerUnregistered
import de.ttt.management.tournament.MatchAssigned
import de.ttt.management.tournament.MatchCalled
import de.ttt.management.tournament.MatchCompleted
import de.ttt.management.tournament.MatchFreed
import de.ttt.management.tournament.MatchListChanged
import de.ttt.management.tournament.MatchResultUpdated
import de.ttt.management.tournament.MatchStarted
import de.ttt.management.tournament.MatchTakenBack
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service
import tools.jackson.databind.ObjectMapper

/**
 * Publishes the legacy backend's v1 WebSocket messages over a raw SockJS channel.
 *
 * Temporary: on every domain event it pushes the full state in the v1 shape so the existing
 * Angular clients keep working unchanged. Deleted when the frontends move to STOMP.
 */
@Service
class LegacyOutboundService(
    private val readRepository: LegacyReadRepository,
    private val sender: LegacyWebSocketSender,
    private val objectMapper: ObjectMapper
) {

    @EventListener(
        classes = [
            MatchStarted::class,
            MatchAssigned::class,
            MatchCompleted::class,
            MatchResultUpdated::class,
            MatchFreed::class,
            MatchTakenBack::class,
            MatchCalled::class,
            MatchListChanged::class,
            PlayerRegistered::class,
            PlayerUnregistered::class
        ]
    )
    fun onDomainEvent(event: Any) {
        try {
            refresh()
        } catch (e: Exception) {
            // The legacy shim must never break the main request flow.
            log.warn("Failed to broadcast legacy WebSocket update", e)
        }
    }

    fun refresh() {
        broadcast("UpdateMatches", readRepository.fetchAllMatches())
        broadcast("UpdateTable", readRepository.fetchAllTables())
        broadcast("UpdateMatchList", readRepository.fetchMatchList())
        broadcast("UpdateTableManager", readRepository.fetchTableManagerTables())
    }

    private fun broadcast(type: String, payload: Any) {
        val message = objectMapper.writeValueAsString(mapOf(type to payload))
        sender.broadcast(message)
    }

    private companion object {
        val log = LoggerFactory.getLogger(LegacyOutboundService::class.java)
    }
}
