package de.ttt.management.tournament.domain

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class AutoStartHeuristicTest {

    private fun match(id: Long, p1: Long?, p2: Long?, tableId: Long? = null) = TournamentMatch(
        id = id,
        team1 = p1?.let { listOf(TournamentPlayer(id = it)) } ?: emptyList(),
        team2 = p2?.let { listOf(TournamentPlayer(id = it)) } ?: emptyList(),
        tableId = tableId
    )

    private fun entry(position: Int, vararg matchIds: Long) =
        MatchList(uuid = "entry-$position", matchIds = matchIds.toList(), position = position)

    @Test
    fun `returns null for an empty queue`() {
        assertNull(AutoStartHeuristic.selectNext(emptyList(), emptyMap()))
    }

    @Test
    fun `picks the earliest position when all matches are playable`() {
        val matches = mapOf(
            1L to match(1, 101, 102),
            2L to match(2, 201, 202)
        )
        val next = AutoStartHeuristic.selectNext(listOf(entry(1, 2), entry(0, 1)), matches)
        assertEquals(listOf(1L), next!!.matchIds)
    }

    @Test
    fun `filterFirst skips entries sharing a player with an earlier entry`() {
        val matches = mapOf(
            1L to match(1, 101, 102),
            2L to match(2, 101, 103)
        )
        val filtered = AutoStartHeuristic.filterFirst(listOf(entry(0, 1), entry(1, 2)), matches)
        assertEquals(listOf(0), filtered.map { it.position })
    }

    @Test
    fun `skips a match with a missing side`() {
        val matches = mapOf(
            1L to match(1, 101, null)
        )
        assertNull(AutoStartHeuristic.selectNext(listOf(entry(0, 1)), matches))
    }

    @Test
    fun `skips a match whose player is in a blocking match`() {
        val blocking = match(99, 101, 999, tableId = 5)
        val matches = mapOf(
            99L to blocking,
            1L to match(1, 101, 102)
        )
        assertNull(AutoStartHeuristic.selectNext(listOf(entry(0, 1)), matches))
    }

    @Test
    fun `skips an entry behind an impossible entry that shares a player`() {
        // entry at position 0 is impossible (missing side) and shares player 101 with the entry at position 1
        val matches = mapOf(
            1L to match(1, 101, null),
            2L to match(2, 101, 102)
        )
        assertNull(AutoStartHeuristic.selectNext(listOf(entry(0, 1), entry(1, 2)), matches))
    }

    @Test
    fun `still picks a later entry that shares no player with an impossible one`() {
        val matches = mapOf(
            1L to match(1, 101, null),
            2L to match(2, 201, 202)
        )
        val next = AutoStartHeuristic.selectNext(listOf(entry(0, 1), entry(1, 2)), matches)
        assertEquals(listOf(2L), next!!.matchIds)
    }

    @Test
    fun `a queued match with no table is not blocking`() {
        val m = match(1, 101, 102)
        m.queue()
        assertTrue(!m.isBlocking)
    }

    @Test
    fun `skips an entry whose match is unknown`() {
        assertNull(AutoStartHeuristic.selectNext(listOf(entry(0, 42)), emptyMap()))
    }

    @Test
    fun `starts a grouped entry only when every match of it is playable`() {
        val matches = mapOf(
            1L to match(1, 101, 102),
            2L to match(2, 103, null)
        )
        assertNull(AutoStartHeuristic.selectNext(listOf(entry(0, 1, 2)), matches))

        val playable = matches + (2L to match(2, 103, 104))
        assertEquals(listOf(1L, 2L), AutoStartHeuristic.selectNext(listOf(entry(0, 1, 2)), playable)!!.matchIds)
    }

    @Test
    fun `filterFirst compares every player of a doubles side`() {
        val doubles = TournamentMatch(
            id = 1,
            team1 = listOf(TournamentPlayer(id = 101), TournamentPlayer(id = 102)),
            team2 = listOf(TournamentPlayer(id = 103), TournamentPlayer(id = 104))
        )
        val matches = mapOf(
            1L to doubles,
            2L to match(2, 104, 201), // shares the second player of side B
            3L to match(3, 202, 203)
        )
        val filtered = AutoStartHeuristic.filterFirst(listOf(entry(0, 1), entry(1, 2), entry(2, 3)), matches)
        assertEquals(listOf(0, 2), filtered.map { it.position })
    }

    @Test
    fun `orders the queue by position before skipping entries that share a player`() {
        val matches = mapOf(
            1L to match(1, 101, 102),
            2L to match(2, 101, 103)
        )
        // listed out of order: position 0 must win the shared player
        val next = AutoStartHeuristic.selectNext(listOf(entry(1, 2), entry(0, 1)), matches)
        assertEquals(listOf(1L), next!!.matchIds)
    }
}
