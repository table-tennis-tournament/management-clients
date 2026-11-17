package de.ttt.management.tournament.infrastructure.database

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.DeterministicTestConfiguration.Companion.NOW
import de.ttt.management.tournament.domain.SetResult
import de.ttt.management.tournament.domain.TournamentMatch
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import java.sql.Timestamp
import kotlin.test.assertEquals

/**
 * Compares whole database rows: the `matches` row against its state before the save plus the columns
 * the save is expected to change, so a write to any other (mktt-owned) column breaks the test.
 */
@SpringBootTest
@ActiveProfiles("test") // Uses H2
@Import(DatabaseHelperConfiguration::class)
class JdbcTournamentMatchRepositoryIT {

    @Autowired
    private lateinit var repository: JdbcTournamentMatchRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var db: DatabaseHelper

    private val matchId = 1L

    private lateinit var openRow: Map<String, Any?>

    @BeforeEach
    fun setup() {
        db.clean()
        db.insertSingleOpenMatch()
        openRow = matchRow()
    }

    private fun load(): TournamentMatch = repository.findById(matchId).orElseThrow()

    private fun matchRow(): Map<String, Any?> =
        jdbcTemplate.queryForMap("SELECT * FROM matches WHERE matc_id = ?", matchId).mapKeys { it.key.lowercase() }

    /** The `mgmt_matchtable` rows without `timestamp`, which the database sets from its own clock. */
    private fun matchTableRows(): List<Map<String, Any?>> =
        jdbcTemplate.queryForList("SELECT id, tableId, matchId FROM mgmt_matchtable ORDER BY id")
            .map { row -> row.mapKeys { it.key.lowercase() } }

    private fun callStateRows(): List<Map<String, Any?>> =
        jdbcTemplate.queryForList("SELECT * FROM mgmt_match_call_state ORDER BY matc_id")
            .map { row -> row.mapKeys { it.key.lowercase() } }

    private fun uuid(n: Int) = "00000000-0000-0000-0000-%012d".format(n)

    @Test
    fun `persists an assignment, a call and the table history`() {
        val match = load()
        match.assign(3L, now = NOW)
        match.call()
        assertEquals(1, repository.save(match))

        assertEquals(
            openRow + mapOf<String, Any?>("matc_tabl_id" to 3, "matc_starttime" to Timestamp.valueOf(NOW)),
            matchRow()
        )
        assertEquals(listOf(mapOf<String, Any?>("id" to uuid(1), "tableid" to 3, "matchid" to 1)), matchTableRows())
        assertEquals(listOf(mapOf<String, Any?>("matc_id" to 1L, "call_state" to 1)), callStateRows())
    }

    @Test
    fun `moving a match to another table replaces its table history row`() {
        val match = load()
        match.assign(3L, now = NOW)
        repository.save(match)
        match.start(5L, now = NOW)
        repository.save(match)

        assertEquals(
            openRow + mapOf<String, Any?>("matc_tabl_id" to 5, "matc_isplaying" to 1, "matc_starttime" to Timestamp.valueOf(NOW)),
            matchRow()
        )
        assertEquals(listOf(mapOf<String, Any?>("id" to uuid(2), "tableid" to 5, "matchid" to 1)), matchTableRows())
        assertEquals(emptyList(), callStateRows())
    }

    @Test
    fun `taking a match back clears the table, the call state and the table history`() {
        val match = load()
        match.assign(3L, now = NOW)
        match.call()
        repository.save(match)

        match.takeBack()
        repository.save(match)

        // the start time of the assignment stays
        assertEquals(openRow + mapOf<String, Any?>("matc_starttime" to Timestamp.valueOf(NOW)), matchRow())
        assertEquals(emptyList(), matchTableRows())
        assertEquals(emptyList(), callStateRows())
    }

    @Test
    fun `completing a match persists the result and leaves mktt-owned columns untouched`() {
        val match = load()
        match.start(3L, now = NOW)
        match.complete(listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))
        repository.save(match)

        assertEquals(
            openRow + mapOf<String, Any?>(
                "matc_played" to 1,
                "matc_starttime" to Timestamp.valueOf(NOW),
                "matc_winner_id" to 1,
                "matc_result" to "3 : 0",
                "matc_resultraw" to "11=5,11=7,11=3",
                "matc_sets1" to 3,
                "matc_sets2" to 0,
                "matc_balls1" to 33,
                "matc_balls2" to 15
            ),
            matchRow()
        )
        assertEquals(emptyList(), matchTableRows())
        assertEquals(emptyList(), callStateRows())
    }

    @Test
    fun `saving an unknown match updates nothing`() {
        assertEquals(0, repository.save(TournamentMatch(id = -1L)))
        assertEquals(openRow, matchRow())
        assertEquals(emptyList(), matchTableRows())
        assertEquals(emptyList(), callStateRows())
    }
}
