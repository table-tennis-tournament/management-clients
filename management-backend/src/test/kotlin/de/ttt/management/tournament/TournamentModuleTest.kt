package de.ttt.management.tournament

import de.ttt.management.tournament.application.MatchService
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
            .uri("/api/tournament/match/setResult/$matchId")
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
            .uri("/api/tournament/match/updateResult/$matchId")
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
    fun `matchtotable endpoint assigns a match and publishes MatchStarted`(events: PublishedEvents) {
        val matchId = matchService.getAllMatches().first().id!!
        jdbcTemplate.update(
            "UPDATE matches SET matc_isplaying = 0, matc_played = 0, matc_tabl_id = NULL WHERE matc_id = ?",
            matchId
        )

        restTestClient.post()
            .uri("/api/tournament/match/matchtotable/1")
            .contentType(MediaType.APPLICATION_JSON)
            .body(listOf(matchId))
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)

        assertThat(events.ofType(MatchStarted::class.java)).hasSize(1)
        val event = events.ofType(MatchStarted::class.java).iterator().next()
        assertThat(event.matchId).isEqualTo(matchId)
    }
}
