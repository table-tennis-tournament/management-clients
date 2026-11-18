package de.ttt.management.tournament

import de.ttt.management.ResourceIT
import de.ttt.management.expectExactJson
import de.ttt.management.expectJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

/** `/api/v2/matchlist`: the Queue and auto-start. */
class MatchListResourceIT : ResourceIT() {

    private val success = """{"success": true}"""
    private val entryNotFound = """{"success": false, "message": "MatchList entry not found"}"""

    /** The n-th UUID the tests generate (queue entries and table history rows both take one). */
    private fun uuid(n: Int) = "00000000-0000-0000-0000-%012d".format(n)

    private fun add(matchIds: List<Long>, position: Int, asGroup: Long? = null) =
        post("/matchlist/add", mapOf("matchIds" to matchIds, "asGroup" to asGroup, "position" to position))

    @Nested
    inner class `reading the queue of matches in every state` {

        @BeforeEach
        fun setup() = givenMatchesInEveryState()

        @Test
        fun `the queue`() {
            get("/matchlist/all").expectStatus().isOk.expectJson("matchlist/all")
        }

        @Test
        fun `the next entry once auto-start is active`() {
            post("/matchlist/active/true").expectStatus().isOk.expectExactJson(success)
            get("/matchlist/next").expectStatus().isOk.expectJson("matchlist/next")
        }

        @Test
        fun `no next entry while auto-start is off`() {
            get("/matchlist/next").expectStatus().isNoContent
        }
    }

    @Nested
    inner class `managing the queue of open matches` {

        @BeforeEach
        fun setup() = givenOpenMatches()

        @Test
        fun `adds a match, which goes into the queue`() {
            add(listOf(1), position = 1).expectStatus().isOk
                .expectExactJson("""{"uuid": "${uuid(1)}", "matchIds": [1], "asGroup": null, "position": 1}""")
            get("/matchlist/all").expectStatus().isOk
                .expectExactJson("""[{"uuid": "${uuid(1)}", "matchIds": [1], "asGroup": null, "position": 1}]""")
            expectMatch(1, "after-queue")
        }

        @Test
        fun `adding at a taken position moves the later entries back`() {
            add(listOf(1), position = 0).expectStatus().isOk
            add(listOf(3), position = 0, asGroup = 7).expectStatus().isOk
            // the queue is ordered by position
            get("/matchlist/all").expectStatus().isOk.expectExactJson(
                """[
                    {"uuid": "${uuid(2)}", "matchIds": [3], "asGroup": 7, "position": 0},
                    {"uuid": "${uuid(1)}", "matchIds": [1], "asGroup": null, "position": 1}
                ]"""
            )
        }

        @Test
        fun `a queued match is not queued twice`() {
            add(listOf(1), position = 0).expectStatus().isOk
            add(listOf(1, 2), position = 1).expectStatus().isOk
                .expectExactJson("""{"uuid": "${uuid(2)}", "matchIds": [2], "asGroup": null, "position": 1}""")
        }

        @Test
        fun `only open matches are queued`() {
            post("/match/setResult/1", listOf(listOf(11, 5), listOf(11, 7), listOf(11, 3))).expectStatus().isOk
            add(listOf(1), position = 0).expectStatus().isBadRequest
                .expectExactJson("""{"success": false, "message": "No open match to queue"}""")
            get("/matchlist/all").expectStatus().isOk.expectExactJson("[]")
        }

        @Test
        fun `removes an entry and its matches become open again`() {
            add(listOf(1), position = 0).expectStatus().isOk
            delete("/matchlist/${uuid(1)}").expectStatus().isOk.expectExactJson(success)
            get("/matchlist/all").expectStatus().isOk.expectExactJson("[]")
            expectMatch(1, "open")
        }

        @Test
        fun `rejects removing an unknown entry`() {
            delete("/matchlist/unknown").expectStatus().isBadRequest.expectExactJson(entryNotFound)
        }

        @Test
        fun `moves an entry to another position`() {
            add(listOf(1), position = 0).expectStatus().isOk
            add(listOf(3), position = 1).expectStatus().isOk

            post("/matchlist/move/${uuid(2)}/0").expectStatus().isOk.expectExactJson(success)

            get("/matchlist/all").expectStatus().isOk.expectExactJson(
                """[
                    {"uuid": "${uuid(2)}", "matchIds": [3], "asGroup": null, "position": 0},
                    {"uuid": "${uuid(1)}", "matchIds": [1], "asGroup": null, "position": 1}
                ]"""
            )
        }

        @Test
        fun `rejects moving an unknown entry`() {
            post("/matchlist/move/unknown/0").expectStatus().isBadRequest.expectExactJson(entryNotFound)
        }

        @Test
        fun `auto-start starts the next match from the queue`() {
            add(listOf(1), position = 0).expectStatus().isOk
            post("/matchlist/active/true").expectStatus().isOk

            post("/matchlist/auto-start").expectStatus().isOk.expectExactJson(success)

            expectMatch(1, "after-auto-start")
            get("/matchlist/all").expectStatus().isOk.expectExactJson("[]")
        }

        @Test
        fun `auto-start does not start a match whose player is already on a table`() {
            // match 2 shares player 1 with match 1, which is started on table 1
            post("/match/start/1/1").expectStatus().isOk
            add(listOf(2), position = 0).expectStatus().isOk
            post("/matchlist/active/true").expectStatus().isOk

            // success means that no start failed; a blocked entry simply waits
            post("/matchlist/auto-start").expectStatus().isOk.expectExactJson(success)

            expectMatch(2, "after-auto-start-blocked")
            // UUID 1 went to the table history row written when match 1 was started
            get("/matchlist/all").expectStatus().isOk
                .expectExactJson("""[{"uuid": "${uuid(2)}", "matchIds": [2], "asGroup": null, "position": 0}]""")
        }

        @Test
        fun `auto-start does nothing while it is switched off`() {
            add(listOf(1), position = 0).expectStatus().isOk

            post("/matchlist/auto-start").expectStatus().isOk.expectExactJson(success)

            expectMatch(1, "after-queue")
        }

        @Test
        fun `switching auto-start on and off shows in the settings`() {
            post("/matchlist/active/true").expectStatus().isOk.expectExactJson(success)
            get("/settings/all").expectStatus().isOk.expectJson("matchlist/settings-auto-start-on")

            post("/matchlist/active/false").expectStatus().isOk.expectExactJson(success)
            get("/settings/all").expectStatus().isOk.expectJson("matchlist/settings-auto-start-off")
        }
    }
}
