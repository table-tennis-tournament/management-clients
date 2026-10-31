package de.ttt.management.grouping.domain

import kotlin.test.assertEquals
import kotlin.test.assertTrue

class GroupStandingsCalculatorTest {

    private fun player(id: Long) = PlayerPerGroup(id = id, playerId = id, groupId = 1)

    private fun match(id: Long, p1: Long, p2: Long, s1: Int, s2: Int, b1: Int, b2: Int) =
        GroupMatchResult(id, groupId = 1, player1Id = p1, player2Id = p2, sets1 = s1, sets2 = s2, balls1 = b1, balls2 = b2, isPlayed = true)

    @org.junit.jupiter.api.Test
    fun `ranks players by matches won then sets diff then points won`() {
        val players = listOf(player(1), player(2), player(3))
        val matches = listOf(
            match(10, 1, 2, 3, 0, 33, 15),
            match(11, 1, 3, 3, 0, 33, 15),
            match(12, 2, 3, 3, 0, 33, 15)
        )

        val standings = GroupStandingsCalculator.compute(players, matches)

        assertEquals(listOf(1L, 2L, 3L), standings.map { it.playerId })
        assertEquals(listOf(1, 2, 3), standings.map { it.position })
        assertEquals(2, standings[0].matchesWon)
        assertEquals(1, standings[1].matchesWon)
        assertEquals(0, standings[2].matchesWon)
        assertTrue(standings.all { it.checked })
    }

    @org.junit.jupiter.api.Test
    fun `breaks a tie on sets diff`() {
        // All three players win one match each; they are separated by set difference.
        val players = listOf(player(1), player(2), player(3))
        val matches = listOf(
            match(10, 1, 2, 3, 0, 33, 15),   // 1 beats 2
            match(11, 1, 3, 2, 3, 25, 30),   // 3 beats 1
            match(12, 2, 3, 3, 2, 33, 28)    // 2 beats 3
        )

        val standings = GroupStandingsCalculator.compute(players, matches)

        // setsDiff: player 1 (+2), player 3 (0), player 2 (-2)
        assertEquals(listOf(1L, 3L, 2L), standings.map { it.playerId })
    }
}
