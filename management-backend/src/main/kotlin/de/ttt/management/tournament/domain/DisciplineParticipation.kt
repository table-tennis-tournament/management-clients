package de.ttt.management.tournament.domain

/**
 * Which disciplines a player is still "in": the squares in the discipline colors next to a player's name.
 *
 * Sides are mktt's side ids, as in `matches.matc_play1_id`: a player id, or `100000 + doub_id` for a doubles
 * team. A player is in a doubles discipline when their team is. Per side and discipline:
 *
 * - a discipline without matches: the side is in when it is registered for it;
 * - a discipline with a knockout stage (any match of [KNOCKOUT_GROUP_ID]): the side is in while it has a match
 *   without a result, so a knockout loss takes it out;
 * - otherwise (the group stage): the side is in while it has a match without a result, while its group is not
 *   finished, or when it finished its group in a qualifying place.
 */
object DisciplineParticipation {

    /** The qualifying places of a group whose `Grou_QualPos` is not a number. */
    const val DEFAULT_QUALIFYING_PLACES = 2

    /** The discipline ids each player is in, sorted, by player id. Players in no discipline are left out. */
    fun typeIdsByPlayer(facts: ParticipationFacts): Map<Long, List<Long>> {
        val matchesByType = facts.matches.groupBy { it.typeId }
        val knockoutTypes = facts.matches.filter { it.groupId == KNOCKOUT_GROUP_ID }.map { it.typeId }.toSet()
        val openSides: Set<Pair<Long, Long>> = facts.matches.filter { !it.hasResult }
            .flatMap { m -> listOfNotNull(m.side1Id, m.side2Id).map { it to m.typeId } }
            .toSet()
        val finishedGroups = facts.matches.filter { it.groupId != null && it.groupId != KNOCKOUT_GROUP_ID }
            .groupBy { it.groupId }
            .filterValues { matches -> matches.all { it.hasResult } }
            .keys

        val inGroupStage = facts.groupPlaces
            .filter { it.typeId in matchesByType && it.typeId !in knockoutTypes }
            .filter { it.groupId !in finishedGroups || (it.position in 1..it.qualifyingPlaces) }
            .map { it.sideId to it.typeId }
        val inWithoutMatches = facts.registrations.filter { it.typeId !in matchesByType }.map { it.sideId to it.typeId }

        return (openSides + inGroupStage + inWithoutMatches)
            .flatMap { (side, type) -> playersOf(side, facts.teamPlayers).map { it to type } }
            .groupBy({ it.first }, { it.second })
            .mapValues { (_, types) -> types.distinct().sorted() }
    }

    private fun playersOf(sideId: Long, teamPlayers: Map<Long, List<Long>>): List<Long> =
        if (sideId >= DOUBLES_SIDE_OFFSET) teamPlayers[sideId].orEmpty() else listOf(sideId)

    /** mktt's side id of a doubles team is `100000 + doub_id`. */
    const val DOUBLES_SIDE_OFFSET = 100000L
}

/** Everything [DisciplineParticipation] decides on, for the whole tournament. */
data class ParticipationFacts(
    val matches: List<ParticipationMatch>,
    val groupPlaces: List<GroupPlace>,
    val registrations: List<Registration>,
    /** The players of each doubles side, by side id (`100000 + doub_id`). */
    val teamPlayers: Map<Long, List<Long>>
)

/** A match as far as participation is concerned. A match without a winner has no result yet. */
data class ParticipationMatch(
    val typeId: Long,
    val groupId: Long?,
    val side1Id: Long?,
    val side2Id: Long?,
    val hasResult: Boolean
)

/** A side's place in its group (`playerpergroup`) and how many places of the group go through (`Grou_QualPos`). */
data class GroupPlace(
    val sideId: Long,
    val groupId: Long,
    val typeId: Long,
    val position: Int,
    val qualifyingPlaces: Int
)

/** A side registered for a discipline: a player (`typeperplayer`) or a doubles team (`doubles`). */
data class Registration(
    val sideId: Long,
    val typeId: Long
)

/** Loads the [ParticipationFacts] of the whole tournament. */
interface ParticipationFactsRepository {
    fun load(): ParticipationFacts
}
