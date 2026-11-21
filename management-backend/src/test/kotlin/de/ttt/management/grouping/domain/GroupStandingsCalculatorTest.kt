package de.ttt.management.grouping.domain

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class GroupStandingsCalculatorTest {

    private fun player(id: Long) = PlayerPerGroup(id = id, playerId = id, groupId = 1)

    private fun match(id: Long, p1: Long, p2: Long, s1: Int, s2: Int, b1: Int, b2: Int, played: Boolean = true) =
        GroupMatchResult(id, groupId = 1, player1Id = p1, player2Id = p2, sets1 = s1, sets2 = s2, balls1 = b1, balls2 = b2, isPlayed = played)

    /** The complete expected standing of player [id]; the totals are given, the strings and the set difference follow. */
    private fun standing(
        id: Long, position: Int, won: Int, lost: Int, setsWon: Int, setsLost: Int,
        pointsWon: Int, pointsLost: Int, checked: Boolean = true
    ) = PlayerPerGroup(
        id = id, playerId = id, groupId = 1, position = position,
        matchesWon = won, matchesLost = lost, setsWon = setsWon, setsLost = setsLost,
        pointsWon = pointsWon, pointsLost = pointsLost,
        games = "$won : $lost", sets = "$setsWon : $setsLost", points = "$pointsWon : $pointsLost",
        checked = checked, setsDiff = setsWon - setsLost
    )

    @Test
    fun `ranks players by matches won`() {
        val matches = listOf(
            match(10, 1, 2, 3, 0, 33, 15),
            match(11, 1, 3, 3, 0, 33, 15),
            match(12, 2, 3, 3, 0, 33, 15)
        )

        assertEquals(
            listOf(
                standing(1, position = 1, won = 2, lost = 0, setsWon = 6, setsLost = 0, pointsWon = 66, pointsLost = 30),
                standing(2, position = 2, won = 1, lost = 1, setsWon = 3, setsLost = 3, pointsWon = 48, pointsLost = 48),
                standing(3, position = 3, won = 0, lost = 2, setsWon = 0, setsLost = 6, pointsWon = 30, pointsLost = 66)
            ),
            GroupStandingsCalculator.compute(listOf(player(1), player(2), player(3)), matches)
        )
    }

    @Test
    fun `matches won rank before a better set difference and more points`() {
        // Players 1 and 3 have the same set difference; 3 has more points, but 1 won more matches.
        val matches = listOf(
            match(10, 1, 2, 3, 2, 50, 48),   // 1 beats 2
            match(11, 1, 3, 3, 2, 45, 60),   // 1 beats 3 with fewer points
            match(12, 2, 3, 0, 3, 25, 45)    // 3 beats 2
        )

        assertEquals(
            listOf(
                standing(1, position = 1, won = 2, lost = 0, setsWon = 6, setsLost = 4, pointsWon = 95, pointsLost = 108),
                standing(3, position = 2, won = 1, lost = 1, setsWon = 5, setsLost = 3, pointsWon = 105, pointsLost = 70),
                standing(2, position = 3, won = 0, lost = 2, setsWon = 2, setsLost = 6, pointsWon = 73, pointsLost = 95)
            ),
            GroupStandingsCalculator.compute(listOf(player(1), player(2), player(3)), matches)
        )
    }

    @Test
    fun `breaks a tie on sets diff`() {
        // All three players win one match each; they are separated by set difference.
        val matches = listOf(
            match(10, 1, 2, 3, 0, 33, 15),   // 1 beats 2
            match(11, 1, 3, 2, 3, 25, 30),   // 3 beats 1
            match(12, 2, 3, 3, 2, 33, 28)    // 2 beats 3
        )

        assertEquals(
            listOf(
                standing(1, position = 1, won = 1, lost = 1, setsWon = 5, setsLost = 3, pointsWon = 58, pointsLost = 45),
                standing(3, position = 2, won = 1, lost = 1, setsWon = 5, setsLost = 5, pointsWon = 58, pointsLost = 58),
                standing(2, position = 3, won = 1, lost = 1, setsWon = 3, setsLost = 5, pointsWon = 48, pointsLost = 61)
            ),
            GroupStandingsCalculator.compute(listOf(player(1), player(2), player(3)), matches)
        )
    }

    @Test
    fun `breaks a tie on matches won and sets diff on points won`() {
        // Every player wins one match 3:2 and loses one 2:3, so only the points separate them.
        val matches = listOf(
            match(10, 1, 2, 3, 2, 50, 45),   // 1 beats 2
            match(11, 1, 3, 2, 3, 40, 52),   // 3 beats 1
            match(12, 2, 3, 3, 2, 55, 50)    // 2 beats 3
        )

        assertEquals(
            listOf(
                standing(3, position = 1, won = 1, lost = 1, setsWon = 5, setsLost = 5, pointsWon = 102, pointsLost = 95),
                standing(2, position = 2, won = 1, lost = 1, setsWon = 5, setsLost = 5, pointsWon = 100, pointsLost = 100),
                standing(1, position = 3, won = 1, lost = 1, setsWon = 5, setsLost = 5, pointsWon = 90, pointsLost = 97)
            ),
            GroupStandingsCalculator.compute(listOf(player(1), player(2), player(3)), matches)
        )
    }

    @Test
    fun `ignores unplayed matches and checks only players whose matches are all played`() {
        val matches = listOf(
            match(10, 1, 2, 3, 0, 33, 15),
            match(11, 1, 3, 3, 0, 33, 15),
            match(12, 2, 3, 0, 0, 0, 0, played = false)
        )

        // Player 4 has no match: not checked, and with a set difference of 0 ranked above players 2 and 3 (-3).
        // Players 2 and 3 tie completely and keep their input order.
        assertEquals(
            listOf(
                standing(1, position = 1, won = 2, lost = 0, setsWon = 6, setsLost = 0, pointsWon = 66, pointsLost = 30),
                standing(4, position = 2, won = 0, lost = 0, setsWon = 0, setsLost = 0, pointsWon = 0, pointsLost = 0, checked = false),
                standing(2, position = 3, won = 0, lost = 1, setsWon = 0, setsLost = 3, pointsWon = 15, pointsLost = 33, checked = false),
                standing(3, position = 4, won = 0, lost = 1, setsWon = 0, setsLost = 3, pointsWon = 15, pointsLost = 33, checked = false)
            ),
            GroupStandingsCalculator.compute(listOf(player(1), player(2), player(3), player(4)), matches)
        )
    }
}
