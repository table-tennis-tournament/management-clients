package de.ttt.management.tournament

import de.ttt.management.tournament.application.MatchService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient
import kotlin.test.assertTrue

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
class MatchLifecycleScenarioIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var matchService: MatchService

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private var matchId: Long = 0

    @BeforeEach
    fun setup() {
        jdbcTemplate.update("UPDATE matches SET matc_isplaying = 0, matc_tabl_id = NULL, matc_tabl2_id = 0")
        matchId = matchService.getAllMatches().first().id!!
    }

    @Test
    fun `a match walks through table assignment, call and completion`() {
        assertTrue(matchId > 0)

        // 1. Assign the match to table "1"
        restTestClient.post()
            .uri("/api/tournament/match/matchtotable/1")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(matchId))
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)

        // 2. Call the players
        restTestClient.post()
            .uri("/api/tournament/playercall/$matchId")
            .exchange()
            .expectStatus().isOk

        // 3. Enter the set results and finish the game
        restTestClient.post()
            .uri("/api/tournament/match/setResult/$matchId")
            .contentType(MediaType.APPLICATION_JSON)
            .body(mapOf("resultRaw" to "11:5,11:7,11:3", "sets1" to 3, "sets2" to 0))
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)

        // 4. The match is now completed
        val completed = matchService.getMatch(matchId)
        assertTrue(completed!!.isPlayed)
    }
}
