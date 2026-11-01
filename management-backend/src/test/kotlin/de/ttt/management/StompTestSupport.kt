package de.ttt.management

import org.springframework.messaging.converter.MappingJackson2MessageConverter
import org.springframework.messaging.simp.stomp.StompFrameHandler
import org.springframework.messaging.simp.stomp.StompHeaders
import org.springframework.messaging.simp.stomp.StompSession
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter
import org.springframework.web.socket.client.standard.StandardWebSocketClient
import org.springframework.web.socket.messaging.WebSocketStompClient
import java.lang.reflect.Type
import java.util.concurrent.BlockingQueue
import java.util.concurrent.LinkedBlockingDeque
import java.util.concurrent.TimeUnit

/**
 * Test helper for connecting to the native STOMP WebSocket endpoint and collecting
 * messages from the update topics (see ADR 0003).
 */
object StompTestSupport {

    fun connect(port: Int): StompSession {
        val client = WebSocketStompClient(StandardWebSocketClient())
        client.messageConverter = MappingJackson2MessageConverter()
        return client.connectAsync(
            "ws://localhost:$port/ttt-websocket",
            object : StompSessionHandlerAdapter() {}
        ).get(5, TimeUnit.SECONDS)
    }

    val ALL_TOPICS = listOf("matches", "tables", "queue", "players", "settings")

    /**
     * Subscribes to the given topics (all five by default). Each received message is the
     * envelope map plus a `topic` entry with the topic name it arrived on.
     */
    fun subscribe(session: StompSession, topics: List<String> = ALL_TOPICS): BlockingQueue<Map<String, Any>> {
        val messages: BlockingQueue<Map<String, Any>> = LinkedBlockingDeque()
        topics.forEach { topic ->
            session.subscribe("/topic/$topic", object : StompFrameHandler {
                override fun getPayloadType(headers: StompHeaders): Type = Map::class.java
                override fun handleFrame(headers: StompHeaders, payload: Any?) {
                    @Suppress("UNCHECKED_CAST")
                    messages.add((payload as Map<String, Any>) + ("topic" to topic))
                }
            })
        }
        // The simple broker sends no receipts, so give it time to register the subscriptions
        // before the test publishes events (otherwise the first event can be lost).
        Thread.sleep(300)
        return messages
    }

    fun poll(messages: BlockingQueue<Map<String, Any>>): Map<String, Any>? =
        messages.poll(10, TimeUnit.SECONDS)

    /** Polls briefly and returns null when nothing arrives, to assert the absence of events. */
    fun pollNone(messages: BlockingQueue<Map<String, Any>>, millis: Long = 1000): Map<String, Any>? =
        messages.poll(millis, TimeUnit.MILLISECONDS)
}
