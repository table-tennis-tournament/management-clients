package de.ttt.management.tournament

import de.ttt.management.ResourceIT
import de.ttt.management.expectExactJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

/** `/api/v2/playercall`: the next Call (second, then third) of a called match. */
class PlayerCallResourceIT : ResourceIT() {

    private val success = """{"success": true}"""

    /** Match 1 is at table 1 and has had its first call. */
    @BeforeEach
    fun setup() {
        givenOpenMatches()
        post("/match/matchtotable/1", listOf(1)).expectStatus().isOk
        post("/match/call", listOf(1)).expectStatus().isOk
    }

    @Test
    fun `the second and then the third call`() {
        post("/playercall/1").expectStatus().isOk.expectExactJson(success)
        expectMatch(1, "after-second-call")

        post("/playercall/1").expectStatus().isOk.expectExactJson(success)
        expectMatch(1, "after-third-call")
    }

    @Test
    fun `there is no call after the third`() {
        repeat(3) { post("/playercall/1").expectStatus().isOk.expectExactJson(success) }
        expectMatch(1, "after-third-call")
    }

    @Test
    fun `a repeat call of a match that was never called changes nothing`() {
        post("/match/matchtotable/2", listOf(3)).expectStatus().isOk
        post("/playercall/3").expectStatus().isOk.expectExactJson(success)
        expectMatch(3, "after-assign-doubles")
    }

    @Test
    fun `rejects an unknown match`() {
        post("/playercall/9999").expectStatus().isBadRequest
            .expectExactJson("""{"success": false, "message": "Match not found"}""")
    }
}
