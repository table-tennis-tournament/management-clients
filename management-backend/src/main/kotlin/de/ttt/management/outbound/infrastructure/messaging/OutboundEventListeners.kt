package de.ttt.management.outbound.infrastructure.messaging

import de.ttt.management.outbound.application.OutboundService
import de.ttt.management.registration.PlayerRegistered
import de.ttt.management.registration.PlayerUnregistered
import de.ttt.management.tournament.MatchCalled
import de.ttt.management.tournament.MatchCompleted
import de.ttt.management.tournament.MatchFreed
import de.ttt.management.tournament.MatchListChanged
import de.ttt.management.tournament.MatchResultUpdated
import de.ttt.management.tournament.MatchStarted
import de.ttt.management.tournament.MatchTakenBack
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class OutboundEventListeners(private val outboundService: OutboundService) {

    @EventListener
    fun on(event: PlayerRegistered) {
        outboundService.pushUpdate("PLAYER_REGISTERED", event)
    }

    @EventListener
    fun on(event: PlayerUnregistered) {
        outboundService.pushUpdate("PLAYER_UNREGISTERED", event)
    }

    @EventListener
    fun on(event: MatchStarted) {
        outboundService.pushUpdate("MATCH_STARTED", event)
    }

    @EventListener
    fun on(event: MatchResultUpdated) {
        outboundService.pushUpdate("MATCH_RESULT_UPDATED", event)
    }

    @EventListener
    fun on(event: MatchCompleted) {
        outboundService.pushUpdate("MATCH_COMPLETED", event)
    }

    @EventListener
    fun on(event: MatchFreed) {
        outboundService.pushUpdate("MATCH_FREED", event)
    }

    @EventListener
    fun on(event: MatchTakenBack) {
        outboundService.pushUpdate("MATCH_TAKEN_BACK", event)
    }

    @EventListener
    fun on(event: MatchListChanged) {
        outboundService.pushUpdate("MATCH_LIST_CHANGED", event)
    }

    @EventListener
    fun on(event: MatchCalled) {
        outboundService.pushUpdate("MATCH_CALLED", event)
    }
}
