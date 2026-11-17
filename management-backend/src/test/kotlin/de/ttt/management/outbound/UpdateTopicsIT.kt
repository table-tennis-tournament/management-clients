package de.ttt.management.outbound

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.StompTestSupport
import de.ttt.management.StompTestSupport.assertNextEvent
import de.ttt.management.registration.application.DisciplineService
import de.ttt.management.registration.application.PlayerService
import de.ttt.management.tournament.application.MatchListService
import de.ttt.management.tournament.application.MatchService
import de.ttt.management.tournament.application.TableService
import de.ttt.management.tournament.domain.SetResult
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.simp.broker.SimpleBrokerMessageHandler
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.support.TransactionTemplate
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * Verifies topic routing, the event scope, the payload and after-commit publication (ADR 0003).
 * Every received envelope is compared completely with `expected/events/<topic>/<name>.json`;
 * together the tests cover every event type the backend publishes.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(DatabaseHelperConfiguration::class)
class UpdateTopicsIT {

    @LocalServerPort
    private var port: Int = 0

    @Autowired
    private lateinit var matchService: MatchService

    @Autowired
    private lateinit var matchListService: MatchListService

    @Autowired
    private lateinit var tableService: TableService

    @Autowired
    private lateinit var playerService: PlayerService

    @Autowired
    private lateinit var disciplineService: DisciplineService

    @Autowired
    private lateinit var db: DatabaseHelper

    @Autowired
    private lateinit var broker: SimpleBrokerMessageHandler

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val matchId = 1L
    private val tableId = 1L
    private val disciplineId = 1L

    /**
     * Discipline 1 with the open matches 1 (players 1 vs 2), 2 (3 vs 4) and 3 (5 vs 6), table 1, and
     * discipline 2 without matches, in which player 1 is registered (registration 1, not paid).
     */
    @BeforeEach
    fun setup() {
        db.clean()
        db.insertDiscipline(disciplineId, "Herren")
        db.insertDiscipline(2, "Damen")
        (1L..6L).forEach { db.insertPlayer(it, "First$it", "Last$it") }
        db.insertMatch(1, 1, 2, disciplineId)
        db.insertMatch(2, 3, 4, disciplineId)
        db.insertMatch(3, 5, 6, disciplineId)
        db.insertTable(tableId)
        db.insertRegistration(1, playerId = 1, disciplineId = 2)
    }

    private fun subscribe(topics: List<String> = StompTestSupport.ALL_TOPICS) =
        StompTestSupport.subscribe(StompTestSupport.connect(port), broker, topics)

    // --- matches -----------------------------------------------------------------

    @Test
    fun `assigning a match publishes MATCH_ASSIGNED with match, discipline and table scope`() {
        val messages = subscribe()

        matchService.assignMatch(matchId, tableId)

        assertNextEvent(messages, "matches", "match-assigned")
    }

    @Test
    fun `starting a match publishes MATCH_STARTED`() {
        matchService.assignMatch(matchId, tableId)
        val messages = subscribe()

        matchService.startMatch(matchId, tableId)

        assertNextEvent(messages, "matches", "match-started")
    }

    @Test
    fun `an interim result publishes MATCH_RESULT_UPDATED with the table it is played on`() {
        matchService.startMatch(matchId, tableId)
        val messages = subscribe()

        matchService.updateResult(matchId, listOf(SetResult(11, 5), SetResult(11, 7)))

        assertNextEvent(messages, "matches", "match-result-updated")
    }

    @Test
    fun `completing a match publishes MATCH_COMPLETED with the table it was played on`() {
        matchService.assignMatch(matchId, tableId)
        matchService.startMatch(matchId, tableId)
        val messages = subscribe()

        matchService.setResult(matchId, listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))

