package de.ttt.management.tournament

import de.ttt.management.tournament.application.MatchService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
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

    @Test
    fun `setResult endpoint completes a match and publishes MatchCompleted`(events: PublishedEvents) {
        val matchId = matchService.getAllMatches().first().id!!

        restTestClient.post()
            .uri("/api/tournament/match/setResult/$matchId")
            .contentType(MediaType.APPLICATION_JSON)
            .body(mapOf("resultRaw" to "11:5,11:7,11:3", "sets1" to 3, "sets2" to 0))
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)

        assertThat(events.ofType(MatchCompleted::class.java)).hasSize(1)
        val event = events.ofType(MatchCompleted::class.java).iterator().next()
        assertThat(event.matchId).isEqualTo(matchId)
    }
}
