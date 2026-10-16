package de.ttt.management.tournament

import de.ttt.management.tournament.application.MatchService
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
class TournamentOutboundIT {

    @LocalServerPort
    private var port: Int = 0

    @Autowired
    private lateinit var matchService: MatchService

    @Test
    fun `completing a match broadcasts a websocket update`() {
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

        val matchId = matchService.getAllMatches().first().id!!
        matchService.setResult(matchId, "11:5,11:7,11:3", sets1 = 3, sets2 = 0)

        val message = messages.poll(10, TimeUnit.SECONDS)
        assertNotNull(message)
        assertEquals("MATCH_COMPLETED", message["type"])
    }
}
