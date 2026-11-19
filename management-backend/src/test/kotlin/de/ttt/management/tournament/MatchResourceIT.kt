package de.ttt.management.tournament

import de.ttt.management.Api
import de.ttt.management.DatabaseHelper
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

/** `/api/v2/match`: reading matches and every command on a match. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(ResourceTestConfiguration::class)
class MatchResourceIT {

    @Autowired
    private lateinit var api: Api

    @Autowired
    private lateinit var testState: TestState

    @Autowired
    private lateinit var scenarios: Scenarios

    @Autowired
    private lateinit var db: DatabaseHelper

    @BeforeEach
    fun resetState() = testState.reset()

    private val success = """{"success": true}"""

    private fun failure(message: String) = """{"success": false, "message": "$message"}"""

    private val threeNil = listOf(listOf(11, 5), listOf(11, 7), listOf(11, 3))

    @Nested
    inner class `reading matches in every state` {

        @BeforeEach
        fun setup() = scenarios.givenMatchesInEveryState()

        @Test
        fun `all matches`() {
            api.get("/match/all").expectStatus().isOk.expectJson("match/all")
        }

        @Test
        fun `a doubles match by id`() {
            api.get("/match/4").expectStatus().isOk.expectJson("match/4")
        }

        @Test
        fun `an unknown match is not found`() {
            api.get("/match/9999").expectStatus().isNotFound.expectBody().isEmpty()
        }

        @Test
        fun `matches of a discipline`() {
            api.get("/match/typeid/2").expectStatus().isOk.expectJson("match/typeid-2")
        }

        @Test
        fun `an unknown discipline has no matches`() {
            api.get("/match/typeid/9999").expectStatus().isOk.expectExactJson("[]")
        }

        @Test
        fun `open matches`() {
            api.get("/match/open/all").expectStatus().isOk.expectJson("match/open-all")
        }

        @Test
        fun `open matches of a discipline`() {
            api.get("/match/open/typeid/2").expectStatus().isOk.expectJson("match/open-typeid-2")
        }

        @Test
        fun `played matches`() {
            api.get("/match/played/all").expectStatus().isOk.expectJson("match/played-all")
        }

        @Test
        fun `played matches of a discipline`() {
            api.get("/match/played/typeid/1").expectStatus().isOk.expectJson("match/played-typeid-1")
        }

        @Test
        fun `which match is on which table`() {
            api.get("/match/allmatchtable").expectStatus().isOk.expectJson("match/allmatchtable")
        }

        @Test
        fun `loadnew is kept for the legacy clients and does nothing`() {
            api.get("/match/loadnew").expectStatus().isOk.expectExactJson(success)
        }
    }

    @Nested
    inner class `commands on open matches` {

        @BeforeEach
        fun setup() = scenarios.givenOpenMatches()

        // --- start -------------------------------------------------------------------

        @Test
        fun `starts a match on a table`() {
            api.post("/match/start/1/1").expectStatus().isOk.expectExactJson(success)
            api.expectMatch(1, "after-start")
        }

        @Test
        fun `rejects starting a match that is already playing`() {
            api.post("/match/start/1/2").expectStatus().isOk
            api.post("/match/start/1/2").expectStatus().isBadRequest.expectExactJson(failure("Could not start match."))
        }

        @Test
        fun `rejects starting a completed match`() {
            api.post("/match/setResult/1", threeNil).expectStatus().isOk
            api.post("/match/start/1/1").expectStatus().isBadRequest.expectExactJson(failure("Could not start match."))
            api.expectMatch(1, "after-set-result")
        }

        @Test
        fun `rejects starting a match on an unknown table`() {
            api.post("/match/start/1/9999").expectStatus().isBadRequest.expectExactJson(failure("Could not start match."))
            api.expectMatch(1, "open")
        }

        @Test
        fun `rejects starting a match on a locked table`() {
            api.post("/table/1/lock").expectStatus().isOk
            api.post("/match/start/1/1").expectStatus().isBadRequest.expectExactJson(failure("Could not start match."))
            api.expectMatch(1, "open")
        }

        @Test
        fun `rejects starting an unknown match`() {
            api.post("/match/start/9999/1").expectStatus().isBadRequest.expectExactJson(failure("Could not start match."))
        }

        // --- take back -----------------------------------------------------------------

        @Test
        fun `takes back a running match`() {
            api.post("/match/start/1/3").expectStatus().isOk
            api.post("/match/takeBack/1").expectStatus().isOk.expectExactJson(success)
            api.expectMatch(1, "after-take-back-running")
        }

        @Test
        fun `the deprecated stop path still takes back a running match`() {
            api.post("/match/start/1/3").expectStatus().isOk
            api.post("/match/stop/1").expectStatus().isOk.expectExactJson(success)
            api.expectMatch(1, "after-take-back-running")
        }

        @Test
        fun `rejects taking back a match that is not running`() {
            api.post("/match/takeBack/1").expectStatus().isBadRequest.expectExactJson(failure("Could not take back the match."))
            api.expectMatch(1, "open")
        }

        @Test
        fun `rejects taking back an unknown match`() {
            api.post("/match/takeBack/9999").expectStatus().isBadRequest.expectExactJson(failure("Could not take back the match."))
        }

        @Test
        fun `takes back several matches, also a called one`() {
            api.post("/match/start/1/1").expectStatus().isOk
            api.post("/match/call", listOf(1)).expectStatus().isOk
            api.post("/match/takeBack", listOf(1)).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(1, "after-take-back")
        }

        @Test
        fun `taking back several matches with an unknown one takes back the others`() {
            api.post("/match/matchtotable/1", listOf(1)).expectStatus().isOk
            api.post("/match/takeBack", listOf(1, 9999)).expectStatus().isBadRequest
                .expectExactJson(failure("Could not take back all matches."))
            api.expectMatch(1, "after-take-back")
        }

        // --- assign and remove -----------------------------------------------------------

        @Test
        fun `assigns a match to a table by its number`() {
            api.post("/match/matchtotable/1", listOf(1)).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(1, "after-assign")
            api.get("/match/allmatchtable").expectStatus().isOk.expectExactJson("""[{"matchId": 1, "tableId": 1}]""")
        }

        @Test
        fun `a match names the number of its table, which differs from the id`() {
            db.insertTable(20, "21")
            api.post("/match/matchtotable/21", listOf(1)).expectStatus().isOk
            api.get("/match/1").expectStatus().isOk.expectBody()
                .jsonPath("$.tableId").isEqualTo(20)
                .jsonPath("$.tableNumber").isEqualTo(21)

            api.post("/match/takeBack", listOf(1)).expectStatus().isOk
            api.get("/match/1").expectStatus().isOk.expectBody()
                .jsonPath("$.tableId").isEmpty()
                .jsonPath("$.tableNumber").isEmpty()
        }

        @Test
        fun `rejects assigning to an unknown table`() {
            api.post("/match/matchtotable/99", listOf(1)).expectStatus().isBadRequest
                .expectExactJson(failure("Could not assign all matches to table."))
            api.expectMatch(1, "open")
        }

        @Test
        fun `rejects assigning to a locked table`() {
            api.post("/table/1/lock").expectStatus().isOk
            api.post("/match/matchtotable/1", listOf(1)).expectStatus().isBadRequest
                .expectExactJson(failure("Could not assign all matches to table."))
            api.expectMatch(1, "open")
        }

        @Test
        fun `rejects assigning a completed match`() {
            api.post("/match/setResult/1", threeNil).expectStatus().isOk
            api.post("/match/matchtotable/1", listOf(1)).expectStatus().isBadRequest
                .expectExactJson(failure("Could not assign all matches to table."))
            api.expectMatch(1, "after-set-result")
        }

        // --- a group on two tables -----------------------------------------------------------

        @Test
        fun `puts waiting matches on a second table`() {
            api.post("/match/matchtotable/1", listOf(1, 2)).expectStatus().isOk
            api.post("/match/matchtosecondtable/2", listOf(1, 2)).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(1, "after-assign-second-table")
            // the second table is in use
            api.get("/table/free").expectStatus().isOk.expectExactJson(
                """[{"id": 3, "number": 3, "isLocked": false, "matches": []}]"""
            )
        }

        @Test
        fun `rejects a second table for a match that waits at no table`() {
            api.post("/match/matchtosecondtable/2", listOf(1)).expectStatus().isBadRequest
                .expectExactJson(failure("Could not assign all matches to the second table."))
            api.expectMatch(1, "open")
        }

        @Test
        fun `rejects an unknown second table`() {
            api.post("/match/matchtotable/1", listOf(1)).expectStatus().isOk
            api.post("/match/matchtosecondtable/99", listOf(1)).expectStatus().isBadRequest
                .expectExactJson(failure("Could not assign all matches to the second table."))
            api.expectMatch(1, "after-assign")
        }

        @Test
        fun `a match at two tables is started at its second table and leaves the first`() {
            api.post("/match/matchtotable/1", listOf(1)).expectStatus().isOk
            api.post("/match/matchtosecondtable/2", listOf(1)).expectStatus().isOk

            api.post("/match/start/1/2").expectStatus().isOk.expectExactJson(success)

            api.expectMatch(1, "after-start-at-second-table")
            api.get("/table/free").expectStatus().isOk.expectExactJson(
                """[
                    {"id": 1, "number": 1, "isLocked": false, "matches": []},
                    {"id": 3, "number": 3, "isLocked": false, "matches": []}
                ]"""
            )
        }

        @Test
        fun `rejects starting a match at a table it is not at, while it waits at two`() {
            api.post("/match/matchtotable/1", listOf(1)).expectStatus().isOk
            api.post("/match/matchtosecondtable/2", listOf(1)).expectStatus().isOk

            api.post("/match/start/1/3").expectStatus().isBadRequest.expectExactJson(failure("Could not start match."))
            api.expectMatch(1, "after-assign-second-table-single")
        }

        @Test
        fun `takes a match off one of its two tables`() {
            api.post("/match/matchtotable/1", listOf(1)).expectStatus().isOk
            api.post("/match/matchtosecondtable/2", listOf(1)).expectStatus().isOk

            api.post("/match/remove/1", listOf(1)).expectStatus().isOk.expectExactJson(success)

            api.expectMatch(1, "after-remove-from-one-table")
        }

        @Test
        fun `rejects taking a match off its only table`() {
            api.post("/match/matchtotable/1", listOf(1)).expectStatus().isOk
            api.post("/match/remove/1", listOf(1)).expectStatus().isBadRequest
                .expectExactJson(failure("Could not remove all matches from table."))
            api.expectMatch(1, "after-assign")
        }

        @Test
        fun `rejects removing an unknown match`() {
            api.post("/match/remove/1", listOf(9999)).expectStatus().isBadRequest
                .expectExactJson(failure("Could not remove all matches from table."))
        }

        // --- free and walkover ---------------------------------------------------------------

        @Test
        fun `frees a match, which waits for its result`() {
            api.post("/match/matchtotable/1", listOf(1)).expectStatus().isOk
            api.post("/match/free", listOf(1)).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(1, "after-free")
        }

        @Test
        fun `the result of a freed match completes it`() {
            api.post("/match/free", listOf(1)).expectStatus().isOk
            api.post("/match/setResult/1", threeNil).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(1, "after-set-result")
        }

        @Test
        fun `rejects freeing an unknown match`() {
            api.post("/match/free", listOf(9999)).expectStatus().isBadRequest.expectExactJson(failure("Could not free all matches."))
        }

        @Test
        fun `ends a match as a walkover, played without a result`() {
            api.post("/match/matchtotable/1", listOf(1)).expectStatus().isOk
            api.post("/match/walkover", listOf(1)).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(1, "after-walkover")
        }

        @Test
        fun `rejects a walkover of an unknown match`() {
            api.post("/match/walkover", listOf(9999)).expectStatus().isBadRequest
                .expectExactJson(failure("Could not end all matches as walkovers."))
        }

        // --- results -------------------------------------------------------------------

        @Test
        fun `completes a match with its result`() {
            api.post("/match/setResult/1", threeNil).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(1, "after-set-result")
        }

        @Test
        fun `rejects a result without a winner of three sets`() {
            api.post("/match/setResult/1", listOf(listOf(11, 5), listOf(11, 7))).expectStatus().isBadRequest
                .expectExactJson(failure("Could not set result."))
            api.expectMatch(1, "open")
        }

        @Test
        fun `rejects a result with an invalid set`() {
            // 11:10 is no finished set: a set is won by two points
            api.post("/match/setResult/1", listOf(listOf(11, 10), listOf(11, 7), listOf(11, 3))).expectStatus().isBadRequest
                .expectExactJson(failure("Could not set result."))
            api.expectMatch(1, "open")
        }

        @Test
        fun `rejects a result for an unknown match`() {
            api.post("/match/setResult/9999", threeNil).expectStatus().isBadRequest.expectExactJson(failure("Could not set result."))
        }

        @Test
        fun `records an interim result and keeps the match running`() {
            api.post("/match/updateResult/1", listOf(listOf(11, 5), listOf(9, 11))).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(1, "after-update-result")
        }

        @Test
        fun `rejects an interim result for an unknown match`() {
            api.post("/match/updateResult/9999", listOf(listOf(11, 5))).expectStatus().isBadRequest
                .expectExactJson(failure("Could not update result."))
        }

        // --- call ----------------------------------------------------------------------

        @Test
        fun `calls a match on a table`() {
            api.post("/match/matchtotable/1", listOf(1)).expectStatus().isOk
            api.post("/match/call", listOf(1)).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(1, "after-call")
        }

        @Test
        fun `rejects calling a completed match`() {
            api.post("/match/setResult/1", threeNil).expectStatus().isOk
            api.post("/match/call", listOf(1)).expectStatus().isBadRequest.expectExactJson(failure("Could not call all matches."))
        }

        // --- delete --------------------------------------------------------------------

        @Test
        fun `deletes a match`() {
            api.delete("/match/1").expectStatus().isOk.expectExactJson(success)
            api.get("/match/1").expectStatus().isNotFound
        }

        @Test
        fun `rejects deleting an unknown match`() {
            api.delete("/match/9999").expectStatus().isBadRequest.expectExactJson(failure("Match not found"))
        }

        @Test
        fun `deletes all matches of a discipline and keeps the others`() {
            api.delete("/match/type/1").expectStatus().isOk.expectExactJson(success)
            api.get("/match/typeid/1").expectStatus().isOk.expectExactJson("[]")
            api.get("/match/3").expectStatus().isOk
        }

        @Test
        fun `rejects deleting the matches of a discipline without matches`() {
            api.delete("/match/type/9999").expectStatus().isBadRequest
                .expectExactJson(failure("Type not found or matches not found for type"))
        }
    }

    @Nested
    inner class `the knockout winner moves on` {

        @BeforeEach
        fun setup() = scenarios.givenKnockoutBracket()

        private val nilThree = listOf(listOf(5, 11), listOf(7, 11), listOf(3, 11))

        @Test
        fun `the winner of an odd numbered match becomes Side 1 of the next match`() {
            api.post("/match/setResult/11", threeNil).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(13, "knockout-semifinal-side1-set")
        }

        @Test
        fun `the winner of an even numbered match becomes Side 2 of the next match`() {
            api.post("/match/setResult/11", threeNil).expectStatus().isOk
            api.post("/match/setResult/12", nilThree).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(13, "knockout-semifinal-both-sides-set")
        }

        @Test
        fun `a corrected result moves the corrected winner on, over the earlier one`() {
            api.post("/match/setResult/11", threeNil).expectStatus().isOk
            api.post("/match/setResult/11", nilThree).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(13, "knockout-semifinal-side1-corrected")
        }

        @Test
        fun `a winner moves on into a match that is already being played`() {
            api.post("/match/setResult/11", threeNil).expectStatus().isOk
            api.post("/match/setResult/12", nilThree).expectStatus().isOk
            api.post("/match/start/13/1").expectStatus().isOk
            api.post("/match/setResult/11", nilThree).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(13, "knockout-semifinal-started-side1-corrected")
        }

        @Test
        fun `a doubles winner moves on as its double`() {
            api.post("/match/setResult/21", nilThree).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(22, "knockout-doubles-final-side2-set")
        }

        @Test
        fun `an interim result moves nobody on`() {
            api.post("/match/updateResult/11", listOf(listOf(11, 5), listOf(11, 7))).expectStatus().isOk
            api.expectMatch(13, "knockout-semifinal-empty")
        }

        @Test
        fun `nothing moves on from the final`() {
            api.post("/match/setResult/14", threeNil).expectStatus().isOk.expectExactJson(success)
            api.get("/match/typeid/1").expectStatus().isOk.expectJson("match/knockout-after-final")
        }

        @Test
        fun `a missing next match leaves the result in place`() {
            api.delete("/match/13").expectStatus().isOk
            api.post("/match/setResult/11", threeNil).expectStatus().isOk.expectExactJson(success)
            api.expectMatch(11, "knockout-quarterfinal-completed")
        }
    }
}
