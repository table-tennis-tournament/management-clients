package de.ttt.management.tournament

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelper.MatchResult
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.expectJson
import de.ttt.management.tournament.application.MatchListService
import de.ttt.management.tournament.application.MatchService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient

/**
 * Compares every read endpoint of the tournament module completely with
 * `expected/tournament/<name>.json` (see [de.ttt.management.ExpectedJson]).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(DatabaseHelperConfiguration::class)
class TournamentReadModelIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var matchService: MatchService

    @Autowired
    private lateinit var matchListService: MatchListService

    @Autowired
    private lateinit var db: DatabaseHelper

    /**
     * One match in every state, assigned and called at the fixed test time:
     *
     * | match | sides                           | discipline     | state                          |
     * |-------|---------------------------------|----------------|--------------------------------|
     * | 1     | players 1 vs 2                  | 1 Herren       | Open                           |
     * | 2     | players 3 vs 4                  | 1 Herren       | OnTable 1, first call          |
     * | 3     | players 5 vs 6                  | 1 Herren       | Completed 3:1                  |
     * | 4     | double 1 (1, 2) vs double 2 (3, 4) | 2 Herren doubles | OnTable 2, second call     |
     * | 5     | players 1 vs 3                  | 1 Herren       | InQueue                        |
     * | 6     | players 5 vs 6                  | 1 Herren       | Started on table 3, third call |
     * | 7     | players 7 vs 8                  | 1 Herren       | Open, the only playable match  |
     *
     * Matches 1-3 and 5-7 are "Gruppenspiel" of group A, match 4 is a "Finale". Discipline 3
     * ("Senioren") is inactive and has no matches. Tables 1 to 4 exist; table 4 is free.
     */
    @BeforeEach
    fun setup() {
        db.clean()
        matchListService.setMatchListActive(false)

        db.insertDiscipline(1, "Herren")
        db.insertDiscipline(2, "Herren", kind = 2)
        db.insertDiscipline(3, "Senioren", active = false)
        db.insertMatchType(1, "Gruppenspiel")
        db.insertMatchType(2, "Finale")
        db.insertGroup(1, "A", disciplineId = 1)
        (1L..8L).forEach { db.insertPlayer(it, "First$it", "Last$it", ttr = 1400 + it.toInt() * 10) }
        db.insertDouble(1, player1Id = 1, player2Id = 2, disciplineId = 2)
        db.insertDouble(2, player1Id = 3, player2Id = 4, disciplineId = 2)
        db.insertTables(1L..4L)

        db.insertMatch(1, 1, 2, disciplineId = 1, groupId = 1, matchTypeId = 1)
        db.insertMatch(2, 3, 4, disciplineId = 1, groupId = 1, matchTypeId = 1)
        db.insertMatch(
            3, 5, 6, disciplineId = 1, groupId = 1, matchTypeId = 1,
            result = MatchResult(sets1 = 3, sets2 = 1, balls1 = 42, balls2 = 32, resultRaw = "11=5,11=7,9=11,11=9")
        )
        db.insertMatch(4, 100001, 100002, disciplineId = 2, matchTypeId = 2, roundNumber = 3)
        db.insertMatch(5, 1, 3, disciplineId = 1, groupId = 1, matchTypeId = 1)
        db.insertMatch(6, 5, 6, disciplineId = 1, groupId = 1, matchTypeId = 1)
        db.insertMatch(7, 7, 8, disciplineId = 1, groupId = 1, matchTypeId = 1)

        matchService.assignMatch(2, 1)
        matchService.callMatches(listOf(2))

        matchService.assignMatch(4, 2)
        matchService.callMatches(listOf(4))
        matchService.callPlayers(4)

        matchService.assignMatch(6, 3)
        matchService.callMatches(listOf(6))
        matchService.callPlayers(6)
        matchService.callPlayers(6)
        matchService.startMatch(6, 3)

        matchListService.addMatchToList(listOf(5), asGroup = null, position = 0)
    }

    private fun get(uri: String) = restTestClient.get().uri("/api/v2$uri").exchange().expectStatus().isOk

    // --- matches -----------------------------------------------------------------

    @Test
    fun `all matches`() = get("/match/all").expectJson("tournament/match-all")

    @Test
    fun `a doubles match by id`() = get("/match/4").expectJson("tournament/match-4")

    @Test
    fun `matches of a discipline`() = get("/match/typeid/2").expectJson("tournament/match-typeid-2")

    @Test
    fun `open matches`() = get("/match/open/all").expectJson("tournament/match-open-all")

    @Test
    fun `open matches of a discipline`() = get("/match/open/typeid/2").expectJson("tournament/match-open-typeid-2")

    @Test
    fun `played matches`() = get("/match/played/all").expectJson("tournament/match-played-all")

    @Test
    fun `played matches of a discipline`() = get("/match/played/typeid/1").expectJson("tournament/match-played-typeid-1")

    @Test
    fun `match to table assignments`() = get("/match/allmatchtable").expectJson("tournament/match-allmatchtable")

    @Test
    fun `load new matches`() = get("/match/loadnew").expectJson("tournament/match-loadnew")

    @Test
    fun `test socket`() = get("/testsocket").expectJson("tournament/testsocket")

    // --- disciplines -------------------------------------------------------------

    @Test
    fun `all disciplines with the doubles suffix`() = get("/types/all").expectJson("tournament/types-all")

    @Test
    fun `active disciplines`() = get("/types/open/all").expectJson("tournament/types-open-all")

    // --- caller ------------------------------------------------------------------

    @Test
    fun `matches on a table that are not called yet`() {
        // the caller view lists matches on a table without a call; match 1 is the only open one
        matchService.assignMatch(1, 4)
        get("/matchaggregates/caller").expectJson("tournament/matchaggregates-caller")
    }

    @Test
    fun `matches in the second call`() = get("/matchaggregates/secondCall").expectJson("tournament/matchaggregates-secondcall")

    @Test
    fun `matches in the third call`() = get("/matchaggregates/thirdCall").expectJson("tournament/matchaggregates-thirdcall")

    // --- queue -------------------------------------------------------------------

    @Test
    fun `the queue`() = get("/matchlist/all").expectJson("tournament/matchlist-all")

    @Test
    fun `the next queue entry once auto-start is active`() {
        matchListService.setMatchListActive(true)
        get("/matchlist/next").expectJson("tournament/matchlist-next")
    }

    // --- tables ------------------------------------------------------------------

    @Test
    fun `all tables with their matches`() = get("/table/all").expectJson("tournament/table-all")

    @Test
    fun `free tables`() = get("/table/free").expectJson("tournament/table-free")

    @Test
    fun `a table by id`() = get("/table/2").expectJson("tournament/table-2")

    @Test
    fun `the tables of table manager 1`() = get("/tables?table_manager=1").expectJson("tournament/tables-manager-1")
}
