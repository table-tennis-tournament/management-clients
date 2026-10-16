package de.ttt.management.tournament.domain

import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class TournamentMatchTest {

    private fun match() = TournamentMatch(
        id = 1L,
        player1 = TournamentPlayer(id = 1L, firstName = "A"),
        player2 = TournamentPlayer(id = 2L, firstName = "B")
    )

    @org.junit.jupiter.api.Test
    fun `completes a match and records the winner`() {
        val match = match()
        match.complete("11:5,11:7,11:3", sets1 = 3, sets2 = 0)

        assertEquals(MatchState.Completed, match.state)
        assertTrue(match.isPlayed)
        assertFalse(match.isPlaying)
        assertEquals(1L, match.winner?.id)
        assertEquals(3, match.sets1)
        assertEquals(0, match.sets2)
    }

    @org.junit.jupiter.api.Test
    fun `records player two as winner when they reach three sets`() {
        val match = match()
        match.complete("5:11,7:11,11:8,9:11", sets1 = 1, sets2 = 3)

        assertEquals(2L, match.winner?.id)
    }

    @org.junit.jupiter.api.Test
    fun `rejects a result where neither side reached three sets`() {
        assertFailsWith<IllegalArgumentException> {
            match().complete("11:5,11:5", sets1 = 2, sets2 = 0)
        }
    }

    @org.junit.jupiter.api.Test
    fun `rejects an equal number of sets`() {
        assertFailsWith<IllegalArgumentException> {
            match().complete("x", sets1 = 2, sets2 = 2)
        }
    }
}
