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
        winnerSideId = 1L
    }

    @Test
    fun `completes a match and records the winner`() {
        val match = match()
        match.complete(threeNil)

        assertEquals(MatchState.Completed, match.state)
        assertMatch(match) { completedThreeNil() }
    }

    @Test
    fun `a doubles match stores the winning side, not one of its players`() {
        val match = TournamentMatch(
            id = 1L,
            team1 = listOf(TournamentPlayer(id = 1L), TournamentPlayer(id = 2L)),
            team2 = listOf(TournamentPlayer(id = 3L), TournamentPlayer(id = 4L)),
            side1Id = 100001L,
            side2Id = 100002L
        )
        match.complete(listOf(SetResult(5, 11), SetResult(5, 11), SetResult(5, 11)))

        assertEquals(100002L, match.winnerSideId)
        assertEquals(listOf(3L, 4L), match.winner.map { it.id })
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
            winnerSideId = 2L
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
    fun `a freed match is over and waits for its result`() {
        val match = match()
        match.start(now = now)
        match.free()

        assertEquals(MatchState.Finished, match.state)
        assertMatch(match) {
            isPlayed = true
            startTime = now
        }
    }

    @Test
    fun `entering the result of a freed match completes it`() {
        val match = match()
        match.start(now = now)
        match.free()
        match.complete(threeNil)

        assertEquals(MatchState.Completed, match.state)
        assertMatch(match) {
            completedThreeNil()
            startTime = now
        }
    }

    @Test
    fun `a walkover is played without a result and sets the walkover flag`() {
        val match = match()
        match.start(now = now)
        match.enterResult(listOf(SetResult(11, 5)))
        match.walkover()

        assertEquals(MatchState.Walkover, match.state)
        assertMatch(match) {
            isPlayed = true
            isKampflos = true
            startTime = now
        }
    }

    @Test
    fun `takes back a walkover to the open state`() {
        val match = match()
        match.walkover()
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
        // played again from the start: the old result is gone
        assertMatch(match) {}
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
        assertMatch(match) {}
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
            startTime = now
        }
    }

    // --- a group on two tables ------------------------------------------------------------

    @Test
    fun `a waiting match gets a second table`() {
        val match = match()
        match.assign(tableId = 7, now = now)
        match.assignSecondTable(8)

        assertEquals(MatchState.OnTable, match.state)
        assertMatch(match) {
            tableId = 7
            secondTableId = 8
            startTime = now
        }
    }

    @Test
    fun `only a match waiting at another table gets a second table`() {
        assertFailsWith<IllegalArgumentException> { match().assignSecondTable(8) }

        val started = match().apply { start(tableId = 7, now = now) }
        assertFailsWith<IllegalArgumentException> { started.assignSecondTable(8) }

        val waiting = match().apply { assign(tableId = 7, now = now) }
        assertFailsWith<IllegalArgumentException> { waiting.assignSecondTable(7) }
    }

    @Test
    fun `starting at the second table takes the match off the first`() {
        val match = match()
        match.assign(tableId = 7, now = now)
        match.assignSecondTable(8)
        match.start(tableId = 8, now = now)

        assertMatch(match) {
            tableId = 8
            isPlaying = true
            startTime = now
        }
    }

    @Test
    fun `starting at the first table takes the match off the second`() {
        val match = match()
        match.assign(tableId = 7, now = now)
        match.assignSecondTable(8)
        match.start(now = now)

        assertMatch(match) {
            tableId = 7
            isPlaying = true
            startTime = now
        }
    }

    @Test
    fun `a match at two tables is only started at one of them`() {
        val match = match().apply { assign(tableId = 7, now = now); assignSecondTable(8) }
        assertFailsWith<IllegalArgumentException> { match.start(tableId = 9, now = now) }
    }

    @Test
    fun `a match at two tables leaves one of them and waits at the other`() {
        val offFirst = match().apply { assign(tableId = 7, now = now); assignSecondTable(8); leaveOneTable(7) }
        assertMatch(offFirst) { tableId = 8; startTime = now }

        val offSecond = match().apply { assign(tableId = 7, now = now); assignSecondTable(8); leaveOneTable(8) }
        assertMatch(offSecond) { tableId = 7; startTime = now }
    }

    @Test
    fun `a match at one table cannot leave it this way`() {
        val match = match().apply { assign(tableId = 7, now = now) }
        assertFailsWith<IllegalArgumentException> { match.leaveOneTable(7) }

        val atTwo = match().apply { assign(tableId = 7, now = now); assignSecondTable(8) }
        assertFailsWith<IllegalArgumentException> { atTwo.leaveOneTable(9) }
    }

    @Test
    fun `finishing a match at two tables frees both`() {
        val match = match().apply { assign(tableId = 7, now = now); assignSecondTable(8) }
        match.takeBack()

        assertMatch(match) {}
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

    // --- knockout: the winner moves on (legacy writeNextKoMatch) ---------------------------

    private fun knockoutMatch(nr: Int, matchTypeId: Long = 3L, groupId: Long? = KNOCKOUT_GROUP_ID) = TournamentMatch(
        id = nr.toLong(),
        team1 = listOf(TournamentPlayer(id = 1L)),
        team2 = listOf(TournamentPlayer(id = 2L)),
        side1Id = 1L,
        side2Id = 2L,
        matchType = TournamentMatchType(id = matchTypeId),
        groupId = groupId,
        nr = nr
    )

    @Test
    fun `the winners of two neighbouring knockout matches meet in the round before`() {
        assertEquals(2001, knockoutMatch(3001).nextKnockoutMatchNr)
        assertEquals(2001, knockoutMatch(3002).nextKnockoutMatchNr)
        assertEquals(2002, knockoutMatch(3003).nextKnockoutMatchNr)
        assertEquals(2002, knockoutMatch(3004).nextKnockoutMatchNr)
        assertEquals(4008, knockoutMatch(5016, matchTypeId = 5L).nextKnockoutMatchNr)
        assertEquals(1001, knockoutMatch(2002, matchTypeId = 2L).nextKnockoutMatchNr)
    }

    @Test
    fun `every knockout match type from Halbfinale to Runde 0 moves its winner on`() {
        (2L..8L).forEach { assertEquals(1001, knockoutMatch(2001, matchTypeId = it).nextKnockoutMatchNr, "match type $it") }
    }

    @Test
    fun `nothing moves on from the final, a group match or another match type`() {
        assertEquals(null, knockoutMatch(1001, matchTypeId = 1L).nextKnockoutMatchNr)
        assertEquals(null, knockoutMatch(9, matchTypeId = 9L).nextKnockoutMatchNr)
        assertEquals(null, knockoutMatch(3001, matchTypeId = 10L).nextKnockoutMatchNr)
        assertEquals(null, knockoutMatch(3001, groupId = 1L).nextKnockoutMatchNr)
        assertEquals(null, knockoutMatch(3001, groupId = null).nextKnockoutMatchNr)
        assertEquals(null, knockoutMatch(3001).apply { matchType = null }.nextKnockoutMatchNr)
        assertEquals(null, knockoutMatch(3001).apply { nr = null }.nextKnockoutMatchNr)
    }

    @Test
    fun `the winner of an odd numbered match becomes Side 1 of the next match`() {
        val previous = knockoutMatch(3001).apply { complete(threeNil) }
        val next = TournamentMatch(id = 10L, matchType = TournamentMatchType(id = 2L), groupId = KNOCKOUT_GROUP_ID, nr = 2001, side2Id = 7L, team2 = listOf(TournamentPlayer(id = 7L)))

        next.takeWinnerOf(previous)

        assertEquals(1L, next.side1Id)
        assertEquals(listOf(TournamentPlayer(id = 1L)), next.team1)
        assertEquals(7L, next.side2Id)
        assertEquals(listOf(TournamentPlayer(id = 7L)), next.team2)
    }

    @Test
    fun `the winner of an even numbered match becomes Side 2 of the next match`() {
        val previous = knockoutMatch(3004).apply { complete(listOf(SetResult(5, 11), SetResult(7, 11), SetResult(3, 11))) }
        val next = TournamentMatch(id = 10L, nr = 2002, side1Id = 7L, team1 = listOf(TournamentPlayer(id = 7L)))

        next.takeWinnerOf(previous)

        assertEquals(7L, next.side1Id)
        assertEquals(2L, next.side2Id)
        assertEquals(listOf(TournamentPlayer(id = 2L)), next.team2)
    }

    @Test
    fun `a doubles winner moves on as its double, with both players`() {
        val double = listOf(TournamentPlayer(id = 1L), TournamentPlayer(id = 2L))
        val previous = knockoutMatch(3001).apply {
            team1 = double
            team2 = listOf(TournamentPlayer(id = 3L), TournamentPlayer(id = 4L))
            side1Id = 100001L
            side2Id = 100002L
            complete(threeNil)
        }
        val next = TournamentMatch(id = 10L, nr = 2001)

        next.takeWinnerOf(previous)

        assertEquals(100001L, next.side1Id)
        assertEquals(double, next.team1)
        assertEquals(null, next.side2Id)
    }

    @Test
    fun `a winner overwrites the Side it moves into`() {
        val previous = knockoutMatch(3001).apply { complete(threeNil) }
        val next = TournamentMatch(id = 10L, nr = 2001, side1Id = 9L, team1 = listOf(TournamentPlayer(id = 9L)))

        next.takeWinnerOf(previous)

        assertEquals(1L, next.side1Id)
    }

    @Test
    fun `only the winner of a match leading to this one moves on into it`() {
        val previous = knockoutMatch(3001).apply { complete(threeNil) }
        assertFailsWith<IllegalArgumentException> { TournamentMatch(id = 10L, nr = 2002).takeWinnerOf(previous) }
        assertFailsWith<IllegalArgumentException> { TournamentMatch(id = 10L, nr = 2001).takeWinnerOf(knockoutMatch(3001)) }
        val final = knockoutMatch(1001, matchTypeId = 1L).apply { complete(threeNil) }
        assertFailsWith<IllegalArgumentException> { TournamentMatch(id = 10L, nr = 1).takeWinnerOf(final) }
    }
}
