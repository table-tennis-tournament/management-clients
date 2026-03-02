package de.ttt.management.registration.domain.match

import java.util.*

interface MatchTypeRepository {
    fun findAll(): List<MatchType>
    fun findById(id: Long): Optional<MatchType>
    fun save(matchType: MatchType): MatchType
    fun deleteAll()
}
