package de.ttt.management

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient

/** The health endpoints: liveness, and readiness with the database, mktt's tables, Flyway and the WebSocket. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(ResourceTestConfiguration::class)
class HealthIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var testState: TestState

    @Autowired
    private lateinit var db: DatabaseHelper

    @LocalServerPort
    private var port: Int = 0

    @BeforeEach
    fun resetState() = testState.reset()

    private fun get(path: String) = restTestClient.get().uri(path).exchange()

    /** Other test classes of the shared context may still be closing their WebSocket sessions. */
    private val sessions = "components.webSocket.details.sessions"

    private fun readiness(matches: Int = 0, tables: Int = 0, players: Int = 0) = """
        {
          "status": "UP",
          "components": {
            "db": {"status": "UP", "details": {"database": "H2", "validationQuery": "isValid()"}},
            "flyway": {
              "status": "UP",
              "details": {"currentVersion": "50", "applied": 9, "pending": [], "failed": []}
            },
            "mkttSchema": {
              "status": "UP",
              "details": {"tables": 11, "rows": {"matches": $matches, "tables": $tables, "player": $players}}
            },
            "readinessState": {"status": "UP"},
            "webSocket": {
              "status": "UP",
              "details": {"broker": "running", "stompEndpoint": "running", "sessions": 0}
            }
          }
        }
    """

    @Test
    fun `liveness is up while the process runs`() {
        get("/actuator/health/liveness")
            .expectStatus().isOk
            .expectExactJson("""{"status": "UP", "components": {"livenessState": {"status": "UP"}}}""")
    }

    @Test
    fun `livez is the liveness group on the main port`() {
        get("/livez")
            .expectStatus().isOk
            .expectExactJson("""{"status": "UP", "components": {"livenessState": {"status": "UP"}}}""")
    }

    @Test
    fun `readiness checks the database, mktt's tables, Flyway and the WebSocket`() {
        get("/actuator/health/readiness")
            .expectStatus().isOk
            .expectExactJsonIgnoring(readiness(), sessions)
    }

    @Test
    fun `readyz is the readiness group on the main port`() {
        get("/readyz")
            .expectStatus().isOk
            .expectExactJsonIgnoring(readiness(), sessions)
    }

    @Test
    fun `readiness counts the loaded matches, tables and players`() {
        db.insertTables(1L..3L)
        db.insertPlayer(1, "Anna", "Muster")

        get("/readyz")
            .expectStatus().isOk
            .expectExactJsonIgnoring(readiness(tables = 3, players = 1), sessions)
    }

    @Test
    fun `readiness counts a connected WebSocket client`() {
        val before = sessionCount()
        val session = StompTestSupport.connect(port)
        try {
            kotlin.test.assertEquals(before + 1, sessionCount())
        } finally {
            session.disconnect()
        }
    }

    @Test
    fun `a missing mktt table makes the backend unready`() {
        db.jdbc.execute("ALTER TABLE typeperplayer RENAME TO typeperplayer_hidden")
        try {
            get("/readyz")
                .expectStatus().isEqualTo(503)
                .expectExactJsonIgnoring(
                    """
                    {
                      "status": "DOWN",
                      "components": {
                        "db": {"status": "UP", "details": {"database": "H2", "validationQuery": "isValid()"}},
                        "flyway": {
                          "status": "UP",
                          "details": {"currentVersion": "50", "applied": 9, "pending": [], "failed": []}
                        },
                        "mkttSchema": {
                          "status": "DOWN",
                          "details": {
                            "missingTables": ["typeperplayer"],
                            "requiredTables": ["club", "doubles", "matches", "matchtype", "player", "playerpergroup",
                              "playgroups", "settings", "tables", "type", "typeperplayer"]
                          }
                        },
                        "readinessState": {"status": "UP"},
                        "webSocket": {
                          "status": "UP",
                          "details": {"broker": "running", "stompEndpoint": "running", "sessions": 0}
                        }
                      }
                    }
                    """,
                    sessions
                )
            // liveness ignores the database: a missing table needs a new dump, not a restart
            get("/livez").expectStatus().isOk
        } finally {
            db.jdbc.execute("ALTER TABLE typeperplayer_hidden RENAME TO typeperplayer")
        }
    }

    private fun sessionCount(): Int =
        restTestClient.get().uri("/readyz").exchange()
            .expectBody(Map::class.java).returnResult().responseBody
            .let { (((it?.get("components") as Map<*, *>)["webSocket"] as Map<*, *>)["details"] as Map<*, *>)["sessions"] as Int }
}
