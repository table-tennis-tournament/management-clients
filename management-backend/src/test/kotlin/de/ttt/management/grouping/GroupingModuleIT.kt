package de.ttt.management.grouping

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelper.MatchResult
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.grouping.application.GroupingService
import de.ttt.management.tournament.application.MatchService
import de.ttt.management.tournament.domain.SetResult
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import kotlin.test.assertEquals

@SpringBootTest
@ActiveProfiles("test")
@Import(DatabaseHelperConfiguration::class)
class GroupingModuleIT {

    @Autowired
    private lateinit var groupingService: GroupingService

    @Autowired
    private lateinit var matchService: MatchService

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var db: DatabaseHelper

    private val won = MatchResult(sets1 = 3, sets2 = 0, balls1 = 33, balls2 = 15, resultRaw = "11=5,11=5,11=5")

    /** Group 1 of discipline 1 with players 1, 2 and 3; matches 10 (1 vs 2), 11 (1 vs 3), 12 (2 vs 3). */
    @BeforeEach
    fun setup() {
        db.clean()
        db.insertDiscipline(1, "Herren")
        db.insertGroup(1, "A", disciplineId = 1)
        (1L..3L).forEach { id ->
            db.insertPlayer(id, "First$id", "Last$id")
            db.insertPlayerPerGroup(id, playerId = id, groupId = 1)
        }
    }

    private fun insertGroupMatches(match12: MatchResult?) {
        db.insertMatch(10, 1, 2, disciplineId = 1, groupId = 1, result = won)
        db.insertMatch(11, 1, 3, disciplineId = 1, groupId = 1, result = won)
        db.insertMatch(12, 2, 3, disciplineId = 1, groupId = 1, result = match12)
    }

    private fun standings() = jdbcTemplate.queryForList(
        "SELECT ppgr_play_id, ppgr_position, ppgr_gamesw, ppgr_checked FROM playerpergroup WHERE ppgr_grou_id = 1 ORDER BY ppgr_position, ppgr_play_id"
    ).map { row ->
        listOf("ppgr_play_id", "ppgr_position", "ppgr_gamesw", "ppgr_checked").map { (row[it] as Number).toInt() }
    }

    @Test
    fun `updateStandings ranks the players of a completed group`() {
        // 1 beats 2 and 3, 2 beats 3 -> 1 (2 wins), 2 (1 win), 3 (0 wins).
        insertGroupMatches(match12 = won)

        groupingService.updateStandings(1)

        // [player, position, matches won, checked]
        assertEquals(listOf(listOf(1, 1, 2, 1), listOf(2, 2, 1, 1), listOf(3, 3, 0, 1)), standings())
    }

    @Test
    fun `updateStandings does nothing for an incomplete group`() {
        insertGroupMatches(match12 = null)

        groupingService.updateStandings(1)

        assertEquals(listOf(listOf(1, 0, 0, 0), listOf(2, 0, 0, 0), listOf(3, 0, 0, 0)), standings())
    }

    @Test
    fun `completing the last match of a group triggers the standings update`() {
        insertGroupMatches(match12 = null)

        matchService.setResult(12, listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))

        assertEquals(listOf(listOf(1, 1, 2, 1), listOf(2, 2, 1, 1), listOf(3, 3, 0, 1)), standings())
    }
}
