package de.ttt.management.tournament.domain
import java.util.*
interface MatchOnTableRepository {
    fun findAll(): List<MatchOnTable>
    fun findById(id: String): Optional<MatchOnTable>
    fun save(matchOnTable: MatchOnTable): MatchOnTable
    fun deleteByMatchId(matchId: Long)
    fun deleteAll()
}
