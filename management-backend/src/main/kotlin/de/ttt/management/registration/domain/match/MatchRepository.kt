package de.ttt.management.registration.domain.match

import java.util.*

interface MatchRepository {
    fun findAll(): List<Match>
    fun findById(id: Long): Optional<Match>
    fun save(match: Match): Match
    fun deleteAll()
}
