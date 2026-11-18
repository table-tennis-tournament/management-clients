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

    /** Match 1 is at table 1 and has had its first call. */
    @BeforeEach
    fun setup() {
        testState.reset()
        scenarios.givenOpenMatches()
        api.post("/match/matchtotable/1", listOf(1)).expectStatus().isOk
        api.post("/match/call", listOf(1)).expectStatus().isOk
    }

    @Test
    fun `the second and then the third call`() {
        api.post("/playercall/1").expectStatus().isOk.expectExactJson(success)
        api.expectMatch(1, "after-second-call")

        api.post("/playercall/1").expectStatus().isOk.expectExactJson(success)
        api.expectMatch(1, "after-third-call")
    }

    @Test
    fun `there is no call after the third`() {
        repeat(3) { api.post("/playercall/1").expectStatus().isOk.expectExactJson(success) }
        api.expectMatch(1, "after-third-call")
    }

    @Test
    fun `a repeat call of a match that was never called changes nothing`() {
        api.post("/match/matchtotable/2", listOf(3)).expectStatus().isOk
        api.post("/playercall/3").expectStatus().isOk.expectExactJson(success)
        api.expectMatch(3, "after-assign-doubles")
    }

    @Test
    fun `rejects an unknown match`() {
        api.post("/playercall/9999").expectStatus().isBadRequest
            .expectExactJson("""{"success": false, "message": "Match not found"}""")
    }
}
