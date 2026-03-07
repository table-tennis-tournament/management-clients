package de.ttt.management.tournament

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient
import kotlin.test.assertNotNull

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test") // Uses H2
class TournamentModuleIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Test
    fun `should start a match successfully`() {
        val matchId = 100L
        val tableId = 1L

        restTestClient.post()
            .uri("/api/tournament/match/start/$matchId/$tableId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `should fail to start a match that is already playing`() {
        // Assume match 101 is already started in our test data setup
        val matchId = 101L
        val tableId = 2L

        // First start should succeed
        restTestClient.post()
            .uri("/api/tournament/match/start/$matchId/$tableId")
            .exchange()
            .expectStatus().isOk

        // Second start should fail (conflict or bad request)
        restTestClient.post()
            .uri("/api/tournament/match/start/$matchId/$tableId")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should stop a match successfully`() {
        // Start it first
        val matchId = 102L
        val tableId = 3L
        restTestClient.post()
            .uri("/api/tournament/match/start/$matchId/$tableId")
            .exchange()
            .expectStatus().isOk

        // Now stop it
        restTestClient.post()
            .uri("/api/tournament/match/stop/$matchId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `should fail to stop a match that is not playing`() {
        val matchId = 103L

        restTestClient.post()
            .uri("/api/tournament/match/stop/$matchId")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should assign match to table by name successfully`() {
        val matchIds = listOf(110L)
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
    fun `should fail to assign match to non-existent table`() {
        val matchIds = listOf(111L)
        val tableName = "999" // Non-existent table

        restTestClient.post()
            .uri("/api/tournament/match/matchtotable/$tableName")
            .contentType(MediaType.APPLICATION_JSON)
            .body(matchIds)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should free matches successfully`() {
        val matchIds = listOf(120L, 121L)

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
        val matchIds = listOf(130L, 131L)

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
        val matchIds = listOf(200L, 201L)
        val addRequest = mapOf(
            "matchIds" to matchIds,
            "asGroup" to null,
            "position" to 1
        )

        // Add to match list
        restTestClient.post()
            .uri("/api/tournament/matchlist/add")
            .contentType(MediaType.APPLICATION_JSON)
            .body(addRequest)
            .exchange()
            .expectStatus().isOk

        // Get all match list
        var uuid = ""
        restTestClient.get()
            .uri("/api/tournament/matchlist/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isEqualTo(1)
            .jsonPath("$[0].matchIds[0]").isEqualTo(200)
            .consumeWith { response ->
                val json = String(response.responseBody!!)
                val regex = "\"uuid\":\"([^\"]+)\"".toRegex()
                val match = regex.find(json)
                uuid = match?.groups?.get(1)?.value ?: ""
            }

        // Delete from match list
        restTestClient.delete()
            .uri("/api/tournament/matchlist/$uuid")
            .exchange()
            .expectStatus().isOk

        // Verify empty
        restTestClient.get()
            .uri("/api/tournament/matchlist/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isEqualTo(0)
    }
}
