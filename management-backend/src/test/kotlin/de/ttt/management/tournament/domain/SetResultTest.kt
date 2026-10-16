package de.ttt.management.tournament.domain

import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class SetResultTest {

    @org.junit.jupiter.api.Test
    fun `accepts a set won at eleven points`() {
        val set = SetResult(11, 5)
        assertEquals(11, set.pointsPlayer1)
        assertEquals(5, set.pointsPlayer2)
    }

    @org.junit.jupiter.api.Test
    fun `accepts a deuce set won by two points`() {
        SetResult(12, 10)
    }

    @org.junit.jupiter.api.Test
    fun `accepts an undecided set`() {
        SetResult(0, 0)
    }

    @org.junit.jupiter.api.Test
    fun `rejects a set won below eleven points`() {
        assertFailsWith<IllegalArgumentException> { SetResult(9, 5) }
    }

    @org.junit.jupiter.api.Test
    fun `rejects a set not won by two points`() {
        assertFailsWith<IllegalArgumentException> { SetResult(11, 10) }
    }

    @org.junit.jupiter.api.Test
    fun `rejects negative points`() {
        assertFailsWith<IllegalArgumentException> { SetResult(-1, 0) }
    }

    @org.junit.jupiter.api.Test
    fun `round-trips the resultRaw format`() {
        val sets = listOf(SetResult(11, 5), SetResult(11, 7), SetResult(11, 3))
        val raw = SetResult.toResultRaw(sets)
        assertEquals("11=5,11=7,11=3", raw)
        assertEquals(sets, SetResult.fromResultRaw(raw))
    }

    @org.junit.jupiter.api.Test
    fun `parses an empty resultRaw to no sets`() {
        assertEquals(emptyList(), SetResult.fromResultRaw(null))
        assertEquals(emptyList(), SetResult.fromResultRaw(""))
    }
}
