package de.ttt.management.tournament

import de.ttt.management.tournament.application.MatchService
import de.ttt.management.tournament.domain.CallState
import de.ttt.management.tournament.domain.MatchState
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient
import kotlin.test.assertEquals
import kotlin.test.assertFalse
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

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private var validMatchId: Long = 0

    @BeforeEach
    fun setup() {
        jdbcTemplate.update("UPDATE matches SET matc_isplaying = 0, matc_played = 0, matc_callstate = 0, matc_tabl_id = NULL, matc_tabl2_id = 0, matc_waitinglist = 0")
        jdbcTemplate.update("DELETE FROM match_list")
        jdbcTemplate.update("UPDATE tables SET tabl_locked = 0")
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
            .uri("/api/v2/match/start/$validMatchId/$tableId")
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
            .uri("/api/v2/match/start/$validMatchId/$tableId")
            .exchange()
            .expectStatus().isOk

        // Second start should fail
        restTestClient.post()
            .uri("/api/v2/match/start/$validMatchId/$tableId")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should stop a match successfully`() {
        assertTrue(validMatchId > 0)
        val tableId = 3L
        restTestClient.post()
            .uri("/api/v2/match/start/$validMatchId/$tableId")
            .exchange()
            .expectStatus().isOk

        restTestClient.post()
            .uri("/api/v2/match/stop/$validMatchId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `should fail to stop a match that is not playing`() {
        val matchId = 9999L // Non-playing

        restTestClient.post()
            .uri("/api/v2/match/stop/$matchId")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should assign match to table by name successfully`() {
        assertTrue(validMatchId > 0)
        val matchIds = listOf(validMatchId)
        val tableName = "1"

        restTestClient.post()
            .uri("/api/v2/match/matchtotable/$tableName")
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
            .uri("/api/v2/match/free")
            .contentType(MediaType.APPLICATION_JSON)
            .body(matchIds)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `freeing a match marks it as a walkover`() {
        assertTrue(validMatchId > 0)

        restTestClient.post()
            .uri("/api/v2/match/free")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(validMatchId))
            .exchange()
            .expectStatus().isOk

        val freed = matchService.getMatch(validMatchId)!!
        assertTrue(freed.isKampflos)
        assertTrue(freed.state == MatchState.Finished)
    }

    @Test
    fun `should take back matches successfully`() {
        assertTrue(validMatchId > 0)
        val matchIds = listOf(validMatchId)

        restTestClient.post()
            .uri("/api/v2/match/takeBack")
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
            .uri("/api/v2/matchlist/add")
            .contentType(MediaType.APPLICATION_JSON)
            .body(addRequest)
            .exchange()
            .expectStatus().isOk

        var uuid = ""
        restTestClient.get()
            .uri("/api/v2/matchlist/all")
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
            .uri("/api/v2/matchlist/$uuid")
            .exchange()
            .expectStatus().isOk

        restTestClient.get()
            .uri("/api/v2/matchlist/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isEqualTo(0)
    }

    @Test
    fun `should get all matches`() {
        restTestClient.get()
            .uri("/api/v2/match/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isNotEmpty
    }

    @Test
    fun `should get matches by type`() {
        restTestClient.get()
            .uri("/api/v2/match/typeid/1")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isNotEmpty
    }

    @Test
    fun `should get match by id`() {
        assertTrue(validMatchId > 0)
        restTestClient.get()
            .uri("/api/v2/match/$validMatchId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(validMatchId.toInt())
    }

    @Test
    fun `should set result successfully`() {
        assertTrue(validMatchId > 0)
        restTestClient.post()
            .uri("/api/v2/match/setResult/$validMatchId")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(listOf(11, 5), listOf(11, 7), listOf(11, 3)))
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `should get all types`() {
        restTestClient.get()
            .uri("/api/v2/types/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isNotEmpty
    }

    @Test
    fun `should delete match successfully`() {
        assertTrue(validMatchId > 0)
        restTestClient.delete()
            .uri("/api/v2/match/$validMatchId")
            .exchange()
            .expectStatus().isOk
    }

    @Test
    fun `adding a match to the list sets it InQueue`() {
        assertTrue(validMatchId > 0)
        val addRequest = mapOf(
            "matchIds" to listOf(validMatchId),
            "asGroup" to null,
            "position" to 0
        )

        restTestClient.post()
            .uri("/api/v2/matchlist/add")
            .contentType(MediaType.APPLICATION_JSON)
            .body(addRequest)
            .exchange()
            .expectStatus().isOk

        assertTrue(matchService.getMatch(validMatchId)!!.waitingList)
    }

    @Test
    fun `auto-start starts the next match from the list`() {
        assertTrue(validMatchId > 0)
        val addRequest = mapOf(
            "matchIds" to listOf(validMatchId),
            "asGroup" to null,
            "position" to 0
        )

        restTestClient.post()
            .uri("/api/v2/matchlist/add")
            .contentType(MediaType.APPLICATION_JSON)
            .body(addRequest)
            .exchange()
            .expectStatus().isOk

        restTestClient.post()
            .uri("/api/v2/matchlist/auto-start")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)

        assertTrue(matchService.getMatch(validMatchId)!!.isPlaying)

        restTestClient.get()
            .uri("/api/v2/matchlist/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isEqualTo(0)
    }

    @Test
    fun `auto-start does not start a match whose player is already on a table`() {
        val matches = matchService.getAllMatches()
        assertTrue(matches.size >= 2)
        val first = matches[0].id!!
        val second = matches[1].id!!

        // Start the first match on table "1" — its players are now blocking.
        restTestClient.post()
            .uri("/api/v2/match/start/$first/1")
            .exchange()
            .expectStatus().isOk

        // Queue the second match (shares a player with the first in the test data).
        restTestClient.post()
            .uri("/api/v2/matchlist/add")
            .contentType(MediaType.APPLICATION_JSON)
            .body(mapOf("matchIds" to listOf(second), "asGroup" to null, "position" to 0))
            .exchange()
            .expectStatus().isOk

        restTestClient.post()
            .uri("/api/v2/matchlist/auto-start")
            .exchange()
            .expectStatus().isOk

        assertFalse(matchService.getMatch(second)!!.isPlaying)

        restTestClient.get()
            .uri("/api/v2/matchlist/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isEqualTo(1)
    }

    @Test
    fun `caller aggregate resolves doubles team ids to individual players`() {
        // Match 154 is a doubles match: side A references double team 100001 (= double 1: players 54, 158).
        jdbcTemplate.update("UPDATE matches SET matc_callstate = 0, matc_tabl_id = 1, matc_played = 0 WHERE matc_id = 154")

        val doubles = matchService.getMatchesByCallState(CallState.None).first { it.id == 154L }

        assertEquals(setOf(54L, 158L), doubles.players1.mapNotNull { it.id }.toSet())
        assertEquals(2, doubles.players1.size)
        assertTrue(doubles.players1.all { it.firstName != null })
    }

    @Test
    fun `a match moves through caller second and third call`() {
        assertTrue(validMatchId > 0)
        jdbcTemplate.update("UPDATE matches SET matc_callstate = 0, matc_tabl_id = 1 WHERE matc_id = ?", validMatchId)

        // Not yet called -> appears in the caller view
        restTestClient.get()
            .uri("/api/v2/matchaggregates/caller")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$[0].matches[0].id").isEqualTo(validMatchId.toInt())
            .jsonPath("$[0].name").isEqualTo("Gruppenspiel 01 ")

        // First call
        restTestClient.post()
            .uri("/api/v2/match/call")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(validMatchId))
            .exchange()
            .expectStatus().isOk

        // Second call
        restTestClient.post()
            .uri("/api/v2/playercall/$validMatchId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)

        restTestClient.get()
            .uri("/api/v2/matchaggregates/secondCall")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$[0].matches[0].id").isEqualTo(validMatchId.toInt())

        // Third call
        restTestClient.post()
            .uri("/api/v2/playercall/$validMatchId")
            .exchange()
            .expectStatus().isOk

        restTestClient.get()
            .uri("/api/v2/matchaggregates/thirdCall")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$[0].matches[0].id").isEqualTo(validMatchId.toInt())
    }
}
