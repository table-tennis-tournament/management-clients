package de.ttt.management.grouping

import de.ttt.management.Api
import de.ttt.management.DatabaseHelper
import de.ttt.management.ResourceTestConfiguration
import de.ttt.management.TestState
import de.ttt.management.expectExactJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

/** `/api/v2/groups`: the groups of a discipline and their standings. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(ResourceTestConfiguration::class)
class GroupsResourceIT {

    @Autowired
    private lateinit var api: Api

    @Autowired
    private lateinit var testState: TestState

    @Autowired
    private lateinit var db: DatabaseHelper

    private val won = DatabaseHelper.MatchResult(sets1 = 3, sets2 = 0, balls1 = 33, balls2 = 15)

    /**
     * Discipline 1: group A (players 1-3; 1 beat 2, match 3 vs 2 open) and group B (players 4, 5, not ranked);
     * discipline 2: group C (player 6).
     */
    @BeforeEach
    fun setup() {
        testState.reset()
        db.insertDiscipline(1, "Herren")
        db.insertDiscipline(2, "Damen")
        (1L..6L).forEach { db.insertPlayer(it, "First$it", "Last$it") }
        db.insertGroup(1, "A", disciplineId = 1)
        db.insertGroup(2, "B", disciplineId = 1)
        db.insertGroup(3, "C", disciplineId = 2)
        (1L..3L).forEach { db.insertPlayerPerGroup(it, playerId = it, groupId = 1) }
        db.insertPlayerPerGroup(4, playerId = 5, groupId = 2)
        db.insertPlayerPerGroup(5, playerId = 4, groupId = 2)
        db.insertPlayerPerGroup(6, playerId = 6, groupId = 3)
        db.insertMatch(1, 1, 2, disciplineId = 1, groupId = 1, result = won)
        db.insertMatch(2, 3, 2, disciplineId = 1, groupId = 1)
    }

    private fun row(side: Int, position: Int, won: Int = 0, lost: Int = 0, sets: Pair<Int, Int> = 0 to 0, points: Pair<Int, Int> = 0 to 0) =
        """{"sideId": $side, "position": $position, "matchesWon": $won, "matchesLost": $lost,
           "setsWon": ${sets.first}, "setsLost": ${sets.second}, "pointsWon": ${points.first}, "pointsLost": ${points.second}}"""

    @Test
    fun `the standings follow every result, group by group, each by place`() {
        // 3 beats 2 with one more point won than 1 did, so 3 ranks first
        api.post("/match/setResult/2", listOf(listOf(12, 10), listOf(11, 5), listOf(11, 5))).expectStatus().isOk

        api.get("/groups/standings/1").expectStatus().isOk.expectExactJson(
            """
            [
              {"groupId": 1, "rows": [
                ${row(3, 1, won = 1, sets = 3 to 0, points = 34 to 20)},
                ${row(1, 2, won = 1, sets = 3 to 0, points = 33 to 15)},
                ${row(2, 3, lost = 2, sets = 0 to 6, points = 35 to 67)}
              ]},
              {"groupId": 2, "rows": [${row(4, 0)}, ${row(5, 0)}]}
            ]
            """
        )
    }

    @Test
    fun `a discipline without groups has no standings`() {
        api.get("/groups/standings/9999").expectStatus().isOk.expectExactJson("[]")
    }
}
