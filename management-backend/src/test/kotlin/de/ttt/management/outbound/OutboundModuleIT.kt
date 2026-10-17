package de.ttt.management.outbound

import de.ttt.management.registration.application.PlayerService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.messaging.converter.MappingJackson2MessageConverter
import org.springframework.messaging.simp.stomp.StompFrameHandler
import org.springframework.messaging.simp.stomp.StompHeaders
import org.springframework.messaging.simp.stomp.StompSession
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter
import org.springframework.test.context.ActiveProfiles
import org.springframework.web.socket.client.standard.StandardWebSocketClient
import org.springframework.web.socket.messaging.WebSocketStompClient
import org.springframework.web.socket.sockjs.client.SockJsClient
import org.springframework.web.socket.sockjs.client.WebSocketTransport
import java.lang.reflect.Type
import java.util.concurrent.BlockingQueue
import java.util.concurrent.LinkedBlockingDeque
import java.util.concurrent.TimeUnit
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class OutboundModuleIT {

    @LocalServerPort
    private var port: Int = 0

    @Autowired
    private lateinit var playerService: PlayerService

    @Test
    fun `registers a player and receives a websocket update`() {
        val stompClient = WebSocketStompClient(SockJsClient(listOf(WebSocketTransport(StandardWebSocketClient()))))
        stompClient.messageConverter = MappingJackson2MessageConverter()

        val session: StompSession = stompClient.connectAsync(
            "ws://localhost:$port/ttt-websocket",
            object : StompSessionHandlerAdapter() {}
        ).get(5, TimeUnit.SECONDS)

        val messages: BlockingQueue<Map<String, Any>> = LinkedBlockingDeque()

        session.subscribe("/topic/updates", object : StompFrameHandler {
            override fun getPayloadType(headers: StompHeaders): Type = Map::class.java
            override fun handleFrame(headers: StompHeaders, payload: Any?) {
                @Suppress("UNCHECKED_CAST")
                messages.add(payload as Map<String, Any>)
            }
        })

        playerService.registerPlayer(
            firstName = "Jane",
            lastName = "Doe",
            ttr = 1600,
            sex = "w",
            clubId = null
        )

        val message = messages.poll(10, TimeUnit.SECONDS)
        assertNotNull(message)
        assertEquals("PLAYER_REGISTERED", message["type"])
    }
}
