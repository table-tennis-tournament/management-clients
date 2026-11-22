package de.ttt.management.grouping.application

import de.ttt.management.grouping.domain.GroupMatchRepository
import de.ttt.management.grouping.domain.GroupStandingsCalculator
import de.ttt.management.grouping.domain.PlayerPerGroupRepository
import de.ttt.management.tournament.MatchCompleted
import de.ttt.management.tournament.MatchResultUpdated
import de.ttt.management.tournament.MatchTakenBack
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

    private companion object {
        val log = LoggerFactory.getLogger(GroupingService::class.java)
    }
}
