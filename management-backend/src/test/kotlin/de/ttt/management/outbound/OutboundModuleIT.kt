package de.ttt.management.outbound

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.StompTestSupport
import de.ttt.management.registration.application.PlayerService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(DatabaseHelperConfiguration::class)
class OutboundModuleIT {

    @LocalServerPort
    private var port: Int = 0

    @Autowired
    private lateinit var playerService: PlayerService

    @Autowired
    private lateinit var db: DatabaseHelper

    @BeforeEach
    fun setup() {
        db.clean()
    }

    @Test
    fun `registers a player and receives a websocket update`() {
        val session = StompTestSupport.connect(port)
        val messages = StompTestSupport.subscribe(session)

        playerService.registerPlayer(
            firstName = "Jane",
            lastName = "Doe",
            ttr = 1600,
            sex = "w",
            clubId = null
        )

        val message = StompTestSupport.poll(messages)
        assertNotNull(message)
        assertEquals("PLAYER_REGISTERED", message["type"])
        assertEquals("players", message["topic"])

        @Suppress("UNCHECKED_CAST")
        val payload = message["payload"] as Map<String, Any>
        // the player table is empty, so the new player gets the first id
        assertEquals(1L, (payload["playerId"] as Number).toLong())
        assertEquals("Jane", payload["firstName"])
        assertEquals("Doe", payload["lastName"])
    }
}
