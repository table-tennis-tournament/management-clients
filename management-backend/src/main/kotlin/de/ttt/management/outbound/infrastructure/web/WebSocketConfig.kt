package de.ttt.management.outbound.infrastructure.web

import org.springframework.context.annotation.Configuration
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig : WebSocketMessageBrokerConfigurer {

    override fun configureMessageBroker(config: MessageBrokerRegistry) {
        // Heartbeats in both directions every 10 s (what the clients ask for), so a dead connection is
        // noticed by both sides instead of only by the proxy's read timeout.
        config.enableSimpleBroker("/topic")
            .setHeartbeatValue(longArrayOf(HEARTBEAT_MS, HEARTBEAT_MS))
            .setTaskScheduler(heartbeatScheduler())
        config.setApplicationDestinationPrefixes("/app")
        // The outbound channel sends on a thread pool, so two events published right after each other could
        // reach a client in the wrong order; keep the publication order per session.
        config.setPreservePublishOrder(true)
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        registry.addEndpoint("/ttt-websocket")
            .setAllowedOriginPatterns("*")
    }

    private fun heartbeatScheduler() = ThreadPoolTaskScheduler().apply {
        poolSize = 1
        setThreadNamePrefix("stomp-heartbeat-")
        initialize()
    }

    companion object {
        const val HEARTBEAT_MS = 10_000L
    }
}
