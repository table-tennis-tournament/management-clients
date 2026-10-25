package de.ttt.management.tournament

import de.ttt.management.StompTestSupport
import de.ttt.management.tournament.application.MatchService
import de.ttt.management.tournament.domain.SetResult
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.test.context.ActiveProfiles
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
        val session = StompTestSupport.connect(port)
        val messages = StompTestSupport.subscribe(session)

        val matchId = matchService.getAllMatches().first().id!!
        matchService.setResult(matchId, listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))

        val message = StompTestSupport.poll(messages)
        assertNotNull(message)
        assertEquals("MATCH_COMPLETED", message["type"])

        @Suppress("UNCHECKED_CAST")
        val payload = message["payload"] as Map<String, Any>
        assertEquals(matchId.toLong(), (payload["matchId"] as Number).toLong())
        assertEquals(3, payload["sets1"])
        assertEquals(0, payload["sets2"])
    }
}
