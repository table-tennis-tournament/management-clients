package de.ttt.management.outbound

import org.springframework.context.event.EventListener
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service

@Service
class OutboundService(private val messagingTemplate: SimpMessagingTemplate) {

    @EventListener
    fun handleApplicationUpdate(event: ApplicationUpdateEvent) {
        val payload: Any = mapOf(
            "type" to event.type,
            "payload" to event.payload
        )
        messagingTemplate.convertAndSend("/topic/updates", payload)
    }
}
