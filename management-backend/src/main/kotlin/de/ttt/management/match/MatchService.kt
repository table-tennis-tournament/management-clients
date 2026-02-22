package de.ttt.management.match

import de.ttt.management.registration.domain.match.MatchRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class MatchService(
    private val matchRepository: MatchRepository,
    private val matchTypeRepository: MatchTypeRepository,
    private val playGroupRepository: PlayGroupRepository
) {

    fun getAllMatches(): List<Match> = matchRepository.findAll()

    fun getMatch(id: Long): Match? = matchRepository.findById(id).orElse(null)

    fun getOpenMatches(): List<Match> {
        return matchRepository.findAll().filter { !it.isPlayed && !it.isPlaying }
    }

    @Transactional
    fun setResult(matchId: Long, resultRaw: String, sets1: Int, sets2: Int): Boolean {
        val match = matchRepository.findById(matchId).orElse(null) ?: return false
        match.resultRaw = resultRaw
        match.sets1 = sets1
        match.sets2 = sets2
        match.isPlayed = true
        match.isPlaying = false
        matchRepository.save(match)
        return true
    }
}
