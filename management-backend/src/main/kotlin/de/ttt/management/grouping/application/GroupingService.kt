package de.ttt.management.grouping.application

import de.ttt.management.grouping.domain.GroupMatchRepository
import de.ttt.management.grouping.domain.GroupStandingsCalculator
import de.ttt.management.grouping.domain.PlayerPerGroupRepository
import de.ttt.management.tournament.MatchCompleted
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
    fun onMatchCompleted(event: MatchCompleted) {
        try {
            val match = groupMatchRepository.findByMatchId(event.matchId) ?: return
            val groupId = match.groupId ?: return
            updateStandings(groupId)
        } catch (e: Exception) {
            log.warn("Failed to update group standings after match completion", e)
        }
    }

    @Transactional
    fun updateStandings(groupId: Long) {
        val players = playerPerGroupRepository.findByGroupId(groupId)
        if (players.isEmpty()) return

        val matches = groupMatchRepository.findByGroupId(groupId)
        if (matches.isEmpty() || matches.any { !it.isPlayed }) return

        GroupStandingsCalculator.compute(players, matches)
            .forEach { playerPerGroupRepository.save(it) }
    }

    private companion object {
        val log = LoggerFactory.getLogger(GroupingService::class.java)
    }
}
