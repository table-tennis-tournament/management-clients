package de.ttt.management

import de.ttt.management.DatabaseHelper.MatchResult
import de.ttt.management.settings.application.PrinterService
import de.ttt.management.tournament.application.MatchListService
import de.ttt.management.tournament.application.MatchService
import org.junit.jupiter.api.BeforeEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient

/**
 * Base of the REST integration tests, one subclass per root resource under `/api/v2` (`MatchResourceIT` for
 * `/api/v2/match`, `TableResourceIT` for `/api/v2/table`, …). Every test starts from an empty database and the
 * default in-memory settings; the `given…` methods build the shared scenarios.
 *
 * All subclasses share one Spring context. Responses are compared completely, inline with `expectExactJson` or
 * with `expected/<resource>/<name>.json` via `expectJson` (see [ExpectedJson]).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(DatabaseHelperConfiguration::class)
abstract class ResourceIT {

    @Autowired
    protected lateinit var restTestClient: RestTestClient

    @Autowired
    protected lateinit var db: DatabaseHelper

    @Autowired
    protected lateinit var matchService: MatchService

    @Autowired
    protected lateinit var matchListService: MatchListService

    @Autowired
    protected lateinit var printerService: PrinterService

    @Autowired
    protected lateinit var printer: RecordingPrinterGateway

    @BeforeEach
    fun resetDatabaseAndSettings() {
        db.clean()
        // in-memory state survives between tests that share the context
        matchListService.setMatchListActive(false)
        printerService.clearSelectedPrinter()
        printerService.setPrintOnStart(true)
        printer.reset()
    }

    protected fun get(path: String) = restTestClient.get().uri("/api/v2$path").exchange()

    protected fun delete(path: String) = restTestClient.delete().uri("/api/v2$path").exchange()

    protected fun post(path: String, body: Any? = null): RestTestClient.ResponseSpec {
        val request = restTestClient.post().uri("/api/v2$path")
        if (body != null) request.contentType(MediaType.APPLICATION_JSON).body(body)
        return request.exchange()
    }

    protected fun put(path: String, body: Any) =
        restTestClient.put().uri("/api/v2$path").contentType(MediaType.APPLICATION_JSON).body(body).exchange()

    /** Compares the whole `GET /match/{id}` body with `expected/match/<name>.json`. */
    protected fun expectMatch(id: Long, name: String) {
        get("/match/$id").expectStatus().isOk.expectJson("match/$name")
    }

    /**
     * Open matches for commands:
     * singles discipline 1 ("Herren") with group A and the open "Gruppenspiel" matches 1 (players 1 vs 2) and
     * 2 (players 1 vs 3, shares player 1 with match 1); doubles discipline 2 with the open match 3 (double 1 =
     * players 1, 2 vs double 2 = players 3, 4); tables 1 to 3, all free.
     */
    protected fun givenOpenMatches() {
        db.insertDiscipline(1, "Herren")
        db.insertDiscipline(2, "Herren", kind = 2)
        db.insertMatchType(1, "Gruppenspiel")
        db.insertGroup(1, "A", disciplineId = 1)
        (1L..4L).forEach { db.insertPlayer(it, "First$it", "Last$it") }
        db.insertDouble(1, player1Id = 1, player2Id = 2, disciplineId = 2)
        db.insertDouble(2, player1Id = 3, player2Id = 4, disciplineId = 2)
        db.insertMatch(1, 1, 2, disciplineId = 1, groupId = 1, matchTypeId = 1)
        db.insertMatch(2, 1, 3, disciplineId = 1, groupId = 1, matchTypeId = 1)
        db.insertMatch(3, 100001, 100002, disciplineId = 2, matchTypeId = 1)
        db.insertTables(1L..3L)
    }

    /**
     * One match in every state, assigned and called at the fixed test time:
     *
     * | match | sides                              | discipline       | state                          |
     * |-------|------------------------------------|------------------|--------------------------------|
     * | 1     | players 1 vs 2                     | 1 Herren         | Open                           |
     * | 2     | players 3 vs 4                     | 1 Herren         | OnTable 1, first call          |
     * | 3     | players 5 vs 6                     | 1 Herren         | Completed 3:1                  |
     * | 4     | double 1 (1, 2) vs double 2 (3, 4) | 2 Herren doubles | OnTable 2, second call         |
     * | 5     | players 1 vs 3                     | 1 Herren         | InQueue                        |
     * | 6     | players 5 vs 6                     | 1 Herren         | Started on table 3, third call |
     * | 7     | players 7 vs 8                     | 1 Herren         | Open, the only playable match  |
     *
     * Matches 1-3 and 5-7 are "Gruppenspiel" of group A, match 4 is a "Finale". Discipline 3 ("Senioren") is
     * inactive and has no matches. Players 1 and 3 play for club 1. Tables 1 to 4 exist; table 4 is free.
     */
    protected fun givenMatchesInEveryState() {
        db.insertDiscipline(1, "Herren")
        db.insertDiscipline(2, "Herren", kind = 2)
        db.insertDiscipline(3, "Senioren", active = false)
        db.insertMatchType(1, "Gruppenspiel")
        db.insertMatchType(2, "Finale")
        db.insertGroup(1, "A", disciplineId = 1)
        db.insertClub(1, "TTV Musterstadt")
        (1L..8L).forEach {
            db.insertPlayer(it, "First$it", "Last$it", ttr = 1400 + it.toInt() * 10, clubId = 1L.takeIf { _ -> it == 1L || it == 3L })
        }
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
        // the scenario's assignments are not what the tests are about
        printer.reset()
    }

    /**
     * Tables 1 to 12 (table manager 1 has 1-5, manager 2 has 6, 7, 8, 11, 12); table 2 holds match 1 (players 1
     * vs 2 of discipline 1), so the free tables are 1 and 3 to 12.
     */
    protected fun givenTwelveTables() {
        db.insertTables(1L..12L)
        db.insertDiscipline(1, "Herren")
        db.insertPlayer(1, "Jane", "Doe")
        db.insertPlayer(2, "John", "Roe")
        db.insertMatch(1, 1, 2, disciplineId = 1, tableId = 2)
    }
}
