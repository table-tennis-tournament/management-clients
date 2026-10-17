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
        match.complete(listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))

        assertEquals(MatchState.Completed, match.state)
        assertTrue(match.isPlayed)
        assertFalse(match.isPlaying)
        assertEquals(1L, match.winner?.id)
        assertEquals(3, match.sets1)
        assertEquals(0, match.sets2)
        assertEquals(33, match.balls1)
        assertEquals(15, match.balls2)
        assertEquals("11=5,11=7,11=3", match.resultRaw)
        assertEquals("3 : 0", match.result)
    }

    @org.junit.jupiter.api.Test
    fun `records player two as winner when they reach three sets`() {
        val match = match()
        match.complete(listOf(SetResult(5, 11), SetResult(7, 11), SetResult(11, 8), SetResult(9, 11)))

        assertEquals(2L, match.winner?.id)
        assertEquals(1, match.sets1)
        assertEquals(3, match.sets2)
    }

    @org.junit.jupiter.api.Test
    fun `rejects a result where neither side reached three sets`() {
        assertFailsWith<IllegalArgumentException> {
            match().complete(listOf(SetResult(11, 5), SetResult(11, 5)))
        }
    }

    @org.junit.jupiter.api.Test
    fun `rejects a result where both sides have an equal number of sets`() {
        val sixSets = listOf(
            SetResult(11, 5), SetResult(11, 5), SetResult(11, 5),
            SetResult(5, 11), SetResult(5, 11), SetResult(5, 11)
        )
        assertFailsWith<IllegalArgumentException> { match().complete(sixSets) }
    }

    @org.junit.jupiter.api.Test
    fun `enters an interim result and puts the match into playing mode`() {
        val match = match()
        match.enterResult(listOf(SetResult(11, 5), SetResult(11, 7)))

        assertTrue(match.isPlaying)
        assertFalse(match.isPlayed)
        assertEquals(MatchState.Started, match.state)
        assertEquals(2, match.sets1)
        assertEquals(0, match.sets2)
        assertEquals(22, match.balls1)
        assertEquals(12, match.balls2)
    }

    @org.junit.jupiter.api.Test
    fun `starts a match`() {
        val match = match()
        match.start()

        assertEquals(MatchState.Started, match.state)
        assertTrue(match.isPlaying)
    }

    @org.junit.jupiter.api.Test
    fun `rejects starting a completed match`() {
        val match = match()
        match.complete(listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))

        assertFailsWith<IllegalArgumentException> { match.start() }
    }

    @org.junit.jupiter.api.Test
    fun `rejects starting a match that is already playing`() {
        val match = match()
        match.start()

        assertFailsWith<IllegalArgumentException> { match.start() }
    }

    @org.junit.jupiter.api.Test
    fun `frees a match`() {
        val match = match()
        match.start()
        match.free()

        assertTrue(match.isPlayed)
        assertFalse(match.isPlaying)
        assertEquals(null, match.winner)
    }

    @org.junit.jupiter.api.Test
    fun `takes a match back to the open state`() {
        val match = match()
        match.complete(listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))
        match.takeBack()

        assertFalse(match.isPlayed)
        assertFalse(match.isPlaying)
        assertEquals(MatchState.Open, match.state)
    }

    @org.junit.jupiter.api.Test
    fun `queues a match and dequeues it back to open`() {
        val match = match()
        match.queue()

        assertEquals(MatchState.InQueue, match.state)

        match.dequeue()
        assertEquals(MatchState.Open, match.state)
    }

    @org.junit.jupiter.api.Test
    fun `rejects queueing a completed match`() {
        val match = match()
        match.complete(listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))

        assertFailsWith<IllegalArgumentException> { match.queue() }
    }

    @org.junit.jupiter.api.Test
    fun `starting a queued match clears the queue state`() {
        val match = match()
        match.queue()
        match.start()

        assertEquals(MatchState.Started, match.state)
    }
}
