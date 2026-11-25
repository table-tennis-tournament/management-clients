package de.ttt.management.outbound.application

import de.ttt.management.outbound.domain.Topic
import de.ttt.management.outbound.domain.UpdateScope
import de.ttt.management.outbound.domain.WebSocketSender
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class OutboundServiceTest {

    private class RecordingSender(private val failing: Boolean = false) : WebSocketSender {
        val sent = mutableListOf<Pair<String, Any>>()
        override fun send(destination: String, payload: Any) {
            if (failing) throw IllegalStateException("broker down")
            sent += destination to payload
        }
    }

    @Test
    fun `sends the update event envelope to the topic`() {
        val sender = RecordingSender()

        OutboundService(sender).pushUpdate(Topic.TABLES, "TABLE_LOCKED", UpdateScope(tableIds = listOf(3)), mapOf("tableId" to 3))

        assertEquals<List<Pair<String, Any>>>(
            listOf(
                Topic.TABLES.destination to mapOf(
                    "type" to "TABLE_LOCKED",
                    "scope" to UpdateScope(tableIds = listOf(3)),
                    "payload" to mapOf("tableId" to 3)
                )
            ),
            sender.sent
        )
    }

    @Test
    fun `a failing push does not fail the request whose change is already committed`() {
        OutboundService(RecordingSender(failing = true)).pushUpdate(Topic.MATCHES, "MATCH_FREED", UpdateScope(), Unit)
    }
}
