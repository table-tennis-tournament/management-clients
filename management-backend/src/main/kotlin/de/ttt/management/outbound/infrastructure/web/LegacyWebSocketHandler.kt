package de.ttt.management.outbound.infrastructure.web

import de.ttt.management.outbound.domain.LegacyWebSocketSender
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.concurrent.ConcurrentHashMap

@Component
class LegacyWebSocketHandler : TextWebSocketHandler(), LegacyWebSocketSender {

    private val log = LoggerFactory.getLogger(LegacyWebSocketHandler::class.java)

    private val sessions = ConcurrentHashMap.newKeySet<WebSocketSession>()

    override fun afterConnectionEstablished(session: WebSocketSession) {
        sessions.add(session)
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        sessions.remove(session)
    }

    override fun broadcast(message: String) {
        val text = TextMessage(message)
        sessions.forEach { session ->
            try {
                if (session.isOpen) {
                    session.sendMessage(text)
                }
            } catch (e: Exception) {
                log.warn("legacy send failed", e)
                sessions.remove(session)
            }
        }
    }
}
