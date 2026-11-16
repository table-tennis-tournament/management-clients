package de.ttt.management.tournament

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.expectExactJson
import de.ttt.management.expectJson
import de.ttt.management.tournament.application.MatchListService
import de.ttt.management.tournament.application.MatchService
import de.ttt.management.tournament.domain.CallState
import de.ttt.management.tournament.domain.MatchState
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test") // Uses H2
@Import(DatabaseHelperConfiguration::class)
class TournamentModuleIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var matchService: MatchService

    @Autowired
    private lateinit var matchListService: MatchListService

    @Autowired
    private lateinit var db: DatabaseHelper

    private val validMatchId = 1L

    /**
     * Singles discipline 1 ("Herren") with group A and the open "Gruppenspiel" matches
     * 1 (players 1 vs 2) and 2 (players 1 vs 3, shares player 1 with match 1);
     * doubles discipline 2 with the open match 3 (double 1 = players 1, 2 vs double 2 = players 3, 4);
     * tables 1 to 3, all free.
     */
    @BeforeEach
    fun setup() {
        db.clean()
        // the auto-start flag lives in memory and survives between tests sharing the context
        matchListService.setMatchListActive(false)

        db.insertDiscipline(1, "Herren")
        db.insertDiscipline(2, "Herren", kind = 2)
        db.insertMatchType(1, "Gruppenspiel")
        db.insertGroup(1, "A", disciplineId = 1)
        (1L..4L).forEach { db.insertPlayer(it, "First$it", "Last$it") }
        db.insertDouble(1, player1Id = 1, player2Id = 2, disciplineId = 2)
        db.insertDouble(2, player1Id = 3, player2Id = 4, disciplineId = 2)
        db.insertMatch(1, 1, 2, disciplineId = 1, groupId = 1, matchTypeId = 1)
        db.insertMatch(2, 1, 3, disciplineId = 1, groupId = 1, matchTypeId = 1)
        db.insertMatch(3, 100001, 100002, disciplineId = 2, matchTypeId = 1)
        db.insertTables(1L..3L)
    }

    @Test
    fun `should start a match successfully`() {
        val tableId = 1L

        restTestClient.post()
            .uri("/api/v2/match/start/$validMatchId/$tableId")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")
    }

    @Test
    fun `should fail to start a match that is already playing`() {
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
        val tableId = 3L
        restTestClient.post()
            .uri("/api/v2/match/start/$validMatchId/$tableId")
            .exchange()
            .expectStatus().isOk

        restTestClient.post()
            .uri("/api/v2/match/stop/$validMatchId")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")
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
        val matchIds = listOf(validMatchId)
        val tableName = "1"

        restTestClient.post()
            .uri("/api/v2/match/matchtotable/$tableName")
            .contentType(MediaType.APPLICATION_JSON)
            .body(matchIds)
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")
    }

    @Test
    fun `should assign match to second table`() {

        restTestClient.post()
            .uri("/api/v2/match/matchtosecondtable/2")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(validMatchId))
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        assertTrue(matchService.getMatch(validMatchId)!!.tableId != null)
    }

    @Test
    fun `should remove match from table`() {

        restTestClient.post()
            .uri("/api/v2/match/matchtotable/1")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(validMatchId))
            .exchange()
            .expectStatus().isOk

        restTestClient.post()
            .uri("/api/v2/match/remove/1")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(validMatchId))
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        val removed = matchService.getMatch(validMatchId)!!
        assertTrue(removed.tableId == null)
        assertFalse(removed.isPlaying)
        assertTrue(removed.state == MatchState.Open)
    }

    @Test
    fun `should list assigned matches via allmatchtable`() {

        restTestClient.post()
            .uri("/api/v2/match/matchtotable/1")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(validMatchId))
            .exchange()
            .expectStatus().isOk

        restTestClient.get()
            .uri("/api/v2/match/allmatchtable")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""[{"matchId": 1, "tableId": 1}]""")
    }

    @Test
    fun `loadnew endpoint returns success`() {
        restTestClient.get()
            .uri("/api/v2/match/loadnew")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")
    }

    @Test
    fun `should free matches successfully`() {
        val matchIds = listOf(validMatchId)

        restTestClient.post()
            .uri("/api/v2/match/free")
            .contentType(MediaType.APPLICATION_JSON)
            .body(matchIds)
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")
    }

    @Test
    fun `freeing a match marks it as a walkover`() {

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
        val matchIds = listOf(validMatchId)

        restTestClient.post()
            .uri("/api/v2/match/takeBack")
            .contentType(MediaType.APPLICATION_JSON)
            .body(matchIds)
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")
    }

    @Test
    fun `should manage match list successfully`() {
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

        // the first generated UUID of a test
        val uuid = "00000000-0000-0000-0000-000000000001"
        restTestClient.get()
            .uri("/api/v2/matchlist/all")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""[{"uuid": "$uuid", "matchIds": [1], "asGroup": null, "position": 1}]""")

        restTestClient.delete()
            .uri("/api/v2/matchlist/$uuid")
            .exchange()
            .expectStatus().isOk

        restTestClient.get()
            .uri("/api/v2/matchlist/all")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("[]")
    }

    @Test
    fun `should set result successfully`() {
        restTestClient.post()
            .uri("/api/v2/match/setResult/$validMatchId")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(listOf(11, 5), listOf(11, 7), listOf(11, 3)))
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")
    }

    @Test
    fun `should delete match successfully`() {
        restTestClient.delete()
            .uri("/api/v2/match/$validMatchId")
            .exchange()
            .expectStatus().isOk

        assertEquals(null, matchService.getMatch(validMatchId))
    }

    @Test
    fun `adding a match to the list sets it InQueue`() {
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
            .uri("/api/v2/matchlist/active/true")
            .exchange()
            .expectStatus().isOk

        restTestClient.post()
            .uri("/api/v2/matchlist/auto-start")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        assertTrue(matchService.getMatch(validMatchId)!!.isPlaying)

        restTestClient.get()
            .uri("/api/v2/matchlist/all")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("[]")
    }

    @Test
    fun `auto-start does not start a match whose player is already on a table`() {
        val first = 1L
        val second = 2L // shares player 1 with the first match

        // Start the first match on table "1" — its players are now blocking.
        restTestClient.post()
            .uri("/api/v2/match/start/$first/1")
            .exchange()
            .expectStatus().isOk

        // Queue the second match.
        restTestClient.post()
            .uri("/api/v2/matchlist/add")
            .contentType(MediaType.APPLICATION_JSON)
            .body(mapOf("matchIds" to listOf(second), "asGroup" to null, "position" to 0))
            .exchange()
            .expectStatus().isOk

        restTestClient.post()
            .uri("/api/v2/matchlist/active/true")
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
            // UUID 1 went to the table history row written when match 1 was started
            .expectExactJson("""[{"uuid": "00000000-0000-0000-0000-000000000002", "matchIds": [2], "asGroup": null, "position": 0}]""")
    }

    @Test
    fun `caller aggregate resolves doubles team ids to individual players`() {
        // Match 3 is a doubles match: side A references double team 100001 (= double 1: players 1, 2).
        matchService.assignMatch(3, 1)

        val doubles = matchService.getMatchesByCallState(CallState.None).single()

        assertEquals(3L, doubles.id)
        assertEquals(listOf(1L, 2L), doubles.team1.map { it.id })
        assertEquals(listOf(3L, 4L), doubles.team2.map { it.id })
        assertEquals(2, doubles.team1.size)
        assertTrue(doubles.team1.all { it.firstName != null })
    }

    @Test
    fun `a match moves through caller second and third call`() {
        matchService.assignMatch(validMatchId, 1)

        // Not yet called -> appears in the caller view
        restTestClient.get()
            .uri("/api/v2/matchaggregates/caller")
            .exchange()
            .expectStatus().isOk
            .expectJson("tournament/caller-flow-not-called")

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
            .expectExactJson("""{"success": true}""")

        restTestClient.get()
            .uri("/api/v2/matchaggregates/secondCall")
            .exchange()
            .expectStatus().isOk
            .expectJson("tournament/caller-flow-second-call")

        // Third call
        restTestClient.post()
            .uri("/api/v2/playercall/$validMatchId")
            .exchange()
            .expectStatus().isOk

        restTestClient.get()
            .uri("/api/v2/matchaggregates/thirdCall")
            .exchange()
            .expectStatus().isOk
            .expectJson("tournament/caller-flow-third-call")

        // a called match no longer shows up in the views of the earlier calls
        restTestClient.get().uri("/api/v2/matchaggregates/caller").exchange().expectStatus().isOk.expectExactJson("[]")
        restTestClient.get().uri("/api/v2/matchaggregates/secondCall").exchange().expectStatus().isOk.expectExactJson("[]")
    }
}
