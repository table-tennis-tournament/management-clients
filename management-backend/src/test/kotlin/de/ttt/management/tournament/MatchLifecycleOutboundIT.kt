package de.ttt.management.tournament

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.StompTestSupport
import de.ttt.management.tournament.application.MatchService
import de.ttt.management.tournament.domain.SetResult
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import kotlin.test.assertEquals

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(DatabaseHelperConfiguration::class)
class MatchLifecycleOutboundIT {

    @LocalServerPort
    private var port: Int = 0

    @Autowired
    private lateinit var matchService: MatchService

    @Autowired
    private lateinit var db: DatabaseHelper

    private val matchId = 1L
    private val tableId = 1L

    @BeforeEach
    fun setup() {
        db.clean()
        db.insertSingleOpenMatch()
    }

    @Test
    fun `match lifecycle publishes the full event set over the websocket`() {
        val session = StompTestSupport.connect(port)
        val messages = StompTestSupport.subscribe(session)

        matchService.assignMatch(matchId, tableId)                                    // MATCH_ASSIGNED
        matchService.callMatches(listOf(matchId))                                     // MATCH_CALLED
        matchService.startMatch(matchId, tableId)                                     // MATCH_STARTED
        matchService.updateResult(matchId, listOf(SetResult(11, 5), SetResult(11, 7))) // MATCH_RESULT_UPDATED
        matchService.setResult(matchId, listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3))) // MATCH_COMPLETED

        val types = (0 until 5).map { StompTestSupport.poll(messages)?.get("type") }
        assertEquals(
            listOf("MATCH_ASSIGNED", "MATCH_CALLED", "MATCH_STARTED", "MATCH_RESULT_UPDATED", "MATCH_COMPLETED"),
            types
        )
    }
}
