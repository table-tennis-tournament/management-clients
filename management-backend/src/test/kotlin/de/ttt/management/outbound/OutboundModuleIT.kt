package de.ttt.management.outbound

import de.ttt.management.StompTestSupport
import de.ttt.management.registration.application.PlayerService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.test.context.ActiveProfiles
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

        @Suppress("UNCHECKED_CAST")
        val payload = message["payload"] as Map<String, Any>
        assertNotNull(payload["playerId"])
        assertEquals("Jane", payload["firstName"])
        assertEquals("Doe", payload["lastName"])
    }
}
