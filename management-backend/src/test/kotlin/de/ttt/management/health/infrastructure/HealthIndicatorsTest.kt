package de.ttt.management.health.infrastructure

import org.flywaydb.core.Flyway
import org.h2.jdbcx.JdbcDataSource
import org.junit.jupiter.api.Test
import org.springframework.boot.health.contributor.Health
import org.springframework.context.SmartLifecycle
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.messaging.support.ExecutorSubscribableChannel
import org.springframework.messaging.simp.broker.SimpleBrokerMessageHandler
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.WebSocketMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.config.WebSocketMessageBrokerStats
import java.time.Duration
import java.util.UUID
import kotlin.test.assertEquals

/** The indicators' failing states, on a database of their own (the shared test database stays green). */
class HealthIndicatorsTest {

    private fun emptyDatabase() = JdbcDataSource().apply {
        setURL("jdbc:h2:mem:health-${UUID.randomUUID()};MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1")
        user = "sa"
    }

    private fun flyway(dataSource: JdbcDataSource) =
        Flyway.configure().dataSource(dataSource).locations("classpath:db/migration").load()

    @Test
    fun `mkttSchema is down and names every table a database without a dump lacks`() {
        val indicator = MkttSchemaHealthIndicator(JdbcClient.create(emptyDatabase()))

        assertEquals(
            Health.down()
                .withDetail("missingTables", MkttSchemaHealthIndicator.REQUIRED_TABLES)
                .withDetail("requiredTables", MkttSchemaHealthIndicator.REQUIRED_TABLES)
                .build(),
            indicator.health(true)
        )
    }

    @Test
    fun `flyway is down while migrations are pending`() {
        val indicator = FlywayHealthIndicator(flyway(emptyDatabase()))

        assertEquals(
            Health.down()
                .withDetail("currentVersion", "none")
                .withDetail("applied", 0)
                .withDetail(
                    "pending",
                    listOf(
                        "1__mgmt matchtable", "2__mgmt typecolors", "3__mgmt match list", "4__mgmt match call state",
                        "5__mgmt table lock", "6__mgmt player active", "7__mgmt typecolors hex text color",
                        "8__mgmt player call", "50__mktt schema"
                    )
                )
                .withDetail("failed", emptyList<String>())
                .build(),
            indicator.health(true)
        )
    }

    @Test
    fun `flyway is up once every migration is applied`() {
        val flyway = flyway(emptyDatabase())
        flyway.migrate()

        assertEquals(
            Health.up()
                .withDetail("currentVersion", "50")
                .withDetail("applied", 9)
                .withDetail("pending", emptyList<String>())
                .withDetail("failed", emptyList<String>())
                .build(),
            FlywayHealthIndicator(flyway).health(true)
        )
    }

    private fun broker() = SimpleBrokerMessageHandler(
        ExecutorSubscribableChannel(), ExecutorSubscribableChannel(), ExecutorSubscribableChannel(), listOf("/topic")
    )

    /** Stands in for Spring's STOMP endpoint handler: a WebSocket handler with a lifecycle. */
    private class Endpoint(private var running: Boolean) : WebSocketHandler, SmartLifecycle {
        override fun afterConnectionEstablished(session: WebSocketSession) = Unit
        override fun handleMessage(session: WebSocketSession, message: WebSocketMessage<*>) = Unit
        override fun handleTransportError(session: WebSocketSession, exception: Throwable) = Unit
        override fun afterConnectionClosed(session: WebSocketSession, closeStatus: CloseStatus) = Unit
        override fun supportsPartialMessages() = false
        override fun start() { running = true }
        override fun stop() { running = false }
        override fun isRunning() = running
    }

    private fun webSocketHealth(broker: String, stompEndpoint: String) =
        mapOf("broker" to broker, "stompEndpoint" to stompEndpoint, "sessions" to 0)

    @Test
    fun `webSocket is down until the broker runs`() {
        val indicator = WebSocketHealthIndicator(broker(), Endpoint(running = true), WebSocketMessageBrokerStats())

        assertEquals(
            Health.down().withDetails(webSocketHealth("stopped", "running")).build(),
            indicator.health(true)
        )
    }

    @Test
    fun `webSocket is down while the STOMP endpoint does not accept sessions`() {
        val broker = broker().apply { start() }
        val indicator = WebSocketHealthIndicator(broker, Endpoint(running = false), WebSocketMessageBrokerStats())

        assertEquals(
            Health.down().withDetails(webSocketHealth("running", "stopped")).build(),
            indicator.health(true)
        )
    }

    @Test
    fun `webSocket is up when broker and endpoint run`() {
        val broker = broker().apply { start() }
        val indicator = WebSocketHealthIndicator(broker, Endpoint(running = true), WebSocketMessageBrokerStats())

        assertEquals(
            Health.up().withDetails(webSocketHealth("running", "running")).build(),
            indicator.health(true)
        )
    }

    @Test
    fun `a check that does not answer in time is down`() {
        val slow = object : TimeBoxedHealthIndicator(Duration.ofMillis(100)) {
            override fun check(builder: Health.Builder) {
                Thread.sleep(2_000)
                builder.up()
            }
        }

        assertEquals(Health.down().withDetail("error", "no answer within 100 ms").build(), slow.health(true))
    }

    @Test
    fun `a check that fails is down with its error`() {
        val failing = object : TimeBoxedHealthIndicator() {
            override fun check(builder: Health.Builder) = throw IllegalStateException("Connection refused")
        }

        assertEquals(
            Health.down().withDetail("error", "java.lang.IllegalStateException: Connection refused").build(),
            failing.health(true)
        )
    }
}
