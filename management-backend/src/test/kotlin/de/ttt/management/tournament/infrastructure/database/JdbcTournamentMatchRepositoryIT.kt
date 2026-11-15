package de.ttt.management.tournament.infrastructure.database

import de.ttt.management.tournament.domain.CallState
import de.ttt.management.tournament.domain.SetResult
import de.ttt.management.tournament.domain.TournamentMatch
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

@SpringBootTest
@ActiveProfiles("test") // Uses H2
@Transactional
class JdbcTournamentMatchRepositoryIT {

    @Autowired
    private lateinit var repository: JdbcTournamentMatchRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private var matchId: Long = 0

    @BeforeEach
    fun setup() {
        jdbcTemplate.update("UPDATE matches SET matc_isplaying = 0, matc_played = 0, matc_tabl_id = NULL, matc_waitinglist = 0")
        jdbcTemplate.update("DELETE FROM mgmt_match_call_state")
        jdbcTemplate.update("DELETE FROM mgmt_matchtable")
        matchId = repository.findAll().first().id!!
    }

    private fun load(): TournamentMatch = repository.findById(matchId).orElseThrow()

    private fun matchTableRows(): List<Long> =
        jdbcTemplate.queryForList("SELECT tableId FROM mgmt_matchtable WHERE matchId = ?", Long::class.java, matchId).filterNotNull()

    private fun callStateRows(): Int =
        jdbcTemplate.queryForObject("SELECT COUNT(*) FROM mgmt_match_call_state WHERE matc_id = ?", Int::class.java, matchId)!!

    @Test
    fun `persists an assignment, a call and the table history`() {
        val match = load()
        match.assign(3L)
        match.call()
        assertEquals(1, repository.save(match))

        val reloaded = load()
        assertEquals(3L, reloaded.tableId)
        assertEquals(CallState.FirstCall, reloaded.callState)
        assertTrue(reloaded.startTime != null)
        assertEquals(listOf(3L), matchTableRows())
    }

    @Test
    fun `moving a match to another table replaces its table history row`() {
        val match = load()
        match.assign(3L)
        repository.save(match)
        match.start(5L)
        repository.save(match)

        assertEquals(listOf(5L), matchTableRows())
        assertTrue(load().isPlaying)
    }

    @Test
    fun `taking a match back clears the table, the call state and the table history`() {
        val match = load()
        match.assign(3L)
        match.call()
        repository.save(match)

        match.takeBack()
        repository.save(match)

        val reloaded = load()
        assertNull(reloaded.tableId)
        assertEquals(CallState.None, reloaded.callState)
        assertEquals(0, callStateRows())
        assertTrue(matchTableRows().isEmpty())
    }

    @Test
    fun `completing a match persists the result and leaves mktt-owned columns untouched`() {
        val before = jdbcTemplate.queryForMap(
            "SELECT matc_play1_id, matc_play2_id, matc_type_id, matc_nr, matc_roundnumber FROM matches WHERE matc_id = ?", matchId
        )
        val match = load()
        match.start(3L)
        match.complete(listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))
        repository.save(match)

        val reloaded = load()
        assertTrue(reloaded.isPlayed)
        assertNull(reloaded.tableId)
        assertEquals("3 : 0", reloaded.result)
        assertEquals("11=5,11=7,11=3", reloaded.resultRaw)
        assertEquals(33, reloaded.balls1)
        assertEquals(match.winner?.id, reloaded.winner?.id)
        assertTrue(matchTableRows().isEmpty())
        assertEquals(before, jdbcTemplate.queryForMap(
            "SELECT matc_play1_id, matc_play2_id, matc_type_id, matc_nr, matc_roundnumber FROM matches WHERE matc_id = ?", matchId
        ))
    }

    @Test
    fun `saving an unknown match updates nothing`() {
        assertEquals(0, repository.save(TournamentMatch(id = -1L)))
    }
}
