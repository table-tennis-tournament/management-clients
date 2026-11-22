package de.ttt.management.grouping.application

import de.ttt.management.grouping.domain.GroupMatchRepository
import de.ttt.management.grouping.domain.GroupStandingsCalculator
import de.ttt.management.grouping.domain.PlayerPerGroup
import de.ttt.management.grouping.domain.PlayerPerGroupRepository
import de.ttt.management.tournament.MatchCompleted
import de.ttt.management.tournament.MatchResultUpdated
import de.ttt.management.tournament.MatchTakenBack
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class GroupingService(
    private val playerPerGroupRepository: PlayerPerGroupRepository,
    private val groupMatchRepository: GroupMatchRepository
) {

    @EventListener
    fun on(event: MatchCompleted) = updateStandingsOfMatches(listOf(event.matchId))

    /** A correction of a result. */
    @EventListener
    fun on(event: MatchResultUpdated) = updateStandingsOfMatches(listOf(event.matchId))

    /** Taking back a match clears its result. */
    @EventListener
    fun on(event: MatchTakenBack) = updateStandingsOfMatches(event.matchIds)

    private fun updateStandingsOfMatches(matchIds: List<Long>) {
        runCatching {
            matchIds.mapNotNull { groupMatchRepository.findByMatchId(it)?.groupId }.distinct().forEach(::updateStandings)
        }.onFailure { log.warn("Failed to update the group standings of matches {}", matchIds, it) }
    }

    /**
     * Ranks the players of the group by the matches that have a result, after every result change, so the
     * places are current while the group is still being played. mktt draws the knockout stage from them.
     */
    @Transactional
    fun updateStandings(groupId: Long) {
        val players = playerPerGroupRepository.findByGroupId(groupId)
        if (players.isEmpty()) return

        GroupStandingsCalculator.compute(players, groupMatchRepository.findByGroupId(groupId))
            .forEach { playerPerGroupRepository.save(it) }
    }

    /**
     * The standings of every group of discipline [disciplineId], ordered by group, each group by place. A side
     * not ranked yet (place 0) comes last.
     */
    fun getStandings(disciplineId: Long): List<GroupStandings> =
        playerPerGroupRepository.findByDisciplineId(disciplineId)
            .groupBy { it.groupId }
            .toSortedMap()
            .map { (groupId, rows) ->
                GroupStandings(
                    groupId = groupId,
                    rows = rows.sortedWith(compareBy<PlayerPerGroup>({ it.position == 0 }, { it.position }, { it.playerId }))
                        .map(StandingRow::of)
                )
            }

    private companion object {
        val log: Logger = LoggerFactory.getLogger(GroupingService::class.java)
    }
}

/** The standings of one group. */
data class GroupStandings(
    val groupId: Long,
    val rows: List<StandingRow>
)

/** A side's place in its group: `sideId` is the match side id (a player id, or `100000 + doub_id`). */
data class StandingRow(
    val sideId: Long,
    val position: Int,
    val matchesWon: Int,
    val matchesLost: Int,
    val setsWon: Int,
    val setsLost: Int,
    val pointsWon: Int,
    val pointsLost: Int
) {
    companion object {
        fun of(standing: PlayerPerGroup) = StandingRow(
            sideId = standing.playerId,
            position = standing.position,
            matchesWon = standing.matchesWon,
            matchesLost = standing.matchesLost,
            setsWon = standing.setsWon,
            setsLost = standing.setsLost,
            pointsWon = standing.pointsWon,
            pointsLost = standing.pointsLost
        )
    }
}
