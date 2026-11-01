package de.ttt.management.tournament

import de.ttt.management.tournament.application.MatchService
import de.ttt.management.tournament.domain.CallState
import de.ttt.management.tournament.domain.MatchState
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.modulith.test.ApplicationModuleTest
import org.springframework.modulith.test.PublishedEvents
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient

@ApplicationModuleTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
class TournamentModuleTest {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var matchService: MatchService

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Test
    fun `setResult endpoint completes a match and publishes MatchCompleted`(events: PublishedEvents) {
        val matchId = matchService.getAllMatches().first().id!!

        restTestClient.post()
            .uri("/api/v2/match/setResult/$matchId")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(listOf(11, 5), listOf(11, 7), listOf(11, 3)))
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)

        assertThat(events.ofType(MatchCompleted::class.java)).hasSize(1)
        val event = events.ofType(MatchCompleted::class.java).iterator().next()
        assertThat(event.matchId).isEqualTo(matchId)
    }

    @Test
    fun `updateResult endpoint puts a match into playing mode and publishes MatchResultUpdated`(events: PublishedEvents) {
        val matchId = matchService.getAllMatches().first().id!!
        jdbcTemplate.update(
            "UPDATE matches SET matc_isplaying = 0, matc_played = 0, matc_tabl_id = NULL WHERE matc_id = ?",
            matchId
        )

        restTestClient.post()
            .uri("/api/v2/match/updateResult/$matchId")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(listOf(11, 5), listOf(11, 7)))
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)

        assertThat(events.ofType(MatchResultUpdated::class.java)).hasSize(1)
        val event = events.ofType(MatchResultUpdated::class.java).iterator().next()
        assertThat(event.matchId).isEqualTo(matchId)
    }

    @Test
    fun `matchtotable endpoint assigns a match and publishes MatchAssigned`(events: PublishedEvents) {
        val matchId = matchService.getAllMatches().first().id!!
        jdbcTemplate.update(
            "UPDATE matches SET matc_isplaying = 0, matc_played = 0, matc_tabl_id = NULL WHERE matc_id = ?",
            matchId
        )

        restTestClient.post()
            .uri("/api/v2/match/matchtotable/1")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(matchId))
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)

        assertThat(events.ofType(MatchAssigned::class.java)).hasSize(1)
        val event = events.ofType(MatchAssigned::class.java).iterator().next()
        assertThat(event.matchId).isEqualTo(matchId)

        assertThat(matchService.getMatch(matchId)!!.state).isEqualTo(MatchState.OnTable)
    }

    @Test
    fun `adding a match to the list publishes MatchListChanged and sets InQueue`(events: PublishedEvents) {
        val matchId = matchService.getAllMatches().first().id!!
        jdbcTemplate.update(
            "UPDATE matches SET matc_isplaying = 0, matc_played = 0, matc_waitinglist = 0, matc_tabl_id = NULL WHERE matc_id = ?",
            matchId
        )

        restTestClient.post()
            .uri("/api/v2/matchlist/add")
            .contentType(MediaType.APPLICATION_JSON)
            .body(mapOf("matchIds" to listOf(matchId), "asGroup" to null, "position" to 0))
            .exchange()
            .expectStatus().isOk

        assertThat(events.ofType(MatchListChanged::class.java)).hasSize(1)
        val event = events.ofType(MatchListChanged::class.java).iterator().next()
        assertThat(event.entries).anyMatch { it.matchIds.contains(matchId) }

        assertThat(matchService.getMatch(matchId)!!.state).isEqualTo(MatchState.InQueue)
    }

    @Test
    fun `call endpoint announces the first call and publishes MatchCalled`(events: PublishedEvents) {
        val matchId = matchService.getAllMatches().first().id!!
        jdbcTemplate.update(
            "UPDATE matches SET matc_isplaying = 0, matc_played = 0, matc_tabl_id = NULL WHERE matc_id = ?",
            matchId
        )
        jdbcTemplate.update("DELETE FROM mgmt_match_call_state WHERE matc_id = ?", matchId)

        restTestClient.post()
            .uri("/api/v2/match/call")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(matchId))
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)

        assertThat(events.ofType(MatchCalled::class.java)).hasSize(1)
        assertThat(matchService.getMatch(matchId)!!.callState).isEqualTo(CallState.FirstCall)
    }

    @Test
    fun `playercall endpoint advances to the second call and publishes MatchCalled`(events: PublishedEvents) {
        val matchId = matchService.getAllMatches().first().id!!
        jdbcTemplate.update(
            "UPDATE matches SET matc_isplaying = 0, matc_played = 0, matc_tabl_id = NULL WHERE matc_id = ?",
            matchId
        )
        jdbcTemplate.update("DELETE FROM mgmt_match_call_state WHERE matc_id = ?", matchId)
        jdbcTemplate.update("INSERT INTO mgmt_match_call_state (matc_id, call_state) VALUES (?, 1)", matchId)

        restTestClient.post()
            .uri("/api/v2/playercall/$matchId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)

        assertThat(events.ofType(MatchCalled::class.java)).hasSize(1)
        assertThat(matchService.getMatch(matchId)!!.callState).isEqualTo(CallState.SecondCall)
    }
}
