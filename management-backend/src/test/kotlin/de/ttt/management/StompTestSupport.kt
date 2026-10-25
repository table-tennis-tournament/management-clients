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
 * messages from `/topic/updates`.
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

    fun subscribe(session: StompSession): BlockingQueue<Map<String, Any>> {
        val messages: BlockingQueue<Map<String, Any>> = LinkedBlockingDeque()
        session.subscribe("/topic/updates", object : StompFrameHandler {
            override fun getPayloadType(headers: StompHeaders): Type = Map::class.java
            override fun handleFrame(headers: StompHeaders, payload: Any?) {
                @Suppress("UNCHECKED_CAST")
                messages.add(payload as Map<String, Any>)
            }
        })
        return messages
    }

    fun poll(messages: BlockingQueue<Map<String, Any>>): Map<String, Any>? =
        messages.poll(10, TimeUnit.SECONDS)
}
