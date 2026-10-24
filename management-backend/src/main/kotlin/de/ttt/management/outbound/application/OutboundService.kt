package de.ttt.management.outbound.application

import de.ttt.management.outbound.domain.WebSocketSender
import org.springframework.stereotype.Service

@Service
class OutboundService(private val webSocketSender: WebSocketSender) {

    fun pushUpdate(type: String, payload: Any) {
        webSocketSender.send("/topic/updates", mapOf("type" to type, "payload" to payload))
    }
}
