package de.ttt.management.outbound.application

import de.ttt.management.outbound.domain.Topic
import de.ttt.management.outbound.domain.UpdateScope
import de.ttt.management.outbound.domain.WebSocketSender
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class OutboundService(private val webSocketSender: WebSocketSender) {

    /**
     * Publishes a thin update event on [topic]. The envelope is
     * `{"type": ..., "scope": {matchIds, typeIds, tableIds}, "payload": ...}`.
     */
    fun pushUpdate(topic: Topic, type: String, scope: UpdateScope, payload: Any) {
        // the change is already committed; a failing push must not turn the request into an error
        try {
            webSocketSender.send(
                topic.destination,
                mapOf("type" to type, "scope" to scope, "payload" to payload)
            )
        } catch (e: Exception) {
            log.error("Could not push update event {} to {}", type, topic.destination, e)
        }
    }

    private companion object {
        val log = LoggerFactory.getLogger(OutboundService::class.java)
    }
}
