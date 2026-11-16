package de.ttt.management

import org.springframework.messaging.MessageHeaders
import org.springframework.messaging.converter.StringMessageConverter
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
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

/**
 * Test helper for connecting to the native STOMP WebSocket endpoint and collecting
 * messages from the update topics (see ADR 0003).
 */
object StompTestSupport {

    /** An update event as it arrived: the topic and the raw JSON envelope `{type, scope, payload}`. */
    data class Message(val topic: String, val json: String)

    fun connect(port: Int): StompSession {
        val client = WebSocketStompClient(StandardWebSocketClient())
        // keep the raw JSON so it can be compared exactly; the server sends application/json
        client.messageConverter = object : StringMessageConverter() {
            override fun supportsMimeType(headers: MessageHeaders?) = true
        }
        return client.connectAsync(
            "ws://localhost:$port/ttt-websocket",
            object : StompSessionHandlerAdapter() {}
        ).get(5, TimeUnit.SECONDS)
    }

    val ALL_TOPICS = listOf("matches", "tables", "queue", "players", "settings")

    /** Subscribes to the given topics (all five by default) and collects every received message. */
    fun subscribe(session: StompSession, topics: List<String> = ALL_TOPICS): BlockingQueue<Message> {
        val messages: BlockingQueue<Message> = LinkedBlockingDeque()
        topics.forEach { topic ->
            session.subscribe("/topic/$topic", object : StompFrameHandler {
                override fun getPayloadType(headers: StompHeaders): Type = String::class.java
                override fun handleFrame(headers: StompHeaders, payload: Any?) {
                    messages.add(Message(topic, payload as String))
                }
            })
        }
        // The simple broker sends no receipts, so give it time to register the subscriptions
        // before the test publishes events (otherwise the first event can be lost).
        Thread.sleep(300)
        return messages
    }

    fun poll(messages: BlockingQueue<Message>): Message? =
        messages.poll(10, TimeUnit.SECONDS)

    /** Polls briefly and returns null when nothing arrives, to assert the absence of events. */
    fun pollNone(messages: BlockingQueue<Message>, millis: Long = 1000): Message? =
        messages.poll(millis, TimeUnit.MILLISECONDS)

    /**
     * Polls the next message and asserts it completely: it arrived on [topic] and its envelope
     * equals the expected file `events/<topic>/<name>.json` (see [ExpectedJson]).
     */
    fun assertNextEvent(messages: BlockingQueue<Message>, topic: String, name: String) {
        val message = poll(messages)
        assertNotNull(message, "expected an event $name on /topic/$topic, but none arrived")
        assertEquals(topic, message.topic)
        ExpectedJson.assertMatches("events/$topic/$name", message.json)
    }
}
