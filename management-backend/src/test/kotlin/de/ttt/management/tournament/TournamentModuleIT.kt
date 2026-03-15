package de.ttt.management.tournament

import de.ttt.management.tournament.application.MatchService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient
import kotlin.test.assertTrue

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test") // Uses H2
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class TournamentModuleIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var matchService: MatchService

    private var validMatchId: Long = 0

    @BeforeEach
    fun setup() {
        val matches = matchService.getAllMatches()
        if (matches.isNotEmpty()) {
            validMatchId = matches[0].id!!
        }
    }

    @Test
    fun `should start a match successfully`() {
        assertTrue(validMatchId > 0)
        val tableId = 1L

        restTestClient.post()
            .uri("/api/tournament/match/start/$validMatchId/$tableId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `should fail to start a match that is already playing`() {
        assertTrue(validMatchId > 0)
        val tableId = 2L

        // First start should succeed
        restTestClient.post()
            .uri("/api/tournament/match/start/$validMatchId/$tableId")
            .exchange()
            .expectStatus().isOk

        // Second start should fail
        restTestClient.post()
            .uri("/api/tournament/match/start/$validMatchId/$tableId")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should stop a match successfully`() {
        assertTrue(validMatchId > 0)
        val tableId = 3L
        restTestClient.post()
            .uri("/api/tournament/match/start/$validMatchId/$tableId")
            .exchange()
            .expectStatus().isOk

        restTestClient.post()
            .uri("/api/tournament/match/stop/$validMatchId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `should fail to stop a match that is not playing`() {
        val matchId = 9999L // Non-playing

        restTestClient.post()
            .uri("/api/tournament/match/stop/$matchId")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should assign match to table by name successfully`() {
        assertTrue(validMatchId > 0)
        val matchIds = listOf(validMatchId)
        val tableName = "1"

        restTestClient.post()
            .uri("/api/tournament/match/matchtotable/$tableName")
            .contentType(MediaType.APPLICATION_JSON)
            .body(matchIds)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `should free matches successfully`() {
        assertTrue(validMatchId > 0)
        val matchIds = listOf(validMatchId)

        restTestClient.post()
            .uri("/api/tournament/match/free")
            .contentType(MediaType.APPLICATION_JSON)
            .body(matchIds)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `should take back matches successfully`() {
        assertTrue(validMatchId > 0)
        val matchIds = listOf(validMatchId)

        restTestClient.post()
            .uri("/api/tournament/match/takeBack")
            .contentType(MediaType.APPLICATION_JSON)
            .body(matchIds)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `should manage match list successfully`() {
        assertTrue(validMatchId > 0)
        val matchIds = listOf(validMatchId)
        val addRequest = mapOf(
            "matchIds" to matchIds,
            "asGroup" to null,
            "position" to 1
        )

        restTestClient.post()
            .uri("/api/tournament/matchlist/add")
            .contentType(MediaType.APPLICATION_JSON)
            .body(addRequest)
            .exchange()
            .expectStatus().isOk

        var uuid = ""
        restTestClient.get()
            .uri("/api/tournament/matchlist/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isEqualTo(1)
            .consumeWith { response ->
                val json = String(response.responseBody!!)
                val regex = "\"uuid\":\"([^\"]+)\"".toRegex()
                val match = regex.find(json)
                uuid = match?.groups?.get(1)?.value ?: ""
            }

        restTestClient.delete()
            .uri("/api/tournament/matchlist/$uuid")
            .exchange()
            .expectStatus().isOk

        restTestClient.get()
            .uri("/api/tournament/matchlist/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isEqualTo(0)
    }

    @Test
    fun `should get all matches`() {
        restTestClient.get()
            .uri("/api/tournament/match/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isNotEmpty
    }

    @Test
    fun `should get matches by type`() {
        restTestClient.get()
            .uri("/api/tournament/match/typeid/1")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isNotEmpty
    }

    @Test
    fun `should get match by id`() {
        assertTrue(validMatchId > 0)
        restTestClient.get()
            .uri("/api/tournament/match/$validMatchId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(validMatchId.toInt())
    }

    @Test
    fun `should set result successfully`() {
        assertTrue(validMatchId > 0)
        val resultRequest = mapOf(
            "resultRaw" to "11:5, 11:7, 11:3",
            "sets1" to 3,
            "sets2" to 0
        )
        restTestClient.post()
            .uri("/api/tournament/match/setResult/$validMatchId")
            .contentType(MediaType.APPLICATION_JSON)
            .body(resultRequest)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `should get all types`() {
        restTestClient.get()
            .uri("/api/tournament/types/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isNotEmpty
    }

    @Test
    fun `should delete match successfully`() {
        assertTrue(validMatchId > 0)
        restTestClient.delete()
            .uri("/api/tournament/match/$validMatchId")
            .exchange()
            .expectStatus().isOk
    }
}
