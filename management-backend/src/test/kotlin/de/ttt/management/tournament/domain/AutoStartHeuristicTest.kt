package de.ttt.management.tournament.domain

import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class AutoStartHeuristicTest {

    private fun match(id: Long, p1: Long?, p2: Long?, tableId: Long? = null) = TournamentMatch(
        id = id,
        player1 = p1?.let { TournamentPlayer(id = it) },
        player2 = p2?.let { TournamentPlayer(id = it) },
        tableId = tableId
    )

    private fun entry(position: Int, vararg matchIds: Long) = MatchList(matchIds = matchIds.toList(), position = position)

    @org.junit.jupiter.api.Test
    fun `returns null for an empty queue`() {
        assertNull(AutoStartHeuristic.selectNext(emptyList(), emptyMap()))
    }

    @org.junit.jupiter.api.Test
    fun `picks the earliest position when all matches are playable`() {
        val matches = mapOf(
            1L to match(1, 101, 102),
            2L to match(2, 201, 202)
        )
        val next = AutoStartHeuristic.selectNext(listOf(entry(1, 2), entry(0, 1)), matches)
        assertEquals(listOf(1L), next!!.matchIds)
    }

    @org.junit.jupiter.api.Test
    fun `filterFirst skips entries sharing a player with an earlier entry`() {
        val matches = mapOf(
            1L to match(1, 101, 102),
            2L to match(2, 101, 103)
        )
        val filtered = AutoStartHeuristic.filterFirst(listOf(entry(0, 1), entry(1, 2)), matches)
        assertEquals(listOf(0), filtered.map { it.position })
    }

    @org.junit.jupiter.api.Test
    fun `skips a match with a missing side`() {
        val matches = mapOf(
            1L to match(1, 101, null)
        )
        assertNull(AutoStartHeuristic.selectNext(listOf(entry(0, 1)), matches))
    }

    @org.junit.jupiter.api.Test
    fun `skips a match whose player is in a blocking match`() {
        val blocking = match(99, 101, 999, tableId = 5)
        val matches = mapOf(
            99L to blocking,
            1L to match(1, 101, 102)
        )
        assertNull(AutoStartHeuristic.selectNext(listOf(entry(0, 1)), matches))
    }

    @org.junit.jupiter.api.Test
    fun `skips an entry behind an impossible entry that shares a player`() {
        // entry at position 0 is impossible (missing side) and shares player 101 with the entry at position 1
        val matches = mapOf(
            1L to match(1, 101, null),
            2L to match(2, 101, 102)
        )
        assertNull(AutoStartHeuristic.selectNext(listOf(entry(0, 1), entry(1, 2)), matches))
    }

    @org.junit.jupiter.api.Test
    fun `still picks a later entry that shares no player with an impossible one`() {
        val matches = mapOf(
            1L to match(1, 101, null),
            2L to match(2, 201, 202)
        )
        val next = AutoStartHeuristic.selectNext(listOf(entry(0, 1), entry(1, 2)), matches)
        assertEquals(listOf(2L), next!!.matchIds)
    }

    @org.junit.jupiter.api.Test
    fun `a queued match with no table is not blocking`() {
        val m = match(1, 101, 102)
        m.queue()
        assertTrue(!m.isBlocking)
    }
}
