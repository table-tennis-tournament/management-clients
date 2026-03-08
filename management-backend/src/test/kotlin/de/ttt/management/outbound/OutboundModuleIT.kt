package de.ttt.management.outbound

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.context.ApplicationEventPublisher
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
    private lateinit var eventPublisher: ApplicationEventPublisher

    @Test
    fun `should connect to websocket and receive updates`() {
        val stompClient = WebSocketStompClient(SockJsClient(listOf(WebSocketTransport(StandardWebSocketClient()))))
        stompClient.messageConverter = MappingJackson2MessageConverter()

        val session: StompSession = stompClient.connectAsync(
            "ws://localhost:$port/ttt-websocket",
            object : StompSessionHandlerAdapter() {}
        ).get(5, TimeUnit.SECONDS)

        val responses: BlockingQueue<Map<String, Any>> = LinkedBlockingDeque()

        session.subscribe("/topic/updates", object : StompFrameHandler {
            override fun getPayloadType(headers: StompHeaders): Type = Map::class.java
            override fun handleFrame(headers: StompHeaders, payload: Any?) {
                @Suppress("UNCHECKED_CAST")
                responses.add(payload as Map<String, Any>)
            }
        })

        // Publish event
        eventPublisher.publishEvent(ApplicationUpdateEvent("TEST_UPDATE", mapOf("key" to "value")))

        val response = responses.poll(5, TimeUnit.SECONDS)
        assertNotNull(response)
        assertEquals("TEST_UPDATE", response["type"])
        
        assertTrue(session.isConnected)
    }

    @Test
    fun `should fail to connect to invalid endpoint`() {
        val stompClient = WebSocketStompClient(StandardWebSocketClient())
        
        try {
            stompClient.connectAsync(
                "ws://localhost:$port/invalid-endpoint",
                object : StompSessionHandlerAdapter() {}
            ).get(2, TimeUnit.SECONDS)
            fail("Should have failed to connect")
        } catch (e: Exception) {
            // Success
        }
    }

    private fun assertTrue(condition: Boolean) {
        if (!condition) throw AssertionError("Assertion failed")
    }

    private fun fail(message: String) {
        throw AssertionError(message)
    }
}
