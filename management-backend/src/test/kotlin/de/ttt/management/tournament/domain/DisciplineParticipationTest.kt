package de.ttt.management.tournament.domain

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class DisciplineParticipationTest {

    private val group = 1L
    private val singles = 10L
    private val other = 20L

    private fun open(side1: Long, side2: Long, type: Long = singles, groupId: Long? = group) =
        ParticipationMatch(type, groupId, side1, side2, hasResult = false)

    private fun played(side1: Long, side2: Long, type: Long = singles, groupId: Long? = group) =
        ParticipationMatch(type, groupId, side1, side2, hasResult = true)

    private fun place(side: Long, position: Int, qualifying: Int = 2, groupId: Long = group, type: Long = singles) =
        GroupPlace(side, groupId, type, position, qualifying)

    private fun typesOf(
        matches: List<ParticipationMatch> = emptyList(),
        places: List<GroupPlace> = emptyList(),
        registrations: List<Registration> = emptyList(),
        teams: Map<Long, List<Long>> = emptyMap()
    ) = DisciplineParticipation.typeIdsByPlayer(ParticipationFacts(matches, places, registrations, teams))

    @Test
    fun `a player with a match without a result is in`() {
        assertEquals(mapOf(1L to listOf(singles), 2L to listOf(singles)), typesOf(matches = listOf(open(1, 2))))
    }

    @Test
    fun `every player of a group that is not finished is in, even without an open match of their own`() {
        val matches = listOf(played(1, 2), played(1, 3), played(1, 4), open(2, 3), played(2, 4), played(3, 4))
        val places = listOf(place(1, 1), place(2, 2), place(3, 3), place(4, 4))
        assertEquals((1L..4L).associateWith { listOf(singles) }, typesOf(matches, places))
    }

    @Test
    fun `in a finished group the qualifying places are in, the others are out`() {
        val matches = listOf(played(1, 2), played(1, 3), played(2, 3))
        val places = listOf(place(1, 1), place(2, 2), place(3, 3))
        assertEquals(mapOf(1L to listOf(singles), 2L to listOf(singles)), typesOf(matches, places))
    }

    @Test
    fun `a group with one qualifying place sends only its winner on`() {
        val matches = listOf(played(1, 2))
        val places = listOf(place(1, 1, qualifying = 1), place(2, 2, qualifying = 1))
        assertEquals(mapOf(1L to listOf(singles)), typesOf(matches, places))
    }

    @Test
    fun `once a discipline has a knockout stage only matches without a result count`() {
        val matches = listOf(
            played(1, 2), played(3, 4, groupId = 2),
            played(1, 3, groupId = KNOCKOUT_GROUP_ID),
            open(1, 5, groupId = KNOCKOUT_GROUP_ID)
        )
        // player 3 finished first in group 2 but lost in the knockout stage
        val places = listOf(place(1, 1), place(2, 2), place(3, 1, groupId = 2), place(4, 2, groupId = 2))
        assertEquals(mapOf(1L to listOf(singles), 5L to listOf(singles)), typesOf(matches, places))
    }

    @Test
    fun `a registered player is in a discipline without matches only`() {
        val registrations = listOf(Registration(1, singles), Registration(1, other), Registration(2, singles))
        val matches = listOf(played(1, 3, groupId = KNOCKOUT_GROUP_ID))
        assertEquals(mapOf(1L to listOf(other)), typesOf(matches = matches, registrations = registrations))
    }

    @Test
    fun `a player is in a doubles discipline while their team is`() {
        val teams = mapOf(100001L to listOf(1L, 2L), 100002L to listOf(3L, 4L))
        val matches = listOf(open(100001, 100002, type = other, groupId = KNOCKOUT_GROUP_ID), open(1, 5))
        assertEquals(
            mapOf(1L to listOf(singles, other), 2L to listOf(other), 3L to listOf(other), 4L to listOf(other), 5L to listOf(singles)),
            typesOf(matches = matches, teams = teams)
        )
    }

}
