package de.ttt.management.tournament.domain

import java.util.*

interface MatchListRepository {
    fun findAll(): List<MatchList>
    fun findById(uuid: String): Optional<MatchList>
    fun save(entry: MatchList): MatchList
    fun deleteById(uuid: String): Boolean
    fun deleteAll()
}
