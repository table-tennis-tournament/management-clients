package de.ttt.management.health.infrastructure

import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.boot.health.contributor.AbstractHealthIndicator
import org.springframework.boot.health.contributor.Health
import org.springframework.context.Lifecycle
import org.springframework.messaging.simp.broker.AbstractBrokerMessageHandler
import org.springframework.stereotype.Component
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.config.WebSocketMessageBrokerStats

/**
 * Readiness of the WebSocket (`/ttt-websocket`): the STOMP endpoint accepts sessions and the broker
 * delivers to the update topics. Both are lifecycle beans that stop on shutdown; until they run, a client
 * cannot subscribe and would miss update events.
 *
 * `sessions` is the number of open WebSocket sessions, i.e. the connected clients.
 */
@Component
class WebSocketHealthIndicator(
    @Qualifier("simpleBrokerMessageHandler") private val broker: AbstractBrokerMessageHandler,
    @Qualifier("subProtocolWebSocketHandler") private val stompEndpoint: WebSocketHandler,
    private val stats: WebSocketMessageBrokerStats,
) : AbstractHealthIndicator("WebSocket check failed") {

    override fun doHealthCheck(builder: Health.Builder) {
        val brokerRunning = broker.isRunning
        val endpointRunning = (stompEndpoint as? Lifecycle)?.isRunning ?: false

        if (brokerRunning && endpointRunning) builder.up() else builder.down()
        builder
            .withDetail("broker", state(brokerRunning))
            .withDetail("stompEndpoint", state(endpointRunning))
            .withDetail("sessions", stats.webSocketSessionStats?.webSocketSessions ?: 0)
    }

    private fun state(running: Boolean) = if (running) "running" else "stopped"
}
