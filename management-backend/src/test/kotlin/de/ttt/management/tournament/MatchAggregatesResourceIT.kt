package de.ttt.management.tournament

import de.ttt.management.Api
import de.ttt.management.ResourceTestConfiguration
import de.ttt.management.Scenarios
import de.ttt.management.TestState
import de.ttt.management.expectExactJson
import de.ttt.management.expectJson
import de.ttt.management.tournament.application.MatchService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

/** `/api/v2/matchaggregates`: the caller views, matches at a table grouped by their call. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(ResourceTestConfiguration::class)
class MatchAggregatesResourceIT {

    @Autowired
    private lateinit var api: Api

    @Autowired
    private lateinit var testState: TestState

    @Autowired
    private lateinit var scenarios: Scenarios

    @Autowired
    private lateinit var matchService: MatchService

    @BeforeEach
    fun resetState() = testState.reset()

    @Nested
    inner class `matches in every state` {

        @BeforeEach
        fun setup() = scenarios.givenMatchesInEveryState()

        @Test
        fun `matches on a table that are not called yet`() {
            // match 1 is the only open one; the caller view lists matches on a table without a call
            matchService.assignMatch(1, 4)
            api.get("/matchaggregates/caller").expectStatus().isOk.expectJson("matchaggregates/caller")
        }

        @Test
        fun `matches in the second call, doubles with both players`() {
            api.get("/matchaggregates/secondCall").expectStatus().isOk.expectJson("matchaggregates/secondcall")
        }

        @Test
        fun `matches in the third call`() {
            api.get("/matchaggregates/thirdCall").expectStatus().isOk.expectJson("matchaggregates/thirdcall")
        }
    }

    @Nested
    inner class `a match going through its calls` {

        @BeforeEach
        fun setup() = scenarios.givenOpenMatches()

        @Test
        fun `a match moves from the caller view to the second and the third call`() {
            api.post("/match/matchtotable/1", listOf(1)).expectStatus().isOk
            api.get("/matchaggregates/caller").expectStatus().isOk.expectJson("matchaggregates/flow-not-called")

            api.post("/match/call", listOf(1)).expectStatus().isOk
            api.post("/playercall/1").expectStatus().isOk
            api.get("/matchaggregates/secondCall").expectStatus().isOk.expectJson("matchaggregates/flow-second-call")

            api.post("/playercall/1").expectStatus().isOk
            api.get("/matchaggregates/thirdCall").expectStatus().isOk.expectJson("matchaggregates/flow-third-call")

            // a called match no longer shows up in the views of the earlier calls
            api.get("/matchaggregates/caller").expectStatus().isOk.expectExactJson("[]")
            api.get("/matchaggregates/secondCall").expectStatus().isOk.expectExactJson("[]")
        }

        @Test
        fun `all views are empty without matches at a table`() {
            api.get("/matchaggregates/caller").expectStatus().isOk.expectExactJson("[]")
            api.get("/matchaggregates/secondCall").expectStatus().isOk.expectExactJson("[]")
            api.get("/matchaggregates/thirdCall").expectStatus().isOk.expectExactJson("[]")
        }
    }
}
