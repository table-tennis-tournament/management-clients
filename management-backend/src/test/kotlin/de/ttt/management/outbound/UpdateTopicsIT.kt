package de.ttt.management.outbound

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.StompTestSupport
import de.ttt.management.registration.application.DisciplineService
import de.ttt.management.registration.application.PlayerService
import de.ttt.management.tournament.application.MatchService
import de.ttt.management.tournament.application.TableService
import de.ttt.management.tournament.domain.SetResult
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.support.TransactionTemplate
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * Verifies topic routing, the event scope and after-commit publication (ADR 0003).
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
    private lateinit var tableService: TableService

    @Autowired
    private lateinit var playerService: PlayerService

    @Autowired
    private lateinit var disciplineService: DisciplineService

    @Autowired
    private lateinit var db: DatabaseHelper

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

    @Suppress("UNCHECKED_CAST")
    private fun scope(message: Map<String, Any>) = message["scope"] as Map<String, List<Number>>

    private fun ids(values: List<Number>?) = values.orEmpty().map { it.toLong() }

    @Test
    fun `match events arrive on the matches topic with match, discipline and table scope`() {
        val messages = StompTestSupport.subscribe(StompTestSupport.connect(port))

        matchService.assignMatch(matchId, tableId)

        val message = StompTestSupport.poll(messages)
        assertNotNull(message)
        assertEquals("MATCH_ASSIGNED", message["type"])
        assertEquals("matches", message["topic"])
        assertEquals(listOf(matchId), ids(scope(message)["matchIds"]))
        assertEquals(listOf(tableId), ids(scope(message)["tableIds"]))
        assertEquals(listOf(disciplineId), ids(scope(message)["typeIds"]))
    }

    @Test
    fun `completing a match carries the table it was played on`() {
        matchService.assignMatch(matchId, tableId)
        matchService.startMatch(matchId, tableId)
        val messages = StompTestSupport.subscribe(StompTestSupport.connect(port))

        matchService.setResult(matchId, listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))

        val message = StompTestSupport.poll(messages)
        assertNotNull(message)
        assertEquals("MATCH_COMPLETED", message["type"])
        assertEquals(listOf(tableId), ids(scope(message)["tableIds"]))
    }

    @Test
    fun `taking a running match back publishes MATCH_TAKEN_BACK with the table it was on`() {
        matchService.assignMatch(matchId, tableId)
        matchService.startMatch(matchId, tableId)
        val messages = StompTestSupport.subscribe(StompTestSupport.connect(port))

        assertTrue(matchService.stopMatch(matchId))

        val message = StompTestSupport.poll(messages)
        assertNotNull(message)
        assertEquals("MATCH_TAKEN_BACK", message["type"])
        assertEquals("matches", message["topic"])
        assertEquals(listOf(tableId), ids(scope(message)["tableIds"]))
    }

    @Test
    fun `removing matches from a table publishes MATCH_TAKEN_BACK with the table they were on`() {
        matchService.assignMatch(matchId, tableId)
        val messages = StompTestSupport.subscribe(StompTestSupport.connect(port))

        assertTrue(matchService.removeMatchesFromTable(listOf(matchId)))

        val message = StompTestSupport.poll(messages)
        assertNotNull(message)
        assertEquals("MATCH_TAKEN_BACK", message["type"])
        assertEquals(listOf(tableId), ids(scope(message)["tableIds"]))
    }

    @Test
    fun `a bulk operation publishes a single event with all match ids`() {
        val matchIds = listOf(1L, 2L, 3L)
        val messages = StompTestSupport.subscribe(StompTestSupport.connect(port))

        assertTrue(matchService.callMatches(matchIds))

        val message = StompTestSupport.poll(messages)
        assertNotNull(message)
        assertEquals("MATCH_CALLED", message["type"])
        assertEquals(matchIds.sorted(), ids(scope(message)["matchIds"]).sorted())
        assertNull(StompTestSupport.pollNone(messages))
    }

    @Test
    fun `locking and unlocking a table publish on the tables topic`() {
        val messages = StompTestSupport.subscribe(StompTestSupport.connect(port))

        assertTrue(tableService.lockTable(tableId))
        val locked = StompTestSupport.poll(messages)
        assertNotNull(locked)
        assertEquals("TABLE_LOCKED", locked["type"])
        assertEquals("tables", locked["topic"])
        assertEquals(listOf(tableId), ids(scope(locked)["tableIds"]))

        assertTrue(tableService.unlockTable(tableId))
        assertEquals("TABLE_UNLOCKED", StompTestSupport.poll(messages)?.get("type"))
    }

    @Test
    fun `discipline colors publish on the settings topic`() {
        val messages = StompTestSupport.subscribe(StompTestSupport.connect(port))

        assertTrue(disciplineService.saveTypeColor(disciplineId, "#fff", "#000"))

        val message = StompTestSupport.poll(messages)
        assertNotNull(message)
        assertEquals("DISCIPLINE_COLORS_CHANGED", message["type"])
        assertEquals("settings", message["topic"])
        assertEquals(listOf(disciplineId), ids(scope(message)["typeIds"]))
    }

    @Test
    fun `player payment and activity publish on the players topic`() {
        val messages = StompTestSupport.subscribe(StompTestSupport.connect(port))

        assertTrue(playerService.setPaid(1, true))
        val paid = StompTestSupport.poll(messages)
        assertNotNull(paid)
        assertEquals("PLAYER_PAID", paid["type"])
        assertEquals("players", paid["topic"])

        assertTrue(playerService.setPlayerActiveState(1, false))
        val activity = StompTestSupport.poll(messages)
        assertNotNull(activity)
        assertEquals("PLAYER_ACTIVE_CHANGED", activity["type"])
        assertEquals("players", activity["topic"])
    }

    @Test
    fun `a client only receives events of the topics it subscribed to`() {
        val messages = StompTestSupport.subscribe(StompTestSupport.connect(port), listOf("players"))

        matchService.assignMatch(matchId, tableId)
        assertNull(StompTestSupport.pollNone(messages))

        playerService.registerPlayer("Only", "Players", 1500, "m", null)
        assertEquals("PLAYER_REGISTERED", StompTestSupport.poll(messages)?.get("type"))
    }

    @Test
    fun `events are published only after the transaction commits`() {
        val messages = StompTestSupport.subscribe(StompTestSupport.connect(port))
        val transaction = TransactionTemplate(transactionManager)

        transaction.executeWithoutResult {
            matchService.assignMatch(matchId, tableId)
            assertNull(StompTestSupport.pollNone(messages, 700), "event must not be sent before commit")
        }

        assertEquals("MATCH_ASSIGNED", StompTestSupport.poll(messages)?.get("type"))
    }

    @Test
    fun `a rolled back transaction publishes no event`() {
        val messages = StompTestSupport.subscribe(StompTestSupport.connect(port))
        val transaction = TransactionTemplate(transactionManager)

        transaction.executeWithoutResult { status ->
            matchService.assignMatch(matchId, tableId)
            status.setRollbackOnly()
        }

        assertNull(StompTestSupport.pollNone(messages, 1500))
    }
}
