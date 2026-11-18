package de.ttt.management.tournament

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.expectExactJson
import de.ttt.management.tournament.application.MatchListService
import de.ttt.management.tournament.application.MatchService
import de.ttt.management.tournament.domain.CallState
import de.ttt.management.tournament.domain.MatchState
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.modulith.test.ApplicationModuleTest
import org.springframework.modulith.test.PublishedEvents
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient

@ApplicationModuleTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(DatabaseHelperConfiguration::class)
class TournamentModuleTest {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var matchService: MatchService

    @Autowired
    private lateinit var db: DatabaseHelper

    @Autowired
    private lateinit var matchListService: MatchListService

    @BeforeEach
    fun setup() {
        db.clean()
        db.insertSingleOpenMatch()
    }

    @Test
    fun `setResult endpoint completes a match and publishes MatchCompleted`(events: PublishedEvents) {
        val matchId = 1L

        restTestClient.post()
            .uri("/api/v2/match/setResult/$matchId")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(listOf(11, 5), listOf(11, 7), listOf(11, 3)))
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        // the match was never on a table, so the event carries no table
        assertThat(events.ofType(MatchCompleted::class.java)).containsExactly(
            MatchCompleted(matchId = matchId, winnerId = 1L, sets1 = 3, sets2 = 0, typeId = 1L, tableId = null)
        )
    }

    @Test
    fun `updateResult endpoint puts a match into playing mode and publishes MatchResultUpdated`(events: PublishedEvents) {
        val matchId = 1L

        restTestClient.post()
            .uri("/api/v2/match/updateResult/$matchId")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(listOf(11, 5), listOf(11, 7)))
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        assertThat(events.ofType(MatchResultUpdated::class.java)).containsExactly(
            MatchResultUpdated(matchId = matchId, sets1 = 2, sets2 = 0, typeId = 1L, tableId = null)
        )
    }

    @Test
    fun `matchtotable endpoint assigns a match and publishes MatchAssigned`(events: PublishedEvents) {
        val matchId = 1L

        restTestClient.post()
            .uri("/api/v2/match/matchtotable/1")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(matchId))
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        assertThat(events.ofType(MatchAssigned::class.java)).containsExactly(
            MatchAssigned(matchId = matchId, tableId = 1L, typeId = 1L, previousTableId = null)
        )

        assertThat(matchService.getMatch(matchId)!!.state).isEqualTo(MatchState.OnTable)
    }

    @Test
    fun `adding a match to the list publishes MatchListChanged and sets InQueue`(events: PublishedEvents) {
        val matchId = 1L

        restTestClient.post()
            .uri("/api/v2/matchlist/add")
            .contentType(MediaType.APPLICATION_JSON)
            .body(mapOf("matchIds" to listOf(matchId), "asGroup" to null, "position" to 0))
            .exchange()
            .expectStatus().isOk

        assertThat(events.ofType(MatchListChanged::class.java)).containsExactly(
            MatchListChanged(
                listOf(
                    MatchListChanged.Entry(
                        uuid = "00000000-0000-0000-0000-000000000001",
                        matchIds = listOf(matchId),
                        asGroup = null,
                        position = 0
                    )
                ),
                matchIds = listOf(matchId),
                typeIds = listOf(1L)
            )
        )

        assertThat(matchService.getMatch(matchId)!!.state).isEqualTo(MatchState.InQueue)
    }

    @Test
    fun `removing a queue entry names the removed match and its discipline`(events: PublishedEvents) {
        val matchId = 1L
        val uuid = matchListService.addMatchToList(listOf(matchId), asGroup = null, position = 0)!!.uuid

        restTestClient.delete()
            .uri("/api/v2/matchlist/$uuid")
            .exchange()
            .expectStatus().isOk

        assertThat(events.ofType(MatchListChanged::class.java).last())
            .isEqualTo(MatchListChanged(entries = emptyList(), matchIds = listOf(matchId), typeIds = listOf(1L)))
    }

    @Test
    fun `assigning a match names the other disciplines whose matches of the same players it blocks`(events: PublishedEvents) {
        // player 1 also plays an open doubles match (double 1 = players 1, 3) in discipline 2
        db.insertDiscipline(2, "Herren", kind = 2)
        (3L..5L).forEach { db.insertPlayer(it, "First$it", "Last$it") }
        db.insertDouble(1, player1Id = 1, player2Id = 3, disciplineId = 2)
        db.insertDouble(2, player1Id = 4, player2Id = 5, disciplineId = 2)
        db.insertMatch(2, 100001, 100002, disciplineId = 2)

        matchService.assignMatch(1L, 1L)

        assertThat(events.ofType(MatchAssigned::class.java)).containsExactly(
            MatchAssigned(matchId = 1L, tableId = 1L, typeId = 1L, previousTableId = null, affectedTypeIds = listOf(2L))
        )
    }

    @Test
    fun `call endpoint announces the first call and publishes MatchCalled`(events: PublishedEvents) {
        val matchId = 1L

        restTestClient.post()
            .uri("/api/v2/match/call")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(matchId))
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        assertThat(events.ofType(MatchCalled::class.java)).containsExactly(
            MatchCalled(matchIds = listOf(matchId), callState = "FirstCall", typeIds = listOf(1L), tableIds = emptyList())
        )
        assertThat(matchService.getMatch(matchId)!!.callState).isEqualTo(CallState.FirstCall)
    }

    @Test
    fun `playercall endpoint advances to the second call and publishes MatchCalled`(events: PublishedEvents) {
        val matchId = 1L
        db.insertCallState(matchId, callState = 1)

        restTestClient.post()
            .uri("/api/v2/playercall/$matchId")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        assertThat(events.ofType(MatchCalled::class.java)).containsExactly(
            MatchCalled(matchIds = listOf(matchId), callState = "SecondCall", typeIds = listOf(1L), tableIds = emptyList())
        )
        assertThat(matchService.getMatch(matchId)!!.callState).isEqualTo(CallState.SecondCall)
    }
}
