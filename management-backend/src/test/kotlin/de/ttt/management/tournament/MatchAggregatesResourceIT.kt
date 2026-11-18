package de.ttt.management.tournament

import de.ttt.management.ResourceIT
import de.ttt.management.expectExactJson
import de.ttt.management.expectJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

/** `/api/v2/matchaggregates`: the caller views, matches at a table grouped by their call. */
class MatchAggregatesResourceIT : ResourceIT() {

    @Nested
    inner class `matches in every state` {

        @BeforeEach
        fun setup() = givenMatchesInEveryState()

        @Test
        fun `matches on a table that are not called yet`() {
            // match 1 is the only open one; the caller view lists matches on a table without a call
            matchService.assignMatch(1, 4)
            get("/matchaggregates/caller").expectStatus().isOk.expectJson("matchaggregates/caller")
        }

        @Test
        fun `matches in the second call, doubles with both players`() {
            get("/matchaggregates/secondCall").expectStatus().isOk.expectJson("matchaggregates/secondcall")
        }

        @Test
        fun `matches in the third call`() {
            get("/matchaggregates/thirdCall").expectStatus().isOk.expectJson("matchaggregates/thirdcall")
        }
    }

    @Nested
    inner class `a match going through its calls` {

        @BeforeEach
        fun setup() = givenOpenMatches()

        @Test
        fun `a match moves from the caller view to the second and the third call`() {
            post("/match/matchtotable/1", listOf(1)).expectStatus().isOk
            get("/matchaggregates/caller").expectStatus().isOk.expectJson("matchaggregates/flow-not-called")

            post("/match/call", listOf(1)).expectStatus().isOk
            post("/playercall/1").expectStatus().isOk
            get("/matchaggregates/secondCall").expectStatus().isOk.expectJson("matchaggregates/flow-second-call")

            post("/playercall/1").expectStatus().isOk
            get("/matchaggregates/thirdCall").expectStatus().isOk.expectJson("matchaggregates/flow-third-call")

            // a called match no longer shows up in the views of the earlier calls
            get("/matchaggregates/caller").expectStatus().isOk.expectExactJson("[]")
            get("/matchaggregates/secondCall").expectStatus().isOk.expectExactJson("[]")
        }

        @Test
        fun `all views are empty without matches at a table`() {
            get("/matchaggregates/caller").expectStatus().isOk.expectExactJson("[]")
            get("/matchaggregates/secondCall").expectStatus().isOk.expectExactJson("[]")
            get("/matchaggregates/thirdCall").expectStatus().isOk.expectExactJson("[]")
        }
    }
}
