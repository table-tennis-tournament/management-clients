package de.ttt.management.outbound.infrastructure.web

import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry

@Configuration
@EnableWebSocket
class LegacyWebSocketConfig(
    private val legacyWebSocketHandler: LegacyWebSocketHandler
) : WebSocketConfigurer {

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry.addHandler(legacyWebSocketHandler, "/ttt-websocket-legacy")
            .setAllowedOriginPatterns("*")
            .withSockJS()
    }
}
