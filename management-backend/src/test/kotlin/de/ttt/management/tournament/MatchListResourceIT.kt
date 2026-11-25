package de.ttt.management.tournament

import de.ttt.management.Api
import de.ttt.management.ResourceTestConfiguration
import de.ttt.management.Scenarios
import de.ttt.management.TestState
import de.ttt.management.expectExactJson
import de.ttt.management.expectJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

/** `/api/v2/matchlist`: the Queue and auto-start. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(ResourceTestConfiguration::class)
class MatchListResourceIT {

    @Autowired
    private lateinit var api: Api

    @Autowired
    private lateinit var testState: TestState

    @Autowired
    private lateinit var scenarios: Scenarios

    @BeforeEach
    fun resetState() = testState.reset()

    private val success = """{"success": true}"""
    private val entryNotFound = """{"success": false, "message": "MatchList entry not found"}"""

    /** The n-th UUID the tests generate (queue entries and table history rows both take one). */
    private fun uuid(n: Int) = "00000000-0000-0000-0000-%012d".format(n)

    private fun add(matchIds: List<Long>, position: Int, asGroup: Long? = null) =
        api.post("/matchlist/add", mapOf("matchIds" to matchIds, "asGroup" to asGroup, "position" to position))

    @Nested
    inner class `reading the queue of matches in every state` {

        @BeforeEach
        fun setup() = scenarios.givenMatchesInEveryState()

        @Test
        fun `the queue`() {
            api.get("/matchlist/all").expectStatus().isOk.expectJson("matchlist/all")
        }

        @Test
        fun `the next entry once auto-start is active`() {
            api.post("/matchlist/active/true").expectStatus().isOk.expectExactJson(success)
            api.get("/matchlist/next").expectStatus().isOk.expectJson("matchlist/next")
        }

        @Test
        fun `no next entry while auto-start is off`() {
            api.get("/matchlist/next").expectStatus().isNoContent
        }
    }

    @Nested
    inner class `managing the queue of open matches` {

        @BeforeEach
        fun setup() = scenarios.givenOpenMatches()

        @Test
        fun `adds a match, which goes into the queue`() {
            add(listOf(1), position = 1).expectStatus().isOk
                .expectExactJson("""{"uuid": "${uuid(1)}", "matchIds": [1], "asGroup": null, "position": 1}""")
            api.get("/matchlist/all").expectStatus().isOk
                .expectExactJson("""[{"uuid": "${uuid(1)}", "matchIds": [1], "asGroup": null, "position": 1}]""")
            api.expectMatch(1, "after-queue")
        }

        @Test
        fun `adding at a taken position moves the later entries back`() {
            add(listOf(1), position = 0).expectStatus().isOk
            add(listOf(3), position = 0, asGroup = 7).expectStatus().isOk
            // the queue is ordered by position
            api.get("/matchlist/all").expectStatus().isOk.expectExactJson(
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
            api.post("/match/setResult/1", listOf(listOf(11, 5), listOf(11, 7), listOf(11, 3))).expectStatus().isOk
            add(listOf(1), position = 0).expectStatus().isBadRequest
                .expectExactJson("""{"success": false, "message": "No open match to queue"}""")
            api.get("/matchlist/all").expectStatus().isOk.expectExactJson("[]")
        }

        @Test
        fun `removes an entry and its matches become open again`() {
            add(listOf(1), position = 0).expectStatus().isOk
            api.delete("/matchlist/${uuid(1)}").expectStatus().isOk.expectExactJson(success)
            api.get("/matchlist/all").expectStatus().isOk.expectExactJson("[]")
            api.expectMatch(1, "open")
        }

        @Test
        fun `rejects removing an unknown entry`() {
            api.delete("/matchlist/unknown").expectStatus().isBadRequest.expectExactJson(entryNotFound)
        }

        @Test
        fun `moves an entry to another position`() {
            add(listOf(1), position = 0).expectStatus().isOk
            add(listOf(3), position = 1).expectStatus().isOk

            api.post("/matchlist/move/${uuid(2)}/0").expectStatus().isOk.expectExactJson(success)

            api.get("/matchlist/all").expectStatus().isOk.expectExactJson(
                """[
                    {"uuid": "${uuid(2)}", "matchIds": [3], "asGroup": null, "position": 0},
                    {"uuid": "${uuid(1)}", "matchIds": [1], "asGroup": null, "position": 1}
                ]"""
            )
        }

        @Test
        fun `rejects moving an unknown entry`() {
            api.post("/matchlist/move/unknown/0").expectStatus().isBadRequest.expectExactJson(entryNotFound)
        }

        @Test
        fun `auto-start starts the next match from the queue`() {
            add(listOf(1), position = 0).expectStatus().isOk
            api.post("/matchlist/active/true").expectStatus().isOk

            api.post("/matchlist/auto-start").expectStatus().isOk.expectExactJson(success)

            api.expectMatch(1, "after-auto-start")
            api.get("/matchlist/all").expectStatus().isOk.expectExactJson("[]")
        }

        @Test
        fun `auto-start does not start a match whose player is already on a table`() {
            // match 2 shares player 1 with match 1, which is started on table 1
            api.post("/match/start/1/1").expectStatus().isOk
            add(listOf(2), position = 0).expectStatus().isOk
            api.post("/matchlist/active/true").expectStatus().isOk

            // success means that no start failed; a blocked entry simply waits
            api.post("/matchlist/auto-start").expectStatus().isOk.expectExactJson(success)

            api.expectMatch(2, "after-auto-start-blocked")
            // UUID 1 went to the table history row written when match 1 was started
            api.get("/matchlist/all").expectStatus().isOk
                .expectExactJson("""[{"uuid": "${uuid(2)}", "matchIds": [2], "asGroup": null, "position": 0}]""")
        }

        @Test
        fun `auto-start does nothing while it is switched off`() {
            add(listOf(1), position = 0).expectStatus().isOk

            api.post("/matchlist/auto-start").expectStatus().isOk.expectExactJson(success)

            api.expectMatch(1, "after-queue")
        }

        @Test
        fun `switching auto-start on and off shows in the settings`() {
            api.post("/matchlist/active/true").expectStatus().isOk.expectExactJson(success)
            api.get("/settings/all").expectStatus().isOk.expectJson("matchlist/settings-auto-start-on")

            api.post("/matchlist/active/false").expectStatus().isOk.expectExactJson(success)
            api.get("/settings/all").expectStatus().isOk.expectJson("matchlist/settings-auto-start-off")
        }
    }
}
