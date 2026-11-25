package de.ttt.management.tournament

import de.ttt.management.Api
import de.ttt.management.ResourceTestConfiguration
import de.ttt.management.Scenarios
import de.ttt.management.TestState
import de.ttt.management.expectExactJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

/** `/api/v2/playercall`: the next Call (second, then third) of a called match. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(ResourceTestConfiguration::class)
class PlayerCallResourceIT {

    @Autowired
    private lateinit var api: Api

    @Autowired
    private lateinit var testState: TestState

    @Autowired
    private lateinit var scenarios: Scenarios

    private val success = """{"success": true}"""

    private fun failure(message: String) = """{"success": false, "message": "$message"}"""

    /** Match 1 (players 1 vs 2) is at table 1 and has had its first call; match 3 (doubles) waits at table 2, not called. */
    @BeforeEach
    fun setup() {
        testState.reset()
        scenarios.givenOpenMatches()
        api.post("/match/matchtotable/1", listOf(1)).expectStatus().isOk
        api.post("/match/call", listOf(1)).expectStatus().isOk
        api.post("/match/matchtotable/2", listOf(3)).expectStatus().isOk
    }

    @Test
    fun `the table manager requests a second call of the missing player`() {
        api.post("/playercall/1", listOf(2)).expectStatus().isOk.expectExactJson(success)
        api.expectMatch(1, "after-second-call-requested")
    }

    @Test
    fun `the caller announces the requested call`() {
        api.post("/playercall/1", listOf(2)).expectStatus().isOk
        api.post("/playercall/announce", listOf(1)).expectStatus().isOk.expectExactJson(success)
        api.expectMatch(1, "after-second-call")
    }

    @Test
    fun `a third call for one player and a second for the other`() {
        api.post("/playercall/1", listOf(2)).expectStatus().isOk
        api.post("/playercall/announce", listOf(1)).expectStatus().isOk
        api.post("/playercall/1", listOf(1, 2)).expectStatus().isOk
        api.post("/playercall/announce", listOf(1)).expectStatus().isOk.expectExactJson(success)
        api.expectMatch(1, "after-third-call")
    }

    @Test
    fun `there is no call after the third`() {
        repeat(2) {
            api.post("/playercall/1", listOf(2)).expectStatus().isOk
            api.post("/playercall/announce", listOf(1)).expectStatus().isOk
        }
        api.post("/playercall/1", listOf(2)).expectStatus().isBadRequest.expectExactJson(failure("Could not request the call."))
    }

    @Test
    fun `rejects a request while another waits`() {
        api.post("/playercall/1", listOf(2)).expectStatus().isOk
        api.post("/playercall/1", listOf(1)).expectStatus().isBadRequest.expectExactJson(failure("Could not request the call."))
        api.expectMatch(1, "after-second-call-requested")
    }

    @Test
    fun `rejects a request before the first call`() {
        api.post("/playercall/3", listOf(1)).expectStatus().isBadRequest.expectExactJson(failure("Could not request the call."))
        api.expectMatch(3, "after-assign-doubles")
    }

    @Test
    fun `rejects a request for a player of another match, or for nobody`() {
        api.post("/playercall/1", listOf(3)).expectStatus().isBadRequest.expectExactJson(failure("Could not request the call."))
        api.post("/playercall/1", emptyList<Long>()).expectStatus().isBadRequest.expectExactJson(failure("Could not request the call."))
        api.expectMatch(1, "after-call")
    }

    @Test
    fun `rejects announcing without a requested call`() {
        api.post("/playercall/announce", listOf(1)).expectStatus().isBadRequest
            .expectExactJson(failure("Could not announce all calls."))
        api.expectMatch(1, "after-call")
    }

    @Test
    fun `rejects an unknown match`() {
        api.post("/playercall/9999", listOf(1)).expectStatus().isBadRequest.expectExactJson(failure("Could not request the call."))
        api.post("/playercall/announce", listOf(9999)).expectStatus().isBadRequest
            .expectExactJson(failure("Could not announce all calls."))
    }

    @Test
    fun `taking the match back clears its calls`() {
        api.post("/playercall/1", listOf(2)).expectStatus().isOk
        api.post("/match/takeBack", listOf(1)).expectStatus().isOk
        api.expectMatch(1, "after-take-back-called")
    }
}
