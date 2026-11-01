package de.ttt.management.tournament.domain

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class TournamentMatchTest {

    private fun match() = TournamentMatch(
        id = 1L,
        team1 = listOf(TournamentPlayer(id = 1L, firstName = "A")),
        team2 = listOf(TournamentPlayer(id = 2L, firstName = "B"))
    )

    @Test
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

    @Test
    fun `records player two as winner when they reach three sets`() {
        val match = match()
        match.complete(listOf(SetResult(5, 11), SetResult(7, 11), SetResult(11, 8), SetResult(9, 11)))

        assertEquals(2L, match.winner?.id)
        assertEquals(1, match.sets1)
        assertEquals(3, match.sets2)
    }

    @Test
    fun `rejects a result where neither side reached three sets`() {
        assertFailsWith<IllegalArgumentException> {
            match().complete(listOf(SetResult(11, 5), SetResult(11, 5)))
        }
    }

    @Test
    fun `rejects a result where both sides have an equal number of sets`() {
        val sixSets = listOf(
            SetResult(11, 5), SetResult(11, 5), SetResult(11, 5),
            SetResult(5, 11), SetResult(5, 11), SetResult(5, 11)
        )
        assertFailsWith<IllegalArgumentException> { match().complete(sixSets) }
    }

    @Test
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

    @Test
    fun `starts a match`() {
        val match = match()
        match.start()

        assertEquals(MatchState.Started, match.state)
        assertTrue(match.isPlaying)
    }

    @Test
    fun `rejects starting a completed match`() {
        val match = match()
        match.complete(listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))

        assertFailsWith<IllegalArgumentException> { match.start() }
    }

    @Test
    fun `rejects starting a match that is already playing`() {
        val match = match()
        match.start()

        assertFailsWith<IllegalArgumentException> { match.start() }
    }

    @Test
    fun `frees a match as a walkover`() {
        val match = match()
        match.start()
        match.free()

        assertTrue(match.isPlayed)
        assertTrue(match.isKampflos)
        assertFalse(match.isPlaying)
        assertEquals(MatchState.Finished, match.state)
        assertEquals(null, match.winner)
    }

    @Test
    fun `takes back a walkover to the open state`() {
        val match = match()
        match.free()
        match.takeBack()

        assertFalse(match.isPlayed)
        assertFalse(match.isKampflos)
        assertEquals(MatchState.Open, match.state)
    }

    @Test
    fun `takes a match back to the open state`() {
        val match = match()
        match.complete(listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))
        match.takeBack()

        assertFalse(match.isPlayed)
        assertFalse(match.isPlaying)
        assertEquals(MatchState.Open, match.state)
    }

    @Test
    fun `queues a match and dequeues it back to open`() {
        val match = match()
        match.queue()

        assertEquals(MatchState.InQueue, match.state)

        match.dequeue()
        assertEquals(MatchState.Open, match.state)
    }

    @Test
    fun `rejects queueing a completed match`() {
        val match = match()
        match.complete(listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))

        assertFailsWith<IllegalArgumentException> { match.queue() }
    }

    @Test
    fun `starting a queued match clears the queue state`() {
        val match = match()
        match.queue()
        match.start()

        assertEquals(MatchState.Started, match.state)
    }

    @Test
    fun `announces the first call`() {
        val match = match()
        match.call()

        assertEquals(CallState.FirstCall, match.callState)
    }

    @Test
    fun `advances the call from first to second to third`() {
        val match = match()
        match.call()
        match.callAgain()
        assertEquals(CallState.SecondCall, match.callState)

        match.callAgain()
        assertEquals(CallState.ThirdCall, match.callState)
    }

    @Test
    fun `does not advance the call beyond the third call`() {
        val match = match()
        match.call()
        match.callAgain()
        match.callAgain()
        match.callAgain()

        assertEquals(CallState.ThirdCall, match.callState)
    }

    @Test
    fun `rejects calling a completed match`() {
        val match = match()
        match.complete(listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))

        assertFailsWith<IllegalArgumentException> { match.call() }
    }

    @Test
    fun `an assigned match is blocking`() {
        val match = match()
        match.assign(tableId = 7)

        assertTrue(match.isBlocking)
        assertEquals(MatchState.OnTable, match.state)
    }

    @Test
    fun `isPlayable is false when another match blocks one of its players`() {
        val match = match()
        val blocking = TournamentMatch(
            id = 2L,
            team1 = listOf(TournamentPlayer(id = 1L)),
            team2 = listOf(TournamentPlayer(id = 9L)),
            tableId = 7L
        )

        assertFalse(match.isPlayableAgainst(listOf(match, blocking)))
    }

    @Test
    fun `isPlayable is false when a side is missing`() {
        val match = TournamentMatch(id = 1L, team1 = listOf(TournamentPlayer(id = 1L)), team2 = emptyList())
        assertFalse(match.isPlayableAgainst(listOf(match)))
    }
}
