package de.ttt.management.outbound

import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.messaging.simp.stomp.StompHeaders
import org.springframework.messaging.simp.stomp.StompSession
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler
import org.springframework.test.context.ActiveProfiles
import org.springframework.web.socket.client.standard.StandardWebSocketClient
import org.springframework.web.socket.messaging.WebSocketStompClient
import org.junit.jupiter.api.Test
import java.util.concurrent.CompletableFuture
import java.util.concurrent.TimeUnit
import kotlin.test.assertEquals

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class WebSocketHeartbeatIT {

    @LocalServerPort
    private var port: Int = 0

    @Test
    fun `the broker agrees to heartbeats every 10 seconds in both directions`() {
        val client = WebSocketStompClient(StandardWebSocketClient()).apply {
            // ask for 10 s like the Angular clients do
            defaultHeartbeat = longArrayOf(10_000, 10_000)
            taskScheduler = ThreadPoolTaskScheduler().apply { initialize() }
        }
        val connected = CompletableFuture<StompHeaders>()

        val session = client.connectAsync(
            "ws://localhost:$port/ttt-websocket",
            object : StompSessionHandlerAdapter() {
                override fun afterConnected(session: StompSession, connectedHeaders: StompHeaders) {
                    connected.complete(connectedHeaders)
                }
            }
        ).get(5, TimeUnit.SECONDS)

        try {
            assertEquals(listOf(10_000L, 10_000L), connected.get(5, TimeUnit.SECONDS).heartbeat!!.toList())
        } finally {
            session.disconnect()
        }
    }
}
