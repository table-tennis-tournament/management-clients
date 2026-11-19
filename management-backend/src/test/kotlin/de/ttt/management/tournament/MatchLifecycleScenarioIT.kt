package de.ttt.management.tournament

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.expectExactJson
import de.ttt.management.tournament.application.MatchService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient
import kotlin.test.assertTrue

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(DatabaseHelperConfiguration::class)
class MatchLifecycleScenarioIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var matchService: MatchService

    @Autowired
    private lateinit var db: DatabaseHelper

    private val matchId = 1L

    @BeforeEach
    fun setup() {
        db.clean()
        db.insertSingleOpenMatch()
    }

    @Test
    fun `a match walks through table assignment, call and completion`() {
        // 1. Assign the match to table "1"
        restTestClient.post()
            .uri("/api/v2/match/matchtotable/1")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(matchId))
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        // 2. Call the players: the first Call, then a Second call of player 2, who has not appeared
        restTestClient.post()
            .uri("/api/v2/match/call")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(matchId))
            .exchange()
            .expectStatus().isOk
        restTestClient.post()
            .uri("/api/v2/playercall/$matchId")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(2L))
            .exchange()
            .expectStatus().isOk
        restTestClient.post()
            .uri("/api/v2/playercall/announce")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(matchId))
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        // 3. Enter the set results while the game is being played (interim)
        restTestClient.post()
            .uri("/api/v2/match/updateResult/$matchId")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(listOf(11, 5), listOf(11, 7)))
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        // 4. Finish the game with the final result
        restTestClient.post()
            .uri("/api/v2/match/setResult/$matchId")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(listOf(11, 5), listOf(11, 7), listOf(11, 3)))
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        // 5. The match is now completed
        val completed = matchService.getMatch(matchId)
        assertTrue(completed!!.isPlayed)
    }
}
