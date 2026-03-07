package de.ttt.management.tournament.domain
import java.time.LocalDateTime
import java.util.*
interface TournamentMatchRepository {
    fun findAll(): List<TournamentMatch>
    fun findById(id: Long): Optional<TournamentMatch>
    fun findByTypeId(typeId: Long): List<TournamentMatch>
    fun findOpen(): List<TournamentMatch>
    fun findOpenByTypeId(typeId: Long): List<TournamentMatch>
    fun findPlayed(): List<TournamentMatch>
    fun findPlayedByTypeId(typeId: Long): List<TournamentMatch>
    fun isMatchPlaying(matchId: Long): Boolean
    fun startMatch(matchId: Long, tableId: Long, startTime: LocalDateTime): Int
    fun stopMatch(matchId: Long): Int
    fun freeMatch(matchId: Long): Int
    fun takeBackMatch(matchId: Long): Int
    fun updateResult(matchId: Long, resultRaw: String, sets1: Int, sets2: Int): Int
    fun deleteById(id: Long): Int
    fun deleteByTypeId(typeId: Long): Int
}
