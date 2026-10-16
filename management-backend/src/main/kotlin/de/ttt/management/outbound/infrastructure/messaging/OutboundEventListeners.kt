package de.ttt.management.outbound.infrastructure.messaging

import de.ttt.management.outbound.application.OutboundService
import de.ttt.management.registration.PlayerRegistered
import de.ttt.management.registration.PlayerUnregistered
import de.ttt.management.tournament.MatchCompleted
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
    fun on(event: MatchCompleted) {
        outboundService.pushUpdate("MATCH_COMPLETED", event)
    }
}
