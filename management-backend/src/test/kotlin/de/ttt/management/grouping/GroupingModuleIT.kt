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

    /** Every column `JdbcPlayerPerGroupRepository.save` writes, plus the player, as one row per player. */
    private val columns = listOf(
        "ppgr_play_id", "ppgr_position", "ppgr_gamesw", "ppgr_gamesl", "ppgr_setw", "ppgr_setl",
        "ppgr_pointsw", "ppgr_pointsl", "ppgr_games", "ppgr_sets", "ppgr_points", "ppgr_checked", "ppgr_setdiff"
    )

    private fun standings(): List<List<Any?>> = jdbcTemplate.queryForList(
        "SELECT ${columns.joinToString()} FROM playerpergroup WHERE ppgr_grou_id = 1 ORDER BY ppgr_position, ppgr_play_id"
    ).map { row -> columns.map { row[it] } }

    // [player, position, matches won, lost, sets won, lost, points won, lost, games, sets, points, checked, set difference]
    private val completedGroup = listOf(
        listOf(1, 1, 2, 0, 6, 0, 66, 30, "2 : 0", "6 : 0", "66 : 30", 1, 6),
        listOf(2, 2, 1, 1, 3, 3, 48, 48, "1 : 1", "3 : 3", "48 : 48", 1, 0),
        listOf(3, 3, 0, 2, 0, 6, 30, 66, "0 : 2", "0 : 6", "30 : 66", 1, -6)
    )

    @Test
    fun `updateStandings ranks the players of a completed group`() {
        // 1 beats 2 and 3, 2 beats 3 -> 1 (2 wins), 2 (1 win), 3 (0 wins).
        insertGroupMatches(match12 = won)

        groupingService.updateStandings(1)

        assertEquals(completedGroup, standings())
    }

    @Test
    fun `updateStandings does nothing for an incomplete group`() {
        insertGroupMatches(match12 = null)

        groupingService.updateStandings(1)

        // the rows as inserted: nothing computed yet
        assertEquals(
            (1..3).map { listOf(it, 0, 0, 0, 0, 0, 0, 0, null, null, null, 0, 0) },
            standings()
        )
    }

    @Test
    fun `completing the last match of a group triggers the standings update`() {
        insertGroupMatches(match12 = null)

        matchService.setResult(12, listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))

        assertEquals(completedGroup, standings())
    }

    @Test
    fun `a walkover counts as won 3 to 0 in sets and 33 to 0 in points`() {
        insertGroupMatches(match12 = null)

        // player 3 did not appear: player 2 wins kampflos, entered as 0 0 0
        matchService.setResult(12, listOf(SetResult(11, 0), SetResult(11, 0), SetResult(11, 0)), kampflos = true)

        assertEquals(
            listOf(
                listOf(1, 1, 2, 0, 6, 0, 66, 30, "2 : 0", "6 : 0", "66 : 30", 1, 6),
                listOf(2, 2, 1, 1, 3, 3, 48, 33, "1 : 1", "3 : 3", "48 : 33", 1, 0),
                listOf(3, 3, 0, 2, 0, 6, 15, 66, "0 : 2", "0 : 6", "15 : 66", 1, -6)
            ),
            standings()
        )
    }
}
