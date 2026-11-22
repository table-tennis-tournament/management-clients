package de.ttt.management.tournament.application

import de.ttt.management.tournament.AutoStartState
import de.ttt.management.tournament.MatchListChanged
import de.ttt.management.tournament.domain.MatchList
import de.ttt.management.tournament.domain.MatchListRepository
import de.ttt.management.tournament.domain.MatchState
import de.ttt.management.tournament.domain.TournamentMatch
import de.ttt.management.tournament.domain.TournamentMatchRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.util.IdGenerator

@Service("tournamentMatchListService")
class MatchListService(
    private val matchListRepository: MatchListRepository,
    private val matchRepository: TournamentMatchRepository,
    private val eventPublisher: ApplicationEventPublisher,
    private val idGenerator: IdGenerator
) : AutoStartState {

    @Volatile
    private var matchListActive = false

    fun getAllMatchList(): List<MatchList> = matchListRepository.findAll()

    /** Queues the Open matches of [matchIds] as one entry at [position]; `null` when none of them can be queued. */
    @Transactional
    fun addMatchToList(matchIds: List<Long>, asGroup: Long?, position: Int): MatchList? {
        val existingIds = matchListRepository.findAll().flatMap { it.matchIds }.toSet()
        val newIds = matchIds
            .filter { it !in existingIds }
            .filter { id -> matchRepository.findById(id).orElse(null)?.state == MatchState.Open }
        if (newIds.isEmpty()) return null

        val entries = matchListRepository.findAll().toMutableList()
        entries.filter { it.position >= position }.forEach { it.position += 1 }
        entries.forEach { matchListRepository.save(it) }

        val newEntry = MatchList(idGenerator.generateId().toString(), newIds, asGroup, position)
        matchListRepository.save(newEntry)

        newIds.forEach { id -> updateMatch(id) { it.queue() } }
        publishChange(changed = newIds)
        return newEntry
    }

    @Transactional
    fun deleteMatchFromList(uuid: String): Boolean {
        val entry = matchListRepository.findById(uuid).orElse(null) ?: return false
        matchListRepository.deleteById(uuid)
        entry.matchIds.forEach { id -> updateMatch(id) { it.dequeue() } }
        publishChange(changed = entry.matchIds)
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

    /**
     * Removes [matchId] from every queue entry. Called after the match has been assigned or
     * started, which already cleared its queue flag.
     */
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
        if (entries.isNotEmpty()) {
            publishChange(changed = listOf(matchId))
        }
    }

    private fun updateMatch(matchId: Long, transition: (TournamentMatch) -> Unit) {
        val match = matchRepository.findById(matchId).orElse(null) ?: return
        transition(match)
        matchRepository.save(match)
    }

    /** Publishes the whole queue; [changed] names matches that just left or joined it. */
    private fun publishChange(changed: List<Long> = emptyList()) {
        val entries = matchListRepository.findAll().map {
            MatchListChanged.Entry(it.uuid, it.matchIds, it.asGroup, it.position)
        }
        val matchIds = (entries.flatMap { it.matchIds } + changed).distinct()
        val typeIds = matchIds.mapNotNull { id -> matchRepository.findById(id).orElse(null)?.typeId }.distinct()
        eventPublisher.publishEvent(MatchListChanged(entries, matchIds, typeIds))
    }
}
