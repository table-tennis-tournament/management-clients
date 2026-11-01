package de.ttt.management.tournament.application

import de.ttt.management.tournament.AutoStartState
import de.ttt.management.tournament.MatchListChanged
import de.ttt.management.tournament.domain.MatchList
import de.ttt.management.tournament.domain.MatchListRepository
import de.ttt.management.tournament.domain.MatchState
import de.ttt.management.tournament.domain.TournamentMatchRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service("tournamentMatchListService")
class MatchListService(
    private val matchListRepository: MatchListRepository,
    private val matchRepository: TournamentMatchRepository,
    private val eventPublisher: ApplicationEventPublisher
) : AutoStartState {

    @Volatile
    private var matchListActive = false

    fun getAllMatchList(): List<MatchList> = matchListRepository.findAll()

    @Transactional
    fun addMatchToList(matchIds: List<Long>, asGroup: Long?, position: Int): MatchList {
        val existingIds = matchListRepository.findAll().flatMap { it.matchIds }.toSet()
        val newIds = matchIds
            .filter { it !in existingIds }
            .filter { id -> matchRepository.findById(id).map { it.state == MatchState.Open }.orElse(false) }

        val entries = matchListRepository.findAll().toMutableList()
        entries.filter { it.position >= position }.forEach { it.position += 1 }
        entries.forEach { matchListRepository.save(it) }

        val newEntry = MatchList(UUID.randomUUID().toString(), newIds, asGroup, position)
        matchListRepository.save(newEntry)

        newIds.forEach { matchRepository.setWaitingList(it, true) }
        publishChange()
        return newEntry
    }

    @Transactional
    fun deleteMatchFromList(uuid: String): Boolean {
        val entry = matchListRepository.findById(uuid).orElse(null) ?: return false
        matchListRepository.deleteById(uuid)
        entry.matchIds.forEach { matchRepository.setWaitingList(it, false) }
        publishChange()
        return true
    }

    fun getNextMatchFromList(): MatchList? =
        if (matchListActive) matchListRepository.findAll().minByOrNull { it.position } else null

    fun setMatchListActive(active: Boolean) {
        this.matchListActive = active
    }

    fun isActive(): Boolean = matchListActive

    override fun isAutoStartActive(): Boolean = matchListActive

    @Transactional
    fun moveMatchListEntry(uuid: String, newPosition: Int): Boolean {
        val entry = matchListRepository.findById(uuid).orElse(null) ?: return false
        val others = matchListRepository.findAll()
            .filter { it.uuid != uuid }
            .sortedBy { it.position }
            .toMutableList()

        val clamped = newPosition.coerceIn(0, others.size)
        others.add(clamped, entry)
        others.forEachIndexed { index, e ->
            e.position = index
            matchListRepository.save(e)
        }
        publishChange()
        return true
    }

    @Transactional
    fun removeMatchFromList(matchId: Long) {
        val entries = matchListRepository.findAll().filter { matchId in it.matchIds }
        entries.forEach { entry ->
            val remaining = entry.matchIds.filter { it != matchId }
            if (remaining.isEmpty()) {
                matchListRepository.deleteById(entry.uuid)
            } else {
                matchListRepository.save(entry.copy(matchIds = remaining))
            }
        }
        matchRepository.setWaitingList(matchId, false)
        if (entries.isNotEmpty()) {
            publishChange()
        }
    }

    private fun publishChange() {
        eventPublisher.publishEvent(
            MatchListChanged(
                matchListRepository.findAll().map {
                    MatchListChanged.Entry(it.uuid, it.matchIds, it.asGroup, it.position)
                }
            )
        )
    }
}
