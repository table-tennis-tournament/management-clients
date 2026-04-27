package de.ttt.management.registration

import de.ttt.management.registration.domain.match.Match
import de.ttt.management.registration.domain.match.MatchRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class MatchService(
    private val matchRepository: MatchRepository
) {

    fun getAllMatches(): List<Match> = matchRepository.findAll()

    fun getMatch(id: Long): Match? = matchRepository.findById(id).orElse(null)

    fun getOpenMatches(): List<Match> {
        return matchRepository.findAll().filter { !it.isPlayed }
    }

    @Transactional
    fun saveResult(id: Long, resultRaw: String, sets1: Int, sets2: Int): Boolean {
        val match = matchRepository.findById(id).orElse(null) ?: return false
        match.resultRaw = resultRaw
        match.sets1 = sets1
        match.sets2 = sets2
        match.isPlayed = true
        match.isPlaying = false
        matchRepository.save(match)
        return true
    }
}
