package de.ttt.management.table

import java.util.*

interface MatchOnTableRepository {
    fun findAll(): List<MatchOnTable>
    fun findById(id: UUID): Optional<MatchOnTable>
    fun save(matchOnTable: MatchOnTable): MatchOnTable
    fun deleteByMatchId(matchId: Long)
    fun deleteAll()
}
