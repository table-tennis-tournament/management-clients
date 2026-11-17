package de.ttt.management.tournament.domain

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import java.time.LocalDateTime

class TournamentMatchTest {

    private val now = LocalDateTime.of(2026, 11, 16, 10, 0)

    private fun match() = TournamentMatch(
        id = 1L,
        team1 = listOf(TournamentPlayer(id = 1L, firstName = "A")),
        team2 = listOf(TournamentPlayer(id = 2L, firstName = "B"))
    )

    private val threeNil = listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3))

    /**
     * Compares every field of [actual] with a fresh [match] changed by [expected], so a transition
     * that touches a field it should not breaks the test. `state` and `callNumber` are derived from
     * these fields.
     */
    private fun assertMatch(actual: TournamentMatch, expected: TournamentMatch.() -> Unit) {
        assertThat(actual).usingRecursiveComparison().isEqualTo(match().apply(expected))
    }

    /** The fields [TournamentMatch.complete] writes for [threeNil]. */
    private fun TournamentMatch.completedThreeNil() {
        sets = threeNil
        sets1 = 3
        sets2 = 0
        balls1 = 33
        balls2 = 15
        resultRaw = "11=5,11=7,11=3"
        result = "3 : 0"
        isPlayed = true
        winner = team1.first()
    }

    @Test
    fun `completes a match and records the winner`() {
        val match = match()
        match.complete(threeNil)

        assertEquals(MatchState.Completed, match.state)
        assertMatch(match) { completedThreeNil() }
    }

    @Test
    fun `records player two as winner when they reach three sets`() {
        val sets = listOf(SetResult(5, 11), SetResult(7, 11), SetResult(11, 8), SetResult(9, 11))
        val match = match()
        match.complete(sets)

        assertMatch(match) {
            this.sets = sets
            sets1 = 1
            sets2 = 3
            balls1 = 32
            balls2 = 41
            resultRaw = "5=11,7=11,11=8,9=11"
            result = "1 : 3"
            isPlayed = true
            winner = team2.first()
        }
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
        val sets = listOf(SetResult(11, 5), SetResult(11, 7))
        val match = match()
        match.enterResult(sets)

        assertEquals(MatchState.Started, match.state)
        assertMatch(match) {
            this.sets = sets
            sets1 = 2
            sets2 = 0
            balls1 = 22
            balls2 = 12
            resultRaw = "11=5,11=7"
            result = "2 : 0"
            isPlaying = true
        }
    }

    @Test
    fun `an undecided set counts for neither side`() {
        val sets = listOf(SetResult(11, 5), SetResult(0, 0))
        val match = match()
        match.enterResult(sets)

        assertMatch(match) {
            this.sets = sets
            sets1 = 1
            sets2 = 0
            balls1 = 11
            balls2 = 5
            resultRaw = "11=5,0=0"
            result = "1 : 0"
            isPlaying = true
        }
    }

    @Test
    fun `starts a match`() {
        val match = match()
        match.start(now = now)

        assertEquals(MatchState.Started, match.state)
        assertMatch(match) {
            isPlaying = true
            startTime = now
        }
    }

    @Test
    fun `rejects starting a completed match`() {
        val match = match()
        match.complete(listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3)))

        assertFailsWith<IllegalArgumentException> { match.start(now = now) }
    }

    @Test
    fun `rejects starting a match that is already playing`() {
        val match = match()
        match.start(now = now)

        assertFailsWith<IllegalArgumentException> { match.start(now = now) }
    }

    @Test
    fun `frees a match as a walkover`() {
        val match = match()
        match.start(now = now)
        match.free()

        assertEquals(MatchState.Finished, match.state)
        assertMatch(match) {
            isPlayed = true
            isKampflos = true
            startTime = now
        }
    }

    @Test
    fun `takes back a walkover to the open state`() {
        val match = match()
        match.free()
        match.takeBack()

        assertEquals(MatchState.Open, match.state)
        assertMatch(match) {}
    }

    @Test
    fun `takes a match back to the open state`() {
        val match = match()
        match.complete(threeNil)
        match.takeBack()

        assertEquals(MatchState.Open, match.state)
        // Pins current behaviour: the old result stays on the match (see test-improvement-plan finding 8).
        assertMatch(match) {
            completedThreeNil()
            isPlayed = false
            winner = null
        }
    }

    @Test
    fun `queues a match and dequeues it back to open`() {
        val match = match()
        match.queue()

        assertEquals(MatchState.InQueue, match.state)
        assertMatch(match) { waitingList = true }

        match.dequeue()
        assertEquals(MatchState.Open, match.state)
        assertMatch(match) {}
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
        match.start(now = now)

        assertEquals(MatchState.Started, match.state)
        assertMatch(match) {
            isPlaying = true
            startTime = now
        }
    }

    @Test
    fun `announces the first call`() {
        val match = match()
        match.call()

        assertMatch(match) { callState = CallState.FirstCall }
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
        match.assign(tableId = 7, now = now)

        assertTrue(match.isBlocking)
        assertEquals(MatchState.OnTable, match.state)
        assertMatch(match) {
            tableId = 7
            startTime = now
        }
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
    fun `isPlayable is true when no blocking match shares a player`() {
        val match = match()
        val blockingOthers = TournamentMatch(
            id = 2L,
            team1 = listOf(TournamentPlayer(id = 8L)),
            team2 = listOf(TournamentPlayer(id = 9L)),
            tableId = 7L
        )
        val openWithSamePlayers = TournamentMatch(
            id = 3L,
            team1 = listOf(TournamentPlayer(id = 1L)),
            team2 = listOf(TournamentPlayer(id = 2L))
        )

        assertTrue(match.isPlayableAgainst(listOf(match, blockingOthers, openWithSamePlayers)))
    }

    @Test
    fun `isPlayable is false when a blocking match shares a player of side B`() {
        val match = match()
        val blocking = TournamentMatch(
            id = 2L,
            team1 = listOf(TournamentPlayer(id = 9L)),
            team2 = listOf(TournamentPlayer(id = 2L)),
            tableId = 7L
        )

        assertFalse(match.isPlayableAgainst(listOf(match, blocking)))
    }

    @Test
    fun `isPlayable is false when a side is missing`() {
        val match = TournamentMatch(id = 1L, team1 = listOf(TournamentPlayer(id = 1L)), team2 = emptyList())
        assertFalse(match.isPlayableAgainst(listOf(match)))
    }

    @Test
    fun `starting on a table puts the match on that table`() {
        val match = match()
        match.start(tableId = 4L, now = now)

        assertEquals(MatchState.Started, match.state)
        assertMatch(match) {
            tableId = 4L
            isPlaying = true
            startTime = now
        }
    }

    @Test
    fun `taking a match back leaves the table and clears the call`() {
        val match = match()
        match.assign(tableId = 7, now = now)
        match.call()
        match.start(now = now)
        match.takeBack()

        assertEquals(MatchState.Open, match.state)
        // startTime is kept from the start
        assertMatch(match) { startTime = now }
    }

    @Test
    fun `completing a match leaves the table`() {
        val match = match()
        match.assign(tableId = 7, now = now)
        match.complete(threeNil)

        assertFalse(match.isBlocking)
        assertMatch(match) {
            completedThreeNil()
            startTime = now
        }
    }

    @Test
    fun `freeing a match leaves the table`() {
        val match = match()
        match.assign(tableId = 7, now = now)
        match.free()

        assertEquals(MatchState.Finished, match.state)
        assertMatch(match) {
            isPlayed = true
            isKampflos = true
            startTime = now
        }
    }

    @Test
    fun `the call number counts the announced calls`() {
        val match = match()
        match.assign(tableId = 7, now = now)
        assertEquals(0, match.callNumber)

        match.call()
        assertEquals(1, match.callNumber)

        match.callAgain()
        match.callAgain()
        assertEquals(3, match.callNumber)
    }
}
