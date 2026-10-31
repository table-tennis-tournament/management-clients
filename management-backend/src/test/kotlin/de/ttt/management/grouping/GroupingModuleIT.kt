package de.ttt.management.grouping

import de.ttt.management.grouping.application.GroupingService
import de.ttt.management.tournament.application.MatchService
import de.ttt.management.tournament.domain.SetResult
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@SpringBootTest
@ActiveProfiles("test")
class GroupingModuleIT {

    @Autowired
    private lateinit var groupingService: GroupingService

    @Autowired
    private lateinit var matchService: MatchService

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Test
    fun `updateStandings ranks the players of a completed group`() {
        // Group 2: 249 beats 206 and 166, 206 beats 166 -> 249 (2), 206 (1), 166 (0).
        jdbcTemplate.update(
            "UPDATE matches SET matc_played = 1, matc_sets1 = 3, matc_sets2 = 0, matc_balls1 = 33, matc_balls2 = 15 WHERE matc_grou_id = 2"
        )
        groupingService.updateStandings(2)

        val rows = jdbcTemplate.queryForList(
            "SELECT ppgr_play_id, ppgr_position, ppgr_gamesw FROM playerpergroup WHERE ppgr_grou_id = 2 ORDER BY ppgr_position"
        )

        assertEquals(3, rows.size)
        assertEquals(listOf(249L, 206L, 166L), rows.map { (it["ppgr_play_id"] as Number).toLong() })
        assertEquals(2, (rows[0]["ppgr_gamesw"] as Number).toInt())
    }

    @Test
    fun `updateStandings does nothing for an incomplete group`() {
        jdbcTemplate.update("UPDATE matches SET matc_played = 0 WHERE matc_grou_id = 3")

        groupingService.updateStandings(3)

        val checked = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM playerpergroup WHERE ppgr_grou_id = 3 AND ppgr_checked = 1",
            Int::class.java
        )
        assertEquals(0, checked)
    }

    @Test
    fun `completing the last match of a group triggers the standings update`() {
        // Group 4 has matches 10, 11, 12. Leave match 12 open and complete it via the domain service.
        jdbcTemplate.update("UPDATE matches SET matc_played = 0 WHERE matc_grou_id = 4")
        jdbcTemplate.update("UPDATE matches SET matc_played = 1 WHERE matc_grou_id = 4 AND matc_id IN (10, 11)")

        matchService.setResult(12, listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))

        val rows = jdbcTemplate.queryForList(
            "SELECT ppgr_play_id FROM playerpergroup WHERE ppgr_grou_id = 4 ORDER BY ppgr_position"
        )
        assertEquals(3, rows.size)
        assertTrue((jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM playerpergroup WHERE ppgr_grou_id = 4 AND ppgr_checked = 1",
            Int::class.java
        ) ?: 0) > 0)
    }
}