        assertNextEvent(messages, "matches", "match-completed")
    }

    @Test
    fun `taking a running match back publishes MATCH_TAKEN_BACK with the table it was on`() {
        matchService.assignMatch(matchId, tableId)
        matchService.startMatch(matchId, tableId)
        val messages = subscribe()

        assertTrue(matchService.stopMatch(matchId))

        assertNextEvent(messages, "matches", "match-taken-back")
    }

    @Test
    fun `removing matches from a table publishes MATCH_TAKEN_BACK with the table they were on`() {
        matchService.assignMatch(matchId, tableId)
        val messages = subscribe()

        assertTrue(matchService.removeMatchesFromTable(listOf(matchId)))

        assertNextEvent(messages, "matches", "match-taken-back")
    }

    @Test
    fun `freeing a match on a table publishes MATCH_FREED with that table`() {
        matchService.assignMatch(matchId, tableId)
        val messages = subscribe()

        assertTrue(matchService.freeMatches(listOf(matchId)))

        assertNextEvent(messages, "matches", "match-freed")
    }

    @Test
    fun `deleting a match publishes MATCH_DELETED`() {
        matchService.assignMatch(matchId, tableId)
        val messages = subscribe()

        assertTrue(matchService.deleteMatch(matchId))

        assertNextEvent(messages, "matches", "match-deleted")
    }

    @Test
    fun `a bulk operation publishes a single event with all match ids`() {
        val messages = subscribe()

        assertTrue(matchService.callMatches(listOf(1L, 2L, 3L)))

        assertNextEvent(messages, "matches", "match-called-bulk")
        assertNull(StompTestSupport.pollNone(messages))
    }

    // --- queue -------------------------------------------------------------------

    @Test
    fun `queueing a match publishes MATCH_LIST_CHANGED with the whole queue`() {
        matchListService.addMatchToList(listOf(1L), asGroup = null, position = 0)
        val messages = subscribe()

        matchListService.addMatchToList(listOf(2L, 3L), asGroup = 7, position = 0)

        assertNextEvent(messages, "queue", "match-list-changed")
    }

    // --- tables ------------------------------------------------------------------

    @Test
    fun `locking and unlocking a table publish on the tables topic`() {
        val messages = subscribe()

        assertTrue(tableService.lockTable(tableId))
        assertNextEvent(messages, "tables", "table-locked")

        assertTrue(tableService.unlockTable(tableId))
        assertNextEvent(messages, "tables", "table-unlocked")
    }

    // --- settings ----------------------------------------------------------------

    @Test
    fun `discipline colors publish on the settings topic`() {
        val messages = subscribe()

        assertTrue(disciplineService.saveTypeColor(disciplineId, "#fff", "#000"))

        assertNextEvent(messages, "settings", "discipline-colors-changed")
    }

    // --- players -----------------------------------------------------------------

    @Test
    fun `registering a player publishes PLAYER_REGISTERED`() {
        val messages = subscribe()

        playerService.registerPlayer("Jane", "Doe", 1600, "w", null)

        // players 1 to 6 exist, so the new player gets id 7
        assertNextEvent(messages, "players", "player-registered")
    }

    @Test
    fun `unregistering a player publishes PLAYER_UNREGISTERED`() {
        val messages = subscribe()

        assertTrue(playerService.unregisterPlayer(6))

        assertNextEvent(messages, "players", "player-unregistered")
    }

    @Test
    fun `player payment and activity publish on the players topic`() {
        val messages = subscribe()

        assertTrue(playerService.setPaid(1, true))
        assertNextEvent(messages, "players", "player-paid")

        assertTrue(playerService.setPlayerActiveState(1, false))
        assertNextEvent(messages, "players", "player-active-changed")
    }

    // --- routing and transactions ------------------------------------------------

    @Test
    fun `a client only receives events of the topics it subscribed to`() {
        val messages = subscribe(listOf("players"))

        matchService.assignMatch(matchId, tableId)
        assertNull(StompTestSupport.pollNone(messages))

        playerService.registerPlayer("Jane", "Doe", 1600, "w", null)
        assertNextEvent(messages, "players", "player-registered")
    }

    @Test
    fun `events are published only after the transaction commits`() {
        val messages = subscribe()
        val transaction = TransactionTemplate(transactionManager)

        transaction.executeWithoutResult {
            matchService.assignMatch(matchId, tableId)
            assertNull(StompTestSupport.pollNone(messages, 700), "event must not be sent before commit")
        }

        assertNextEvent(messages, "matches", "match-assigned")
    }

    @Test
    fun `a rolled back transaction publishes no event`() {
        val messages = subscribe()
        val transaction = TransactionTemplate(transactionManager)

        transaction.executeWithoutResult { status ->
            matchService.assignMatch(matchId, tableId)
            status.setRollbackOnly()
        }

        assertNull(StompTestSupport.pollNone(messages, 1500))
    }
}
