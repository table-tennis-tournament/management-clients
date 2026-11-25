package de.ttt.management.outbound.infrastructure.web

import de.ttt.management.outbound.domain.WebSocketSender
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class WebSocketSenderImpl(private val messagingTemplate: SimpMessagingTemplate) : WebSocketSender {

    override fun send(destination: String, payload: Any) {
        messagingTemplate.convertAndSend(destination, payload)
    }
}
